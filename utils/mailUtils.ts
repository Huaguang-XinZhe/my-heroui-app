import { MailInfo, ProtocolType } from "@/types/email";

/**
 * 填充邮件信息的默认值
 * 对应 Kotlin 中的 fillDefaultValues 函数
 */
export function fillDefaultValues(mailInfos: MailInfo[]): MailInfo[] {
  return mailInfos.map((mailInfo) => {
    // 如果没有 clientId，使用默认值
    const clientId =
      mailInfo.clientId || "9e5f94bc-e8a4-4e73-b8be-63364c29d753";

    // 如果没有 serviceProvider，使用默认值
    const serviceProvider = mailInfo.serviceProvider || "MICROSOFT";

    return {
      ...mailInfo,
      clientId,
      serviceProvider,
    };
  });
}

/**
 * 检查邮箱是否包含封禁关键词
 */
export function checkForBanKeywords(error?: string): boolean {
  if (!error) return false;

  return error
    .toLowerCase()
    .includes("user account is found to be in service abuse mode");
}

/**
 * 聚合错误信息
 */
export function aggregateErrors(
  errors: (string | undefined)[],
): string | undefined {
  const validErrors = errors.filter(Boolean) as string[];
  return validErrors.length > 0 ? validErrors.join("; ") : undefined;
}

/**
 * 验证邮件信息是否完整
 */
export function validateMailInfo(mailInfo: MailInfo): string | null {
  if (!mailInfo.email) {
    return "邮箱地址不能为空";
  }

  if (!mailInfo.refreshToken) {
    return "RefreshToken 不能为空";
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(mailInfo.email)) {
    return "邮箱格式不正确";
  }

  return null;
}

/**
 * 验证批量邮件信息
 */
export function validateBatchMailInfos(mailInfos: MailInfo[]): string | null {
  if (!mailInfos || !Array.isArray(mailInfos)) {
    return "邮件信息必须是数组";
  }

  if (mailInfos.length === 0) {
    return "邮件信息列表不能为空";
  }

  if (mailInfos.length > 100) {
    return "单次最多处理 100 个邮箱";
  }

  // 验证每个邮件信息
  for (let i = 0; i < mailInfos.length; i++) {
    const error = validateMailInfo(mailInfos[i]);
    if (error) {
      return `第 ${i + 1} 个邮箱信息错误: ${error}`;
    }
  }

  // 检查是否有重复邮箱
  const emails = mailInfos.map((info) => info.email);
  const uniqueEmails = new Set(emails);
  if (emails.length !== uniqueEmails.size) {
    return "邮箱列表中有重复的邮箱地址";
  }

  return null;
}

/**
 * 确定最终的协议类型
 */
export function determineFinalProtocolType(
  originalProtocolType?: ProtocolType,
  detectedProtocolType?: ProtocolType,
): ProtocolType | undefined {
  // 如果原本就有协议类型，优先使用原有的
  if (originalProtocolType) {
    return originalProtocolType;
  }

  // 否则使用检测到的协议类型
  return detectedProtocolType;
}
