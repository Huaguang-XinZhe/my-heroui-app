// 客户端专用的邀请工具函数
// 不包含任何加密逻辑或私钥相关功能

import { InviteData, InviteUsage } from "./inviteUtils";

// 客户端不再包含任何邀请生成逻辑
// 所有邀请令牌和 URL 生成都必须通过服务端 API 完成

/**
 * 格式化邀请链接显示
 */
export function formatInviteDisplay(
  token: string,
  showLength: number = 8,
): string {
  if (!token) return "未知";

  const preview =
    token.length > showLength ? token.substring(0, showLength) + "..." : token;

  return preview;
}

/**
 * 格式化注册方式显示
 */
export function formatRegistrationMethods(
  methods: InviteData["registrationMethods"],
): string {
  const enabled = [];
  if (methods.linuxdo) enabled.push("LinuxDo");
  if (methods.google) enabled.push("Google");
  if (methods.cardKey) enabled.push("卡密");
  if (methods.others) enabled.push("其他");
  return enabled.length > 0 ? enabled.join(", ") : "无";
}

/**
 * 格式化过期时间显示
 */
export function formatExpiryTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffHours = Math.round((timestamp - now.getTime()) / (1000 * 60 * 60));

  if (diffHours < 0) {
    return "已过期";
  } else if (diffHours < 24) {
    return `${diffHours} 小时后过期`;
  } else {
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} 天后过期`;
  }
}

/**
 * 验证邀请数据的基本格式（不涉及加密验证）
 */
export function validateInviteData(data: Partial<InviteData>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.imapEmailCount || data.imapEmailCount < 0) {
    errors.push("IMAP 邮箱数量必须大于等于 0");
  }

  if (!data.graphEmailCount || data.graphEmailCount < 0) {
    errors.push("GRAPH 邮箱数量必须大于等于 0");
  }

  if (!data.maxRegistrations || data.maxRegistrations <= 0) {
    errors.push("最大注册人数必须大于 0");
  }

  if (!data.expiresAt || data.expiresAt <= Date.now()) {
    errors.push("过期时间必须晚于当前时间");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
