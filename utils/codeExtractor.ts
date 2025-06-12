import { ExtractedCodeInfo } from "@/types/email";

/**
 * 从文本中提取验证码
 * 支持多种常见的验证码格式
 */
function extractCodeFromText(text: string): string | undefined {
  // 首先尝试带关键词的模式
  const keywordPatterns = [
    // one-time code is 后的数字（支持空格分隔和连续）
    /one-time code is:?\s*((?:\d\s*){4,8})/gi,
    // 验证码关键词后的数字组合（支持空格分隔和连续）
    /(?:验证码|verification code|code)[:\s]+((?:\d\s*){4,8})/gi,
    // OTP 模式（支持空格分隔和连续）
    /(?:OTP|otp)[:\s]+((?:\d\s*){4,8})/gi,
    // Your code is 模式（支持空格分隔和连续）
    /(?:your code is|code is)[:\s]+((?:\d\s*){4,8})/gi,
    // 安全代码（支持空格分隔和连续）
    /(?:安全代码|security code|security code is)[:\s]+((?:\d\s*){4,8})/gi,
  ];

  for (const pattern of keywordPatterns) {
    const match = pattern.exec(text);
    if (match && match[1]) {
      // 移除所有空格，只保留数字
      const code = match[1].replace(/\s/g, "");
      return code;
    }
  }

  // 如果没有找到带关键词的，再尝试通用模式
  const generalPatterns = [
    // 6位数字（最常见）
    /\b\d{6}\b/,
    // 6位空格分隔数字 (如: 1 2 3 4 5 6)
    /\b(?:\d\s*){6}\b/,
  ];

  for (const pattern of generalPatterns) {
    const match = pattern.exec(text);
    if (match) {
      // 移除所有空格，只保留数字
      const code = match[0].replace(/\s/g, "");
      return code;
    }
  }

  return undefined;
}

/**
 * 从文本中提取有效期（分钟）
 */
function extractExpiryFromText(text: string): number | undefined {
  // 有效期模式
  const patterns = [
    // X分钟
    /(\d+)\s*分钟/g,
    // X minutes
    /(\d+)\s*minutes?/gi,
    // X mins
    /(\d+)\s*mins?/gi,
    // expires in X minutes
    /expires?\s+in\s+(\d+)\s*minutes?/gi,
    // valid for X minutes
    /valid\s+for\s+(\d+)\s*minutes?/gi,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }

  return undefined;
}

/**
 * 从 HTML 中提取纯文本
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ") // 移除 HTML 标签
    .replace(/&[a-z]+;/gi, " ") // 移除其他 HTML 实体
    .replace(/\s+/g, " ") // 合并多个空格
    .trim();
}

/**
 * 从邮件内容中提取验证码和有效期信息
 */
export function extractCodeFromEmail(
  text?: string,
  html?: string,
): ExtractedCodeInfo {
  let searchText = "";

  // 优先使用 text，如果没有则从 html 中提取
  if (text) {
    searchText = text;
  } else if (html) {
    searchText = stripHtml(html);
  }

  if (!searchText) {
    return {};
  }

  const code = extractCodeFromText(searchText);
  const expiryMinutes = extractExpiryFromText(searchText);

  return {
    code,
    expiryMinutes,
  };
}
