export type ProtocolType = "IMAP" | "GRAPH" | "UNKNOWN";

export interface MailInfo {
  email: string;
  refreshToken: string;
  clientId?: string;
  serviceProvider?: string;
  protocolType?: string;
  password?: string;
}

export interface BatchAddAccountRequest {
  mailInfos: MailInfo[];
  refreshNeeded: boolean;
}

export interface ParsedEmailData {
  email: string;
  password?: string;
  clientId?: string;
  refreshToken?: string;
  secondaryEmail?: string;
  secondaryPassword?: string;
}

/**
 * 来自其他邮箱的结果
 */
export interface FromOthersResult {
  email: string;
  isBanned: boolean;
}

/**
 * 错误结果
 */
export interface ErrorResult {
  email: string;
  isBanned: boolean;
  error: string;
}

/**
 * 成功结果
 */
export interface SuccessResult {
  email: string;
  refreshToken: string;
  protocolType: ProtocolType;
}

/**
 * 批量添加邮箱账户响应
 */
export interface BatchAddMailAccountResponse {
  fromOthers: FromOthersResult[];
  errors: ErrorResult[];
  successes: SuccessResult[];
}

/**
 * 缓存的邮箱信息
 */
export interface CachedEmailInfo {
  email: string;
  refreshToken: string;
  protocolType: ProtocolType;
}

/**
 * 邮件请求信息
 */
export interface MailRequestInfo {
  email: string;
  refreshToken: string;
  clientId?: string;
  protocolType?: ProtocolType;
  serviceProvider?: string;
}

/**
 * 邮件地址
 */
export interface EmailAddress {
  name?: string;
  address: string;
}

/**
 * 邮件数据
 */
export interface Email {
  id?: number;
  subject: string;
  from: EmailAddress;
  to: EmailAddress;
  date: string;
  text?: string;
  html?: string;
}

/**
 * 获取最新邮件请求
 */
export interface GetLatestMailRequest {
  mailInfo: MailRequestInfo;
  refreshNeeded?: boolean;
}

/**
 * 获取最新邮件响应
 */
export interface GetLatestMailResponse {
  email: Email | null;
  refreshToken?: string;
}

/**
 * 获取垃圾邮件请求
 */
export interface GetJunkMailRequest {
  mailInfo: MailRequestInfo;
}

/**
 * 获取垃圾邮件响应
 */
export interface GetJunkMailResponse {
  email: Email | null;
}

/**
 * 提取的验证码信息
 */
export interface ExtractedCodeInfo {
  code?: string;
  expiryMinutes?: number;
}
