import { MailRequestInfo } from "./email";

/**
 * 邮件订阅请求
 */
export interface SubscribeMailRequest {
  mailInfo: MailRequestInfo;
  refreshNeeded?: boolean;
}

/**
 * 邮件事件类型
 */
export type MailEventType =
  | "subscription"
  | "email"
  | "heartbeat"
  | "error"
  | "complete";

/**
 * 邮件事件 DTO（用于流式订阅）
 */
export interface MailEventDto {
  eventType: MailEventType;
  email?: any; // 邮件数据，使用现有的 Email 类型
  message?: string; // 用于 subscription/heartbeat/error/complete 消息
  refreshToken?: string; // 仅当连接成功且需要刷新时返回
}

/**
 * 订阅状态
 */
export type SubscriptionStatus =
  | "idle" // 空闲状态
  | "connecting" // 正在连接
  | "connected" // 已连接，正在监听
  | "error" // 错误状态
  | "disconnected"; // 已断开连接

/**
 * 订阅状态数据
 */
export interface SubscriptionState {
  status: SubscriptionStatus;
  message?: string;
  error?: string;
  lastHeartbeat?: Date;
}
