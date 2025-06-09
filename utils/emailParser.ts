import { ParsedEmailData, MailInfo, ProtocolType } from "@/types/email";

/**
 * 解析单行邮箱数据
 * 支持两种格式：
 * 1. 完整四件套：邮箱、密码、clientId、refreshToken
 * 2. 简化格式：邮箱----refreshToken（使用默认 clientId）
 */
export function parseEmailLine(line: string): ParsedEmailData | null {
  const trimmedLine = line.trim();
  if (!trimmedLine) return null;

  const parts = trimmedLine.split("----").map((part) => part.trim());

  if (parts.length === 2) {
    // 简化格式：邮箱----refreshToken
    const [email, refreshToken] = parts;
    if (!email || !refreshToken) return null;

    return {
      email,
      refreshToken,
    };
  } else if (parts.length === 4) {
    // 完整四件套格式：邮箱----密码----clientId----refreshToken
    const [email, password, clientId, refreshToken] = parts;
    if (!email || !refreshToken) return null;

    return {
      email,
      password,
      clientId,
      refreshToken,
    };
  }

  return null;
}

/**
 * 将解析后的数据转换为 API 所需的格式
 */
export function convertToMailInfo(
  parsedData: ParsedEmailData,
  protocolType: ProtocolType,
): MailInfo | null {
  // 邮箱和 refreshToken 现在都是必填的
  if (!parsedData.email || !parsedData.refreshToken) return null;

  var mailInfo: MailInfo = {
    email: parsedData.email,
    refreshToken: parsedData.refreshToken,
    serviceProvider: "MICROSOFT",
  };

  if (parsedData.password) {
    mailInfo.password = parsedData.password;
  }

  if (parsedData.clientId) {
    mailInfo.clientId = parsedData.clientId;
  }

  if (protocolType !== "UNKNOWN") {
    mailInfo.protocolType = protocolType;
  }

  return mailInfo;
}

/**
 * 快速计算有效邮箱条数（轻量版本，不完整解析）
 */
export function countValidEmailLines(input: string): number {
  if (!input.trim()) return 0;

  const lines = input.split("\n");
  let count = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const parts = trimmedLine.split("----");
    // 简单检查：至少有2个部分且包含邮箱格式
    if (parts.length >= 2 && parts[0].includes("@")) {
      count++;
    }
  }

  return count;
}

/**
 * 批量解析邮箱输入文本
 */
export function parseEmailInput(
  input: string,
  protocolType: ProtocolType,
): MailInfo[] {
  const lines = input.split("\n");
  const mailInfos: MailInfo[] = [];

  for (const line of lines) {
    const parsedData = parseEmailLine(line);
    if (parsedData) {
      const mailInfo = convertToMailInfo(parsedData, protocolType);
      if (mailInfo) {
        mailInfos.push(mailInfo);
      }
    }
  }

  return mailInfos;
}
