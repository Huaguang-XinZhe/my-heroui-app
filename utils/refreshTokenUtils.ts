import { NEXT_API_CONFIG, buildNextApiUrl } from "@/config/api";

/**
 * 批量刷新 refresh_token 的请求接口
 */
export interface BatchRefreshTokenRequest {
  // 指定需要刷新的邮箱列表（可选，如果不提供则刷新所有未刷新的账户）
  specificEmails?: string[];
}

/**
 * 批量刷新 refresh_token 的响应接口
 */
export interface BatchRefreshTokenResponse {
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
 * 获取需要刷新 refresh_token 的账户列表的响应接口
 */
export interface GetUnrefreshedAccountsResponse {
  success: boolean;
  accountsCount: number;
  accounts: Array<{
    email: string;
    protocolType: string;
    serviceProvider: string;
  }>;
}

/**
 * 单个邮箱详细信息接口
 */
export interface EmailAccountDetail {
  email: string;
  service_provider: string;
  protocol_type: string;
  refresh_token: string | null;
  refresh_token_updated_at: string | null;
  is_banned: boolean;
  created_at: string;
}

/**
 * 单个邮箱刷新结果接口
 */
export interface SingleRefreshResult {
  success: boolean;
  email: string;
  beforeRefresh: {
    refresh_token: string | null;
    refresh_token_updated_at: string | null;
  };
  afterRefresh: {
    refresh_token: string | null;
    refresh_token_updated_at: string | null;
  };
  tokenChanged: boolean;
  error?: string;
}

/**
 * 调用批量刷新 refresh_token API
 */
export async function batchRefreshTokens(
  request: BatchRefreshTokenRequest,
): Promise<{
  success: boolean;
  data?: BatchRefreshTokenResponse;
  error?: string;
}> {
  try {
    const response = await fetch(
      buildNextApiUrl(NEXT_API_CONFIG.ENDPOINTS.MAIL.REFRESH_TOKENS),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data: BatchRefreshTokenResponse = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("批量刷新 refresh_token 失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
}

/**
 * 获取需要刷新 refresh_token 的账户列表（refresh_token_updated_at 为 null）
 */
export async function getUnrefreshedAccounts(): Promise<{
  success: boolean;
  data?: GetUnrefreshedAccountsResponse;
  error?: string;
}> {
  try {
    const url = buildNextApiUrl(NEXT_API_CONFIG.ENDPOINTS.MAIL.REFRESH_TOKENS);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data: GetUnrefreshedAccountsResponse = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("获取未刷新 refresh_token 的账户列表失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
}

/**
 * 获取单个邮箱的详细信息
 */
export async function getEmailAccountDetail(email: string): Promise<{
  success: boolean;
  data?: EmailAccountDetail;
  error?: string;
}> {
  try {
    const baseUrl = buildNextApiUrl(NEXT_API_CONFIG.ENDPOINTS.MAIL.ACCOUNTS);
    const url = new URL(baseUrl, window.location.origin);
    url.searchParams.set("email", email);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "获取邮箱详细信息失败");
    }

    return { success: true, data: data.account };
  } catch (error) {
    console.error("获取邮箱详细信息失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
}

/**
 * 刷新单个邮箱的 refresh_token 并返回详细变化信息
 */
export async function refreshSingleToken(email: string): Promise<{
  success: boolean;
  data?: SingleRefreshResult;
  error?: string;
}> {
  try {
    // 1. 获取刷新前的状态
    const beforeResponse = await getEmailAccountDetail(email);
    if (!beforeResponse.success || !beforeResponse.data) {
      throw new Error(beforeResponse.error || "获取邮箱信息失败");
    }

    const beforeRefresh = {
      refresh_token: beforeResponse.data.refresh_token,
      refresh_token_updated_at: beforeResponse.data.refresh_token_updated_at,
    };

    // 2. 执行刷新
    const refreshResponse = await batchRefreshTokens({
      specificEmails: [email],
    });

    if (!refreshResponse.success || !refreshResponse.data) {
      throw new Error(refreshResponse.error || "刷新失败");
    }

    const refreshResult = refreshResponse.data.details.refreshedTokens.find(
      (token) => token.email === email,
    );

    if (!refreshResult || !refreshResult.success) {
      const error = refreshResponse.data.details.errors.find(
        (err) => err.email === email,
      );
      throw new Error(error?.error || "刷新失败");
    }

    // 3. 获取刷新后的状态
    const afterResponse = await getEmailAccountDetail(email);
    if (!afterResponse.success || !afterResponse.data) {
      throw new Error(afterResponse.error || "获取刷新后状态失败");
    }

    const afterRefresh = {
      refresh_token: afterResponse.data.refresh_token,
      refresh_token_updated_at: afterResponse.data.refresh_token_updated_at,
    };

    // 4. 判断令牌是否真的发生了变化
    const tokenChanged =
      beforeRefresh.refresh_token !== afterRefresh.refresh_token;

    const result: SingleRefreshResult = {
      success: true,
      email,
      beforeRefresh,
      afterRefresh,
      tokenChanged,
    };

    return { success: true, data: result };
  } catch (error) {
    console.error(`刷新单个邮箱 ${email} 失败:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
}

/**
 * 刷新指定邮箱的 refresh_token
 */
export async function refreshSpecificTokens(emails: string[]): Promise<{
  success: boolean;
  data?: BatchRefreshTokenResponse;
  error?: string;
}> {
  if (emails.length === 0) {
    return {
      success: false,
      error: "邮箱列表不能为空",
    };
  }

  console.log(`开始刷新指定邮箱的 refresh_token: ${emails.length} 个`);

  return await batchRefreshTokens({
    specificEmails: emails,
  });
}
