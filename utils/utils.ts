import { MailInfo } from "@/types/email";
import { getCachedEmails } from "./emailCache";

export function filterNewEmails(mailInfos: MailInfo[]): {
  newEmails: MailInfo[];
  existingEmails: MailInfo[];
} {
  const cachedEmails = getCachedEmails();
  const cachedTokens = new Set(cachedEmails.map((email) => email.refreshToken));

  const newEmails: MailInfo[] = [];
  const existingEmails: MailInfo[] = [];

  mailInfos.forEach((mailInfo) => {
    if (cachedTokens.has(mailInfo.refreshToken)) {
      existingEmails.push(mailInfo);
    } else {
      newEmails.push(mailInfo);
    }
  });

  return { newEmails, existingEmails };
}

/**
 * 清理文本两端的不可见字符，包括那些 trim() 无法清除的字符
 * 同时合并多个连续的空行为一个空行
 */
export function cleanText(text: string): string {
  // 定义要清理的字符（按重要性排序）
  const chars = [
    "\\s", // 标准空白字符（空格、换行、制表符等）
    "\\u00A0", // 不间断空格（网页中常见）
    "\\u200B", // 零宽空格（复制粘贴时常带入）
    "\\uFEFF", // 字节顺序标记 BOM
    "\\u00AD", // 软连字符
    "\\u200C", // 零宽不连字符
    "\\u200D", // 零宽连字符
  ].join("");

  // 构造正则：匹配开头或结尾的这些字符
  const trimPattern = new RegExp(`^[${chars}]+|[${chars}]+$`, "g");

  // 先清理两端的不可见字符
  let cleaned = text.replace(trimPattern, "");

  // 合并多个连续的空行为一个空行
  // 匹配多个连续的换行符（包括 \r\n、\n、\r）和空白字符
  cleaned = cleaned.replace(/(?:\r?\n\s*){2,}/g, "\n\n");

  return cleaned;
}

/**
 * 根据邮箱后缀构造 favicon URL
 */
export function getFaviconUrl(email: string): string {
  const domain = email.split("@")[1];
  if (!domain) {
    return "/default-favicon.svg"; // 默认图标
  }

  // 域名映射表
  const domainMap: Record<string, string> = {
    "gmail.com": "google.com",
    "outlook.com": "microsoft.com",
    "outlook.in": "microsoft.com",
    "hotmail.com": "microsoft.com",
    "cursor.sh": "cursor.com",
    "cursor.so": "cursor.com",
    "amazonaws.com": "amazon.com",
    "icloud.com": "apple.com",
  };

  // 关键词映射表
  const keywordMap: Record<string, string> = {
    outlook: "microsoft.com",
    hotmail: "microsoft.com",
    live: "microsoft.com",
    msn: "microsoft.com",
    gmail: "google.com",
    aws: "amazon.com",
    icloud: "apple.com",
  };

  const parts = domain.split(".");

  if (parts.length === 3 && parts[2] === "com") {
    // 三级域名且一级部分是 com：直接取到二级域名，前边加 www
    // 例如：user@mail.google.com -> www.google.com
    return `https://www.${parts[1]}.com/favicon.ico`;
  } else {
    // 首先检查精确的域名映射
    const mappedDomain = domainMap[domain];
    if (mappedDomain) {
      return `https://www.${mappedDomain}/favicon.ico`;
    }

    // 如果没有精确映射，尝试关键词匹配
    for (const [keyword, targetDomain] of Object.entries(keywordMap)) {
      if (domain.includes(keyword)) {
        return `https://www.${targetDomain}/favicon.ico`;
      }
    }

    // 如果都没有匹配，直接前边加 www
    return `https://www.${domain}/favicon.ico`;
  }
}

/**
 * 格式化邮件日期为易读格式
 * 处理两种格式：
 * 1. ISO 8601 格式：2025-05-30T05:41:58-07:00
 * 2. 简短格式：2025-04-21T17:45:28Z
 */
export function formatEmailDate(dateString: string): string {
  try {
    // 尝试解析日期字符串
    const date = new Date(dateString);

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return dateString; // 如果解析失败，返回原字符串
    }

    // 获取本地时间
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() 返回 0-11
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // 格式化为 YYYY-M-D HH:MM
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedHours = hours.toString().padStart(2, "0");

    return `${year}-${month}-${day} ${formattedHours}:${formattedMinutes}`;
  } catch (error) {
    // 如果出现任何错误，返回原字符串
    return dateString;
  }
}
