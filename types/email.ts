export type ProtocolType = "IMAP" | "GRAPH" | "UNKNOWN";
export type UserType =
  | "oauth2-google"
  | "oauth2-linuxdo"
  | "card_key"
  | "system";

// =============================================
// 体验账户相关类型
// =============================================

/**
 * 体验账户数据（存储在 localStorage 中）
 */
export interface TrialAccount {
  email: string;
  refreshToken: string;
  protocolType: ProtocolType;
  serviceProvider: string;
  clientId?: string;
  password?: string;
  secondaryEmail?: string;
  secondaryPassword?: string;
  cardData?: {
    source: "淘宝" | "闲鱼" | "内部" | "自定义";
    customSource?: string;
    emailCount: number;
    duration: "短效" | "长效";
    timestamp: number;
    id: string;
    reusable?: boolean;
    originalCardKey?: string; // 原始卡密
  };
  isTrialAccount: true;
}

// =============================================
// 用户相关类型
// =============================================

/**
 * 用户信息
 */
export interface User {
  id: string; // 邮箱或卡密
  nickname?: string;
  avatar_url?: string;
  user_type: UserType;
  level?: number; // Linux DO 信任等级
  created_at?: string;
  updated_at?: string;
}

/**
 * 创建用户请求
 */
export interface CreateUserRequest {
  id: string; // 邮箱或卡密作为用户ID
  nickname?: string;
  avatar_url?: string;
  user_type: UserType;
  level?: number; // Linux DO 信任等级
}

// =============================================
// 邮箱账户相关类型
// =============================================

export interface MailInfo {
  email: string;
  refreshToken: string;
  clientId?: string;
  serviceProvider?: string;
  protocolType?: ProtocolType;
  password?: string;
  secondaryEmail?: string; // 辅助邮箱
  secondaryPassword?: string; // 辅助邮箱密码
  user_id?: string; // 新增：关联的用户ID
}

/**
 * 邮箱账户数据库记录
 */
export interface MailAccount {
  email: string; // 主键
  user_id: string;
  refresh_token?: string;
  client_id?: string;
  service_provider: string;
  protocol_type: ProtocolType;
  password?: string;
  secondary_email?: string; // 辅助邮箱
  secondary_password?: string; // 辅助邮箱密码
  is_banned: boolean;
  refresh_token_updated_at?: string; // refresh_token 更新时间
  created_at: string;
}

// =============================================
// 邮件相关类型
// =============================================

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
  id: string;
  subject: string;
  from: EmailAddress;
  to: EmailAddress;
  date: string;
  text?: string;
  html?: string;
}

/**
 * 存储的邮件数据库记录
 */
export interface StoredMail {
  id: string;
  user_id: string;
  subject?: string;
  from_name?: string;
  from_address: string;
  to_name?: string;
  to_address: string;
  text_content?: string;
  html_content?: string;
  from_junk: boolean; // 替代原来的 mail_type
  received_at: string; // 北京时间
  created_at: string;
}

// =============================================
// 批量操作相关类型
// =============================================

export interface BatchAddAccountRequest {
  mailInfos: MailInfo[];
  refreshNeeded: boolean;
  user_id?: string; // 新增：指定用户ID
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

// =============================================
// 缓存和请求相关类型
// =============================================

/**
 * 缓存的邮箱信息
 */
export interface CachedEmailInfo {
  email: string;
  refreshToken: string;
  protocolType: ProtocolType;
  lastFetchTime?: number;
  user_id?: string; // 新增
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
  user_id?: string; // 新增
}

// =============================================
// API 响应类型
// =============================================

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

// =============================================
// 工具类型
// =============================================

/**
 * 提取的验证码信息
 */
export interface ExtractedCodeInfo {
  code?: string;
  expiryMinutes?: number;
}

/**
 * 用户邮件统计
 */
export interface UserMailStats {
  user_id: string;
  nickname?: string;
  user_type: UserType;
  mail_account_count: number;
  active_mail_count: number;
  total_mail_count: number;
  junk_mail_count: number;
  inbox_mail_count: number;
  latest_mail_time?: string;
}
