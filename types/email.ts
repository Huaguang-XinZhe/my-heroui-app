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
