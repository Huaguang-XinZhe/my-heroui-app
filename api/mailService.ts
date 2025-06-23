import {
  BatchAddAccountRequest,
  BatchAddMailAccountResponse,
  GetLatestMailRequest,
  GetLatestMailResponse,
  GetJunkMailRequest,
  GetJunkMailResponse,
} from "@/types/email";
import { NEXT_API_CONFIG, buildNextApiUrl } from "@/config/api";

/**
 * 批量添加邮箱账户
 */
export async function batchAddAccounts(
  request: BatchAddAccountRequest,
): Promise<{
  success: boolean;
  data?: BatchAddMailAccountResponse;
  error?: string;
}> {
  try {
    const response = await fetch(
      buildNextApiUrl(NEXT_API_CONFIG.ENDPOINTS.MAIL.BATCH_ADD_ACCOUNT),
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

    const data: BatchAddMailAccountResponse = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("批量添加邮箱账户失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
}

/**
 * 管理员批量添加邮箱账户（未分配）
 */
export async function adminBatchAddAccounts(
  request: BatchAddAccountRequest,
): Promise<{
  success: boolean;
  data?: BatchAddMailAccountResponse;
  error?: string;
}> {
  try {
    const response = await fetch(
      buildNextApiUrl(NEXT_API_CONFIG.ENDPOINTS.ADMIN.MAIL.BATCH_ADD),
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

    const data: BatchAddMailAccountResponse = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("管理员批量添加邮箱账户失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
}

/**
 * 获取最新邮件
 */
export async function getLatestMail(request: GetLatestMailRequest): Promise<{
  success: boolean;
  data?: GetLatestMailResponse;
  error?: string;
}> {
  try {
    const response = await fetch(
      buildNextApiUrl(NEXT_API_CONFIG.ENDPOINTS.MAIL.LATEST),
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

    const data: GetLatestMailResponse = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("获取最新邮件失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "获取邮件失败",
    };
  }
}

/**
 * 获取垃圾邮件
 */
export async function getJunkMail(request: GetJunkMailRequest): Promise<{
  success: boolean;
  data?: GetJunkMailResponse;
  error?: string;
}> {
  try {
    const response = await fetch(
      buildNextApiUrl(NEXT_API_CONFIG.ENDPOINTS.MAIL.LATEST_JUNK),
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

    const data: GetJunkMailResponse = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("获取垃圾邮件失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "获取垃圾邮件失败",
    };
  }
}
