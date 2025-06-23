import { MailInfo, ProtocolType, ParsedEmailData } from "@/types/email";

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

/**
 * 解析单行邮箱信息
 * 支持格式：email----password----clientId----refreshToken----secondaryEmail----secondaryPassword
 * 或者简单格式：email:password 或 email,password 等
 */
export function parseEmailLine(line: string): ParsedEmailData | null {
  if (!line.trim()) {
    return null;
  }

  // 去除首尾空白字符
  const trimmedLine = line.trim();

  // 检查是否是复杂格式（包含----分隔符）
  if (trimmedLine.includes("----")) {
    const parts = trimmedLine.split("----");

    if (parts.length >= 4) {
      const email = parts[0]?.trim();
      const password = parts[1]?.trim();
      const clientId = parts[2]?.trim();
      const refreshToken = parts[3]?.trim();
      const secondaryEmail = parts[4]?.trim() || undefined;
      const secondaryPassword = parts[5]?.trim() || undefined;

      // 验证基本字段
      if (email && password && clientId && refreshToken) {
        return {
          email,
          password,
          clientId,
          refreshToken,
          secondaryEmail,
          secondaryPassword,
        };
      }
    }
  }

  // 尝试其他分隔符格式
  const separators = [":", ",", "|", "\t", " "];

  for (const separator of separators) {
    if (trimmedLine.includes(separator)) {
      const parts = trimmedLine.split(separator).map((p) => p.trim());

      if (parts.length >= 2) {
        const email = parts[0];
        const password = parts[1];

        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email) && password) {
          return {
            email,
            password,
            // 其他字段为可选，可以在后续处理中填充默认值
          };
        }
      }
    }
  }

  // 如果没有分隔符，检查是否是单纯的邮箱地址
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(trimmedLine)) {
    return {
      email: trimmedLine,
      // 其他字段为空，需要用户补充
    };
  }

  return null;
}

/**
 * 将解析后的邮箱数据转换为 MailInfo 格式
 */
export function convertParsedEmailToMailInfo(
  parsedData: ParsedEmailData,
  defaultRefreshToken?: string,
): MailInfo | null {
  if (!parsedData.email) {
    return null;
  }

  return {
    email: parsedData.email,
    password: parsedData.password,
    clientId: parsedData.clientId,
    refreshToken: parsedData.refreshToken || defaultRefreshToken || "",
    secondaryEmail: parsedData.secondaryEmail,
    secondaryPassword: parsedData.secondaryPassword,
  };
}

/**
 * 批量解析邮箱信息
 */
export function parseEmailBatch(
  text: string,
  defaultRefreshToken?: string,
): MailInfo[] {
  if (!text.trim()) {
    return [];
  }

  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  const results: MailInfo[] = [];

  for (const line of lines) {
    const parsed = parseEmailLine(line);
    if (parsed) {
      const mailInfo = convertParsedEmailToMailInfo(
        parsed,
        defaultRefreshToken,
      );
      if (mailInfo) {
        results.push(mailInfo);
      }
    }
  }

  return results;
}
