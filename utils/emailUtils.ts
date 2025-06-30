import { MailInfo } from "@/types/email";
import { getCachedEmails } from "../cache/emailCache";

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
  let targetDomain = domain;

  if (parts.length === 3 && parts[2] === "com") {
    // 三级域名且一级部分是 com：直接取到二级域名
    // 例如：user@mail.google.com -> google.com
    targetDomain = `${parts[1]}.com`;
  } else {
    // 检查精确的域名映射
    const mappedDomain = domainMap[domain];
    if (mappedDomain) {
      targetDomain = mappedDomain;
    } else {
      // 如果没有精确映射，尝试关键词匹配
      for (const [keyword, keywordTargetDomain] of Object.entries(keywordMap)) {
        if (domain.includes(keyword)) {
          targetDomain = keywordTargetDomain;
          break;
        }
      }
    }
  }

  // 构造 favicon URL 并通过代理访问
  const faviconUrl = `https://www.${targetDomain}/favicon.ico`;
  return `/api/proxy-image?url=${encodeURIComponent(faviconUrl)}`;
}

/**
 * 解析邮箱地址，返回用户名和域名
 */
export function parseEmail(
  email: string,
): { username: string; domain: string } | null {
  const parts = email.split("@");
  if (parts.length !== 2) return null;

  return {
    username: parts[0],
    domain: parts[1],
  };
}

/**
 * 辅助函数：截断邮箱地址，保留完整后缀
 */
export function truncateEmail(email: string): string {
  const parsed = parseEmail(email);
  if (!parsed) return email;

  const { username, domain } = parsed;
  if (username.length <= 10) return email;

  return `${username.substring(0, 7)}...@${domain}`;
}

/**
 * 检查邮箱是否被截断
 */
export function isEmailTruncated(email: string): boolean {
  const parsed = parseEmail(email);
  if (!parsed) return false;

  return parsed.username.length > 10;
}
