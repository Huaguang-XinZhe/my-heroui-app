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
import {
  batchAddMailAccounts,
  getUserById,
  createUser,
} from "@/lib/supabase/client";
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
 * 重构后的业务逻辑：
 * 1. 验证并获取/创建用户
 * 2. 预处理：填充默认值
 * 3. 并发处理：协议检测和 token 刷新
 * 4. 批量添加到数据库
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: BatchAddAccountRequest = await request.json();

    // 验证请求数据
    const validationError = validateBatchMailInfos(body.mailInfos);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // 验证用户ID或从请求中推断
    let userId = body.user_id;
    if (!userId && body.mailInfos.length > 0) {
      // 如果没有提供用户ID，使用第一个邮箱作为用户ID（假设是OAuth2用户）
      userId = body.mailInfos[0].email;
    }

    if (!userId) {
      return NextResponse.json({ error: "缺少用户ID" }, { status: 400 });
    }

    console.log(
      `开始批量添加邮箱账户: ${body.mailInfos.length} 个账户，用户: ${userId}，refreshNeeded: ${body.refreshNeeded}`,
    );

    // 1. 确保用户存在
    let user = await getUserById(userId);
    if (!user) {
      // 尝试创建用户（假设是OAuth2类型）
      const created = await createUser({
        id: userId,
        nickname: userId.includes("@") ? userId.split("@")[0] : userId,
        user_type: userId.includes("@") ? "oauth2-google" : "card_key",
      });

      if (!created) {
        return NextResponse.json({ error: "用户创建失败" }, { status: 500 });
      }

      user = await getUserById(userId);
    }

    if (!user) {
      return NextResponse.json(
        { error: "用户不存在且创建失败" },
        { status: 500 },
      );
    }

    // 2. 预处理：填充默认值
    const processedMailInfos = fillDefaultValues(body.mailInfos);

    // 3. 并发处理：协议检测和 token 刷新
    const processingResults = await performConcurrentProcessing(
      processedMailInfos,
      body.refreshNeeded,
    );

    // 3.1. 将协议检测和 token 刷新的结果更新到 mailInfos 中
    const updatedMailInfos = updateMailInfosWithProcessingResults(
      processedMailInfos,
      processingResults,
    );

    // 调试日志：显示协议类型更新情况
    for (const mailInfo of updatedMailInfos) {
      console.log(
        `最终邮箱协议类型 ${mailInfo.email}: ${mailInfo.protocolType}`,
      );
    }

    // 4. 使用新的数据库函数批量添加
    const dbResult = await batchAddMailAccounts(updatedMailInfos, userId);

    const elapsed = Date.now() - startTime;
    console.log(
      `批量添加邮箱账户完成 (${elapsed}ms) - 来自其他用户: ${dbResult.fromOthers.length}，错误: ${dbResult.errors.length}，成功: ${dbResult.successes.length}`,
    );

    const response: BatchAddMailAccountResponse = {
      fromOthers: dbResult.fromOthers,
      errors: dbResult.errors,
      successes: dbResult.successes,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`批量添加邮箱账户失败 (${elapsed}ms):`, error);
    return NextResponse.json(
      {
        error: "批量添加邮箱账户失败",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 },
    );
  }
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
    return results;
  }

  try {
    const batchResult = await goMailApiService.batchDetectProtocolType({
      mailInfos,
    });

    if (batchResult.success && batchResult.data?.results) {
      for (const result of batchResult.data.results) {
        const detectionResult: ProtocolDetectionResult = {
          isBanned: false,
        };

        if (result.error) {
          // 检查错误信息中是否包含封禁关键词
          const hasBanKeywords = checkForBanKeywords(result.error);
          detectionResult.error = result.error;
          detectionResult.isBanned = hasBanKeywords;
        } else {
          detectionResult.protocolType = result.protocolType;
        }

        results.set(result.email, detectionResult);
      }
    }
  } catch (error) {
    console.error("批量协议检测失败:", error);
    // 对所有邮箱返回错误结果
    for (const mailInfo of mailInfos) {
      results.set(mailInfo.email, {
        error: "协议检测失败",
        isBanned: false,
      });
    }
  }

  return results;
}

/**
 * 执行 Token 刷新
 */
async function executeTokenRefresh(
  mailInfos: MailInfo[],
): Promise<Map<string, TokenRefreshResult>> {
  const results = new Map<string, TokenRefreshResult>();

  if (mailInfos.length === 0) {
    return results;
  }

  try {
    const batchResult = await goMailApiService.batchRefreshToken(mailInfos);

    if (batchResult.success && batchResult.data?.results) {
      for (const result of batchResult.data.results) {
        const refreshResult: TokenRefreshResult = {};

        if (result.error) {
          refreshResult.error = result.error;
        } else {
          refreshResult.newRefreshToken = result.newRefreshToken;
        }

        results.set(result.email, refreshResult);
      }
    }
  } catch (error) {
    console.error("批量 Token 刷新失败:", error);
    // 对所有邮箱返回错误结果
    for (const mailInfo of mailInfos) {
      results.set(mailInfo.email, {
        error: "Token 刷新失败",
      });
    }
  }

  return results;
}

/**
 * 将协议检测和 token 刷新的结果更新到 mailInfos 中
 */
function updateMailInfosWithProcessingResults(
  originalMailInfos: MailInfo[],
  processingResults: ProcessingResult[],
): MailInfo[] {
  const updatedMailInfos: MailInfo[] = [];

  for (const mailInfo of originalMailInfos) {
    const processingResult = processingResults.find(
      (result) => result.email === mailInfo.email,
    );

    if (processingResult) {
      // 创建更新后的 mailInfo
      const updatedMailInfo: MailInfo = {
        ...mailInfo,
        protocolType: processingResult.protocolType || mailInfo.protocolType,
        refreshToken: processingResult.refreshToken || mailInfo.refreshToken,
      };
      updatedMailInfos.push(updatedMailInfo);
    } else {
      // 如果没有找到对应的处理结果，使用原始 mailInfo
      updatedMailInfos.push(mailInfo);
    }
  }

  return updatedMailInfos;
}

/**
 * 聚合处理结果
 */
function aggregateProcessingResults(
  originalMailInfos: MailInfo[],
  protocolResults: Map<string, ProtocolDetectionResult>,
  tokenResults: Map<string, TokenRefreshResult>,
): ProcessingResult[] {
  const results: ProcessingResult[] = [];

  for (const mailInfo of originalMailInfos) {
    const email = mailInfo.email;
    const result: ProcessingResult = {
      email,
      isBanned: false,
    };

    // 处理协议检测结果
    const protocolResult = protocolResults.get(email);
    if (protocolResult) {
      if (protocolResult.error) {
        result.error = protocolResult.error;
        result.isBanned = protocolResult.isBanned;
      } else {
        result.protocolType = determineFinalProtocolType(
          mailInfo.protocolType,
          protocolResult.protocolType,
        );
      }
    } else {
      result.protocolType = mailInfo.protocolType || "UNKNOWN";
    }

    // 处理 Token 刷新结果
    const tokenResult = tokenResults.get(email);
    if (tokenResult) {
      if (tokenResult.error) {
        // Token 刷新错误不影响主流程，只记录警告
        console.warn(`Token 刷新失败 ${email}: ${tokenResult.error}`);
        result.refreshToken = mailInfo.refreshToken; // 使用原始 token
      } else {
        result.refreshToken =
          tokenResult.newRefreshToken || mailInfo.refreshToken;
      }
    } else {
      result.refreshToken = mailInfo.refreshToken;
    }

    results.push(result);
  }

  return results;
}
