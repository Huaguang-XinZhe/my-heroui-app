import {
  SubscribeMailRequest,
  MailEventDto,
  SubscriptionState,
} from "@/types/subscription";

/**
 * 邮件订阅服务类
 */
export class MailSubscriptionService {
  private eventSource: EventSource | null = null;
  private abortController: AbortController | null = null;
  private onStateChange?: (state: SubscriptionState) => void;
  private onEmailReceived?: (email: any) => void;
  private baseUrl = "http://localhost:8080";

  /**
   * 设置状态变化回调
   */
  setOnStateChange(callback: (state: SubscriptionState) => void) {
    this.onStateChange = callback;
  }

  /**
   * 设置邮件接收回调
   */
  setOnEmailReceived(callback: (email: any) => void) {
    this.onEmailReceived = callback;
  }

  /**
   * 开始订阅邮件
   */
  async subscribe(request: SubscribeMailRequest): Promise<void> {
    try {
      // 如果已有连接，先关闭
      if (this.eventSource || this.abortController) {
        this.disconnect();
      }

      // 创建新的 AbortController 用于取消请求
      this.abortController = new AbortController();

      // 更新状态为连接中
      this.updateState({
        status: "connecting",
        message: "正在建立连接...",
      });

      // 发送 POST 请求建立订阅连接
      const response = await fetch(`${this.baseUrl}/api/mail/subscribe-sse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify(request),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(
          `订阅请求失败: ${response.status} ${response.statusText}`,
        );
      }

      // 检查响应是否是 event-stream
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("text/event-stream")) {
        throw new Error("服务器响应格式不正确，期望 text/event-stream");
      }

      // 使用 ReadableStream 读取 SSE 数据
      this.setupStreamReader(response);
    } catch (error) {
      this.updateState({
        status: "error",
        error: error instanceof Error ? error.message : "订阅失败",
      });
    }
  }

  /**
   * 设置流读取器处理 SSE 数据
   */
  private async setupStreamReader(response: Response): Promise<void> {
    if (!response.body) {
      throw new Error("响应体为空");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    // 更新连接状态
    this.updateState({
      status: "connected",
      message: "连接已建立，正在监听新邮件...",
      lastHeartbeat: new Date(),
    });

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // 连接结束
          this.updateState({
            status: "disconnected",
            message: "连接已结束",
          });
          break;
        }

        // 解码数据
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          // 处理 SSE 格式：data: {...}
          if (line.startsWith("data: ")) {
            const data = line.slice(6); // 移除 "data: " 前缀
            if (data.trim()) {
              try {
                const mailEvent: MailEventDto = JSON.parse(data);
                this.handleMailEvent(mailEvent);
              } catch (error) {
                console.error("解析邮件事件失败:", error, "原始数据:", data);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("SSE 流读取错误:", error);
      this.updateState({
        status: "error",
        error: "连接中断，请重试",
      });
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * 设置 EventSource 事件监听器（已废弃，保留用于向后兼容）
   */
  private setupEventListeners(): void {
    if (!this.eventSource) return;

    // 连接打开
    this.eventSource.onopen = () => {
      this.updateState({
        status: "connected",
        message: "连接已建立，正在监听新邮件...",
        lastHeartbeat: new Date(),
      });
    };

    // 接收消息
    this.eventSource.onmessage = (event) => {
      try {
        const mailEvent: MailEventDto = JSON.parse(event.data);
        this.handleMailEvent(mailEvent);
      } catch (error) {
        console.error("解析邮件事件失败:", error);
      }
    };

    // 连接错误
    this.eventSource.onerror = (error) => {
      console.error("SSE 连接错误:", error);
      this.updateState({
        status: "error",
        error: "连接中断，请重试",
      });
    };
  }

  /**
   * 处理邮件事件
   */
  private handleMailEvent(event: MailEventDto): void {
    switch (event.eventType) {
      case "subscription":
        this.updateState({
          status: "connected",
          message: event.message || "订阅成功",
          lastHeartbeat: new Date(),
        });
        break;

      case "email":
        if (event.email && this.onEmailReceived) {
          this.onEmailReceived(event.email);
        }
        this.updateState({
          status: "connected",
          message: "收到新邮件",
          lastHeartbeat: new Date(),
        });
        break;

      case "heartbeat":
        this.updateState({
          status: "connected",
          message: event.message || "连接正常",
          lastHeartbeat: new Date(),
        });
        break;

      case "error":
        this.updateState({
          status: "error",
          error: event.message || "服务器错误",
        });
        break;

      case "complete":
        this.updateState({
          status: "disconnected",
          message: event.message || "订阅已完成",
        });
        this.disconnect();
        break;

      default:
        console.warn("未知的邮件事件类型:", event.eventType);
    }
  }

  /**
   * 断开订阅连接
   */
  disconnect(): void {
    // 取消 fetch 请求
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    // 关闭 EventSource（向后兼容）
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.updateState({
      status: "disconnected",
      message: "连接已断开",
    });
  }

  /**
   * 更新订阅状态
   */
  private updateState(state: Partial<SubscriptionState>): void {
    if (this.onStateChange) {
      // 获取当前完整状态
      const currentState: SubscriptionState = {
        status: "idle",
        ...state,
      };
      this.onStateChange(currentState);
    }
  }

  /**
   * 获取连接状态
   */
  isConnected(): boolean {
    return (
      this.abortController !== null && !this.abortController.signal.aborted
    );
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.disconnect();
    this.onStateChange = undefined;
    this.onEmailReceived = undefined;
  }
}

// 导出单例实例
export const mailSubscriptionService = new MailSubscriptionService();
