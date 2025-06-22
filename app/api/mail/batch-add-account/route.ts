import { NextRequest, NextResponse } from "next/server";
import {
  BatchAddAccountRequest,
  BatchAddMailAccountResponse,
  MailInfo,
  ProtocolType,
  FromOthersResult,
  ErrorResult,
  SuccessResult,
} from "@/types/email";
import { goMailApiService } from "@/lib/goMailApi";
import { addMailAccount, logMailOperation } from "@/lib/supabase/emails";
import { emailCacheManager } from "@/lib/emailCacheManager";
import {
  fillDefaultValues,
  validateBatchMailInfos,
  checkForBanKeywords,
  aggregateErrors,
  determineFinalProtocolType,
} from "@/utils/mailUtils";

// 内部处理结果类型
interface ProcessingResult {
  email: string;
  refreshToken?: string;
  protocolType?: ProtocolType;
  error?: string;
  isBanned: boolean;
}

interface ProtocolDetectionResult {
  protocolType?: ProtocolType;
  error?: string;
  isBanned: boolean;
}

interface TokenRefreshResult {
  newRefreshToken?: string;
  error?: string;
}

/**
 * 批量添加邮箱账户
 * POST /api/mail/batch-add-account
 *
 * 完全按照 Kotlin 的业务逻辑实现：
 * 1. 预处理：填充默认值并过滤已存在邮箱
 * 2. 并发处理：协议检测和 token 刷新
 * 3. 分类结果：错误和成功
 * 4. 异步持久化：保存到数据库并更新缓存
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: BatchAddAccountRequest = await request.json();

    // 验证请求数据
    const validationError = validateBatchMailInfos(body.mailInfos);
    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 },
      );
    }

    console.log(
      `开始批量添加邮箱账户: ${body.mailInfos.length} 个账户，refreshNeeded: ${body.refreshNeeded}`,
    );

    // 1. 预处理：填充默认值并过滤已存在邮箱
    const { newMailInfos, fromOthersItems } =
      await preprocessAndFilterMailInfos(body.mailInfos);

    if (newMailInfos.length === 0) {
      console.log("所有邮箱都已存在，跳过批量添加");
      return NextResponse.json({
        fromOthers: fromOthersItems,
        errors: [],
        successes: [],
      });
    }

    // 2. 并发处理：协议检测和 token 刷新
    const processingResults = await performConcurrentProcessing(
      newMailInfos,
      body.refreshNeeded,
    );

    // 3. 分类结果：错误和成功
    const { errorItems, successItems } =
      categorizeProcessingResults(processingResults);

    // 4. 异步持久化：保存到数据库并更新缓存
    scheduleAsyncPersistence(processingResults, newMailInfos, request);

    const elapsed = Date.now() - startTime;
    console.log(
      `批量添加邮箱账户完成 (${elapsed}ms) - 来自别人账户: ${fromOthersItems.length}，错误: ${errorItems.length}，成功: ${successItems.length}`,
    );

    const response: BatchAddMailAccountResponse = {
      fromOthers: fromOthersItems,
      errors: errorItems,
      successes: successItems,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("批量添加邮箱账户失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "服务器内部错误",
      },
      { status: 500 },
    );
  }
}

/**
 * 预处理并过滤邮箱信息：填充默认值并分离已存在的邮箱
 */
async function preprocessAndFilterMailInfos(mailInfos: MailInfo[]): Promise<{
  newMailInfos: MailInfo[];
  fromOthersItems: FromOthersResult[];
}> {
  // 填充默认值（clientId 和 serviceProvider）
  const processedMailInfos = fillDefaultValues(mailInfos);

  const requestEmails = processedMailInfos.map((info) => info.email);
  const { cachedEmails, newEmails } =
    await emailCacheManager.filterCachedEmails(requestEmails);
  const newMailInfos = processedMailInfos.filter((info) =>
    newEmails.includes(info.email),
  );

  // 构建来自别人账户的邮箱列表
  const fromOthersItems: FromOthersResult[] = [];
  for (const email of cachedEmails) {
    const isBanned = await emailCacheManager.isEmailBanned(email);
    fromOthersItems.push({
      email,
      isBanned,
    });
  }

  if (cachedEmails.length > 0) {
    console.log(
      `发现来自别人账户的邮箱: ${cachedEmails.length} 个，其中已封禁: ${fromOthersItems.filter((item) => item.isBanned).length} 个`,
    );
  }

  return { newMailInfos, fromOthersItems };
}

/**
 * 执行并发处理：协议检测和 token 刷新
 */
async function performConcurrentProcessing(
  mailInfos: MailInfo[],
  refreshNeeded: boolean,
): Promise<ProcessingResult[]> {
  console.log("开始并发处理协议检测和 token 刷新");

  // 过滤出没有协议类型的邮件信息
  const mailInfosWithoutProtocol = mailInfos.filter(
    (info) => !info.protocolType,
  );

  // 创建并发任务
  const protocolDetectionPromise = executeProtocolDetection(
    mailInfosWithoutProtocol,
  );
  const tokenRefreshPromise = refreshNeeded
    ? executeTokenRefresh(mailInfos)
    : Promise.resolve(new Map<string, TokenRefreshResult>());

  // 等待所有任务完成
  const [protocolResults, tokenResults] = await Promise.all([
    protocolDetectionPromise,
    tokenRefreshPromise,
  ]);

  console.log(
    `并发任务完成 - 协议检测结果: ${protocolResults.size} 个，token 刷新结果: ${tokenResults.size} 个`,
  );

  // 聚合结果
  return aggregateProcessingResults(mailInfos, protocolResults, tokenResults);
}

/**
 * 执行协议检测
 */
async function executeProtocolDetection(
  mailInfos: MailInfo[],
): Promise<Map<string, ProtocolDetectionResult>> {
  const results = new Map<string, ProtocolDetectionResult>();

  if (mailInfos.length === 0) {
    console.log("跳过协议检测：所有邮箱都已有协议类型");
    return results;
  }

  console.log(`启动协议检测任务: ${mailInfos.length} 个邮箱`);

  try {
    const detectRequest = { mailInfos };
    const detectResponse =
      await goMailApiService.batchDetectProtocolType(detectRequest);

    if (!detectResponse.success || !detectResponse.data) {
      // API 调用失败，返回所有邮箱的失败结果
      mailInfos.forEach((mailInfo) => {
        results.set(mailInfo.email, {
          protocolType: undefined,
          error: `协议检测 API 调用失败: ${detectResponse.error}`,
          isBanned: false,
        });
      });
      return results;
    }

    // 处理成功的响应
    detectResponse.data.results.forEach((result) => {
      const isBanned = checkForBanKeywords(result.error);
      results.set(result.email, {
        protocolType: result.error ? undefined : result.protocolType,
        error: result.error,
        isBanned,
      });
    });
  } catch (error) {
    console.error("协议检测执行失败:", error);
    // 返回所有邮箱的失败结果
    mailInfos.forEach((mailInfo) => {
      results.set(mailInfo.email, {
        protocolType: undefined,
        error: `协议检测执行失败: ${error instanceof Error ? error.message : "未知错误"}`,
        isBanned: false,
      });
    });
  }

  return results;
}

/**
 * 执行 token 刷新
 */
async function executeTokenRefresh(
  mailInfos: MailInfo[],
): Promise<Map<string, TokenRefreshResult>> {
  const results = new Map<string, TokenRefreshResult>();

  console.log(`启动 token 刷新任务: ${mailInfos.length} 个邮箱`);

  try {
    const refreshResponse = await goMailApiService.batchRefreshToken(mailInfos);

    if (!refreshResponse.success || !refreshResponse.data) {
      // API 调用失败，返回所有邮箱的失败结果
      mailInfos.forEach((mailInfo) => {
        results.set(mailInfo.email, {
          newRefreshToken: undefined,
          error: `token 刷新 API 调用失败: ${refreshResponse.error}`,
        });
      });
      return results;
    }

    // 处理成功的响应
    refreshResponse.data.results.forEach((result) => {
      results.set(result.email, {
        newRefreshToken: result.error ? undefined : result.newRefreshToken,
        error: result.error,
      });
    });
  } catch (error) {
    console.error("token 刷新执行失败:", error);
    // 返回所有邮箱的失败结果
    mailInfos.forEach((mailInfo) => {
      results.set(mailInfo.email, {
        newRefreshToken: undefined,
        error: `token 刷新执行失败: ${error instanceof Error ? error.message : "未知错误"}`,
      });
    });
  }

  return results;
}

/**
 * 聚合协议检测和 token 刷新的结果
 */
function aggregateProcessingResults(
  originalMailInfos: MailInfo[],
  protocolResults: Map<string, ProtocolDetectionResult>,
  tokenResults: Map<string, TokenRefreshResult>,
): ProcessingResult[] {
  return originalMailInfos.map((mailInfo) => {
    const protocolResult = protocolResults.get(mailInfo.email);
    const tokenResult = tokenResults.get(mailInfo.email);

    // 检查是否被封禁
    const isBanned = protocolResult?.isBanned === true;

    // 聚合错误信息
    const errors: string[] = [];

    // 处理协议检测错误
    if (protocolResult?.error) {
      errors.push(`协议检测失败: ${protocolResult.error}`);
    }

    // 处理 token 刷新错误
    if (tokenResult?.error) {
      errors.push(`token 刷新失败: ${tokenResult.error}`);
    }

    const finalRefreshToken =
      tokenResult?.newRefreshToken || mailInfo.refreshToken;

    // 确定最终的协议类型
    const finalProtocolType = determineFinalProtocolType(
      mailInfo.protocolType,
      protocolResult?.protocolType,
    );

    // 创建结果
    const aggregatedError = aggregateErrors(errors);

    if (isBanned) {
      console.warn(`邮箱 ${mailInfo.email} 已被封禁`);
    } else if (aggregatedError) {
      console.error(`邮箱 ${mailInfo.email} 处理失败: ${aggregatedError}`);
    } else {
      console.info(
        `邮箱 ${mailInfo.email} 处理成功 - 协议: ${finalProtocolType}`,
      );
    }

    return {
      email: mailInfo.email,
      refreshToken: finalRefreshToken,
      protocolType: finalProtocolType,
      error: aggregatedError,
      isBanned,
    };
  });
}

/**
 * 分类处理结果：将结果分为错误和成功两类
 */
function categorizeProcessingResults(results: ProcessingResult[]): {
  errorItems: ErrorResult[];
  successItems: SuccessResult[];
} {
  const errorItems: ErrorResult[] = [];
  const successItems: SuccessResult[] = [];

  results.forEach((result) => {
    if (result.error) {
      errorItems.push({
        email: result.email,
        isBanned: result.isBanned,
        error: result.error,
      });
      return;
    }

    if (result.refreshToken && result.protocolType) {
      successItems.push({
        email: result.email,
        refreshToken: result.refreshToken,
        protocolType: result.protocolType,
      });
    }
  });

  return { errorItems, successItems };
}

/**
 * 调度异步持久化操作：保存到数据库并更新缓存
 */
function scheduleAsyncPersistence(
  results: ProcessingResult[],
  originalMailInfos: MailInfo[],
  request: NextRequest,
) {
  // 筛选需要保存的邮箱：包括成功的和被封禁的
  const accountsToSave = results.filter(
    (result) => !result.error || result.isBanned,
  );

  if (accountsToSave.length === 0) {
    console.log("没有需要保存的邮箱账户");
    return;
  }

  // 异步执行持久化操作
  Promise.resolve().then(async () => {
    try {
      // 准备数据
      const mailInfosToSave = prepareMailInfosForSaving(
        accountsToSave,
        originalMailInfos,
      );
      const emailStatusMap = buildEmailStatusMap(accountsToSave);

      // 保存到数据库
      await saveAccountsToDatabase(mailInfosToSave);

      // 更新缓存
      updateEmailCache(emailStatusMap);

      // 记录操作日志
      await logOperations(results, request);

      console.log("异步持久化操作完成");
    } catch (error) {
      console.error("异步持久化操作失败:", error);
    }
  });
}

/**
 * 准备要保存的邮件信息
 */
function prepareMailInfosForSaving(
  accountsToSave: ProcessingResult[],
  originalMailInfos: MailInfo[],
): MailInfo[] {
  const originalInfoMap = new Map(
    originalMailInfos.map((info) => [info.email, info]),
  );

  return accountsToSave.map((result) => {
    const originalInfo = originalInfoMap.get(result.email)!;
    return {
      ...originalInfo,
      refreshToken: result.refreshToken || originalInfo.refreshToken,
      protocolType: result.protocolType || originalInfo.protocolType,
    };
  });
}

/**
 * 构建邮箱状态映射
 */
function buildEmailStatusMap(
  accountsToSave: ProcessingResult[],
): Record<string, boolean> {
  const statusMap: Record<string, boolean> = {};

  accountsToSave.forEach((result) => {
    statusMap[result.email] = result.isBanned;
  });

  return statusMap;
}

/**
 * 保存账户到数据库
 */
async function saveAccountsToDatabase(
  mailInfosToSave: MailInfo[],
): Promise<void> {
  for (const mailInfo of mailInfosToSave) {
    await addMailAccount(mailInfo);
  }
  console.log(
    `批量保存邮箱账户到数据库成功 - 插入数据: ${mailInfosToSave.length} 个`,
  );
}

/**
 * 更新邮箱缓存
 */
function updateEmailCache(emailStatusMap: Record<string, boolean>): void {
  emailCacheManager.addEmailsWithStatus(emailStatusMap);
  console.log(
    `缓存更新完成，新增 ${Object.keys(emailStatusMap).length} 个邮箱状态`,
  );
}

/**
 * 记录操作日志
 */
async function logOperations(
  results: ProcessingResult[],
  request: NextRequest,
): Promise<void> {
  const clientIp =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  for (const result of results) {
    let status: "success" | "error" | "partial" = "success";
    let errorMessage: string | undefined;

    if (result.error) {
      status = "error";
      errorMessage = result.error;
    } else if (result.isBanned) {
      status = "partial";
      errorMessage = "邮箱已被封禁";
    }

    await logMailOperation(
      result.email,
      "batch_add",
      status,
      status === "success" ? 1 : 0,
      errorMessage,
      clientIp,
      userAgent,
    );
  }
}
