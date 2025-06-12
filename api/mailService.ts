import {
  BatchAddAccountRequest,
  BatchAddMailAccountResponse,
  GetLatestMailRequest,
  GetLatestMailResponse,
  GetJunkMailRequest,
  GetJunkMailResponse,
} from "@/types/email";

const API_BASE_URL =
  "https://d06b-2408-8948-2010-bb7-9173-7389-1fec-5375.ngrok-free.app";

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
    const response = await fetch(`${API_BASE_URL}/api/mail/batch-add-account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

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
 * 获取最新邮件
 */
export async function getLatestMail(request: GetLatestMailRequest): Promise<{
  success: boolean;
  data?: GetLatestMailResponse;
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/mail/latest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

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
    const response = await fetch(`${API_BASE_URL}/api/mail/latest/junk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

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
