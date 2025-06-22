import {
  GetLatestMailRequest,
  GetLatestMailResponse,
  GetJunkMailRequest,
  GetJunkMailResponse,
  MailInfo,
  ProtocolType,
} from "@/types/email";
import { GO_MAIL_API_CONFIG, buildGoMailApiUrl } from "@/config/api";

// 新增类型定义，对应 Kotlin 中的 DTO
interface BatchDetectProtocolTypeRequest {
  mailInfos: MailInfo[];
}

interface BatchDetectProtocolTypeResponse {
  results: {
    email: string;
    protocolType?: ProtocolType;
    error?: string;
  }[];
}

interface BatchRefreshTokenResponse {
  results: {
    email: string;
    newRefreshToken?: string;
    error?: string;
  }[];
}

/**
 * GoMailAPI 服务类
 * 封装对外部 GoMailAPI 的所有调用
 */
export class GoMailApiService {
  private baseUrl: string;

  constructor(baseUrl: string = GO_MAIL_API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * 构建完整的 API URL
   */
  private buildApiUrl(endpoint: string): string {
    return buildGoMailApiUrl(endpoint);
  }

  /**
   * 批量检测协议类型
   */
  async batchDetectProtocolType(
    request: BatchDetectProtocolTypeRequest,
  ): Promise<{
    success: boolean;
    data?: BatchDetectProtocolTypeResponse;
    error?: string;
  }> {
    try {
      const response = await fetch(
        this.buildApiUrl(
          GO_MAIL_API_CONFIG.ENDPOINTS.MAIL.BATCH_DETECT_PROTOCOL,
        ),
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

      const data: BatchDetectProtocolTypeResponse = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("GoMailAPI 批量协议检测失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
      };
    }
  }

  /**
   * 批量刷新 Token
   */
  async batchRefreshToken(mailInfos: MailInfo[]): Promise<{
    success: boolean;
    data?: BatchRefreshTokenResponse;
    error?: string;
  }> {
    try {
      const response = await fetch(
        this.buildApiUrl(GO_MAIL_API_CONFIG.ENDPOINTS.TOKEN.BATCH_REFRESH),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mailInfos }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data: BatchRefreshTokenResponse = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("GoMailAPI 批量刷新 Token 失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
      };
    }
  }

  /**
   * 调用 GoMailAPI 获取最新邮件
   */
  async getLatestMail(request: GetLatestMailRequest): Promise<{
    success: boolean;
    data?: GetLatestMailResponse;
    error?: string;
  }> {
    try {
      const response = await fetch(
        this.buildApiUrl(GO_MAIL_API_CONFIG.ENDPOINTS.MAIL.LATEST),
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
      console.error("GoMailAPI 获取最新邮件失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "获取邮件失败",
      };
    }
  }

  /**
   * 调用 GoMailAPI 获取垃圾邮件
   */
  async getJunkMail(request: GetJunkMailRequest): Promise<{
    success: boolean;
    data?: GetJunkMailResponse;
    error?: string;
  }> {
    try {
      const response = await fetch(
        this.buildApiUrl(GO_MAIL_API_CONFIG.ENDPOINTS.MAIL.JUNK_LATEST),
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
      console.error("GoMailAPI 获取垃圾邮件失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "获取垃圾邮件失败",
      };
    }
  }

  /**
   * 检查 GoMailAPI 服务健康状态
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}${GO_MAIL_API_CONFIG.ENDPOINTS.HEALTH}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      return response.ok;
    } catch (error) {
      console.error("GoMailAPI 健康检查失败:", error);
      return false;
    }
  }

  /**
   * 单个协议检测
   */
  async detectProtocolType(mailInfo: MailInfo): Promise<{
    success: boolean;
    data?: { protocolType?: ProtocolType; error?: string };
    error?: string;
  }> {
    try {
      const response = await fetch(
        this.buildApiUrl(GO_MAIL_API_CONFIG.ENDPOINTS.MAIL.DETECT_PROTOCOL),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mailInfo),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("GoMailAPI 协议检测失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
      };
    }
  }

  /**
   * 刷新单个 Token
   */
  async refreshToken(mailInfo: MailInfo): Promise<{
    success: boolean;
    data?: { newRefreshToken?: string; error?: string };
    error?: string;
  }> {
    try {
      const response = await fetch(
        this.buildApiUrl(GO_MAIL_API_CONFIG.ENDPOINTS.TOKEN.REFRESH),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mailInfo),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("GoMailAPI 刷新 Token 失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
      };
    }
  }

  /**
   * 查找特定邮件
   */
  async findMail(
    emailID: string,
    request: GetLatestMailRequest,
  ): Promise<{
    success: boolean;
    data?: GetLatestMailResponse;
    error?: string;
  }> {
    try {
      const response = await fetch(
        this.buildApiUrl(
          `${GO_MAIL_API_CONFIG.ENDPOINTS.MAIL.FIND}/${emailID}`,
        ),
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
      console.error("GoMailAPI 查找邮件失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "查找邮件失败",
      };
    }
  }
}

// 导出单例实例
export const goMailApiService = new GoMailApiService();

// 导出配置和类型
export { GO_MAIL_API_CONFIG };
export type {
  BatchDetectProtocolTypeRequest,
  BatchDetectProtocolTypeResponse,
  BatchRefreshTokenResponse,
};
