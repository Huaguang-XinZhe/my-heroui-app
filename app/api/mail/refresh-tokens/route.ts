import { NextRequest, NextResponse } from "next/server";
import { goMailApiService } from "@/lib/goMailApi";
import {
  getAccountsNeedingTokenRefresh,
  batchUpdateRefreshTokens,
} from "@/lib/supabase/mailAccounts";

/**
 * 批量刷新 refresh_token 的请求接口
 */
interface BatchRefreshTokenRequest {
  // 指定需要刷新的邮箱列表（可选，如果不提供则刷新所有未刷新的账户）
  specificEmails?: string[];
}

/**
 * 批量刷新 refresh_token 的响应接口
 */
interface BatchRefreshTokenResponse {
  success: boolean;
  message: string;
  totalProcessed: number;
  successCount: number;
  failedCount: number;
  details: {
    refreshedTokens: Array<{ email: string; success: boolean }>;
    errors: Array<{ email: string; error: string }>;
  };
}

/**
 * 批量刷新现有数据库中的 refresh_token
 * POST /api/mail/refresh-tokens
 *
 * 专门处理 refresh_token_updated_at 为 null 的邮箱账户
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: BatchRefreshTokenRequest = await request.json();
    const { specificEmails = [] } = body;

    console.log(
      `开始批量刷新 refresh_token - 指定邮箱: ${specificEmails.length}个`,
    );

    // 1. 获取需要刷新的邮箱账户
    let accountsToRefresh;
    if (specificEmails.length > 0) {
      // 如果指定了邮箱列表，只获取这些邮箱中 refresh_token_updated_at 为 null 的
      const allUnrefreshedAccounts = await getAccountsNeedingTokenRefresh();
      accountsToRefresh = allUnrefreshedAccounts.filter((account) =>
        specificEmails.includes(account.email),
      );
    } else {
      // 获取所有 refresh_token_updated_at 为 null 的账户
      accountsToRefresh = await getAccountsNeedingTokenRefresh();
    }

    if (accountsToRefresh.length === 0) {
      return NextResponse.json({
        success: true,
        message: "没有需要刷新的账户",
        totalProcessed: 0,
        successCount: 0,
        failedCount: 0,
        details: {
          refreshedTokens: [],
          errors: [],
        },
      } as BatchRefreshTokenResponse);
    }

    console.log(
      `找到 ${accountsToRefresh.length} 个账户需要刷新 refresh_token`,
    );

    // 2. 调用 GoMailAPI 的并发批量刷新 API
    const refreshResult =
      await goMailApiService.batchRefreshToken(accountsToRefresh);

    if (!refreshResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "批量刷新 refresh_token 失败",
          error: refreshResult.error,
        },
        { status: 500 },
      );
    }

    // 3. 处理刷新结果
    const updates: Array<{ email: string; newRefreshToken: string }> = [];
    const refreshDetails: Array<{ email: string; success: boolean }> = [];
    const refreshErrors: Array<{ email: string; error: string }> = [];

    for (const result of refreshResult.data?.results || []) {
      if (result.error) {
        refreshErrors.push({
          email: result.email,
          error: result.error,
        });
        refreshDetails.push({
          email: result.email,
          success: false,
        });
      } else if (result.newRefreshToken) {
        updates.push({
          email: result.email,
          newRefreshToken: result.newRefreshToken,
        });
        refreshDetails.push({
          email: result.email,
          success: true,
        });
      } else {
        refreshErrors.push({
          email: result.email,
          error: "未获得新的 refresh_token",
        });
        refreshDetails.push({
          email: result.email,
          success: false,
        });
      }
    }

    // 4. 批量更新数据库中的 refresh_token 和 refresh_token_updated_at
    let updateResult = {
      successCount: 0,
      failedCount: 0,
      errors: [] as Array<{ email: string; error: string }>,
    };

    if (updates.length > 0) {
      updateResult = await batchUpdateRefreshTokens(updates);
    }

    // 5. 合并所有错误信息
    const allErrors = [...refreshErrors, ...updateResult.errors];

    const elapsed = Date.now() - startTime;
    const totalProcessed = accountsToRefresh.length;
    const finalSuccessCount = updateResult.successCount;
    const finalFailedCount = totalProcessed - finalSuccessCount;

    console.log(
      `批量刷新 refresh_token 完成 (${elapsed}ms) - 总计: ${totalProcessed}, 成功: ${finalSuccessCount}, 失败: ${finalFailedCount}`,
    );

    const response: BatchRefreshTokenResponse = {
      success: true,
      message: `批量刷新完成，成功 ${finalSuccessCount} 个，失败 ${finalFailedCount} 个`,
      totalProcessed,
      successCount: finalSuccessCount,
      failedCount: finalFailedCount,
      details: {
        refreshedTokens: refreshDetails,
        errors: allErrors,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`批量刷新 refresh_token 失败 (${elapsed}ms):`, error);

    return NextResponse.json(
      {
        success: false,
        message: "批量刷新 refresh_token 失败",
        error: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 },
    );
  }
}

/**
 * 获取需要刷新 refresh_token 的账户列表（refresh_token_updated_at 为 null）
 * GET /api/mail/refresh-tokens
 */
export async function GET(request: NextRequest) {
  try {
    const accountsToRefresh = await getAccountsNeedingTokenRefresh();

    return NextResponse.json({
      success: true,
      accountsCount: accountsToRefresh.length,
      accounts: accountsToRefresh.map((account) => ({
        email: account.email,
        protocolType: account.protocolType,
        serviceProvider: account.serviceProvider,
      })),
    });
  } catch (error) {
    console.error("获取需要刷新 token 的账户列表失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "服务器内部错误",
      },
      { status: 500 },
    );
  }
}
