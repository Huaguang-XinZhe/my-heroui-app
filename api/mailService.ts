import {
  BatchAddAccountRequest,
  BatchAddMailAccountResponse,
} from "@/types/email";

const API_BASE_URL = "http://localhost:8080";

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
      error: error instanceof Error ? error.message.slice(0, 8) : "未知错误",
    };
  }
}
