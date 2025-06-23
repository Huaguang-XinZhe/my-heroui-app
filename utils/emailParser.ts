import { ParsedEmailData, MailInfo, ProtocolType } from "@/types/email";

/**
 * 智能解析单行邮箱数据
 * 支持多种格式：
 * 1. 完整四件套：邮箱----密码----clientId----refreshToken
 * 2. 无密码格式：邮箱----x----refreshToken----clientId 或 邮箱----x----clientId----refreshToken
 * 3. 六件套：邮箱----密码----clientId----refreshToken----辅邮----辅邮密码
 * 4. 简化格式：邮箱----refreshToken（使用默认 clientId）
 */
export function parseEmailLine(line: string): ParsedEmailData | null {
  const trimmedLine = line.trim();
  if (!trimmedLine) return null;

  const parts = trimmedLine.split("----").map((part) => part.trim());

  // 检查是否包含邮箱地址
  if (parts.length < 2 || !parts[0].includes("@")) return null;

  const email = parts[0];

  if (parts.length === 2) {
    // 简化格式：邮箱----refreshToken
    const [, refreshToken] = parts;
    if (!refreshToken) return null;

    return {
      email,
      refreshToken,
    };
  } else if (parts.length === 3) {
    // 三部分格式：邮箱----x----refreshToken
    const [, password, refreshToken] = parts;
    if (!refreshToken) return null;

    // 检查是否为无密码格式（密码为 x）
    const hasPassword = password !== "x" && password !== "";

    return {
      email,
      password: hasPassword ? password : undefined,
      refreshToken,
    };
  } else if (parts.length === 4) {
    // 四部分格式，需要智能判断顺序
    const [, part2, part3, part4] = parts;

    // 判断 refreshToken 的位置（通常很长且包含特殊字符）
    const isRefreshToken = (str: string): boolean => {
      return str.length > 50 && /[!.*$]/.test(str);
    };

    let password: string | undefined;
    let clientId: string | undefined;
    let refreshToken: string;

    if (isRefreshToken(part4)) {
      // 格式：邮箱----密码----clientId----refreshToken
      password = part2 !== "x" ? part2 : undefined;
      clientId = part3;
      refreshToken = part4;
    } else if (isRefreshToken(part3)) {
      // 格式：邮箱----x----refreshToken----clientId
      password = part2 !== "x" ? part2 : undefined;
      refreshToken = part3;
      clientId = part4;
    } else {
      // 默认按照第一种格式处理
      password = part2 !== "x" ? part2 : undefined;
      clientId = part3;
      refreshToken = part4;
    }

    if (!refreshToken) return null;

    return {
      email,
      password,
      clientId,
      refreshToken,
    };
  } else if (parts.length === 6) {
    // 六件套格式：邮箱----密码----clientId----refreshToken----辅邮----辅邮密码
    const [
      ,
      password,
      clientId,
      refreshToken,
      secondaryEmail,
      secondaryPassword,
    ] = parts;
    if (!refreshToken) return null;

    return {
      email,
      password: password !== "x" ? password : undefined,
      clientId,
      refreshToken,
      secondaryEmail: secondaryEmail || undefined,
      secondaryPassword: secondaryPassword || undefined,
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

  if (parsedData.secondaryEmail) {
    mailInfo.secondaryEmail = parsedData.secondaryEmail;
  }

  if (parsedData.secondaryPassword) {
    mailInfo.secondaryPassword = parsedData.secondaryPassword;
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
