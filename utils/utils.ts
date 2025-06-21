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

/**
 * 格式化时间显示，返回显示信息和位置
 */
export function getTimeDisplay(timestamp?: number) {
  if (!timestamp) return null;

  const now = new Date();
  const fetchTime = new Date(timestamp);

  // 检查是否是今天
  const isToday =
    now.getFullYear() === fetchTime.getFullYear() &&
    now.getMonth() === fetchTime.getMonth() &&
    now.getDate() === fetchTime.getDate();

  if (isToday) {
    // 今天：只显示时间
    return {
      display: fetchTime.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      showBelow: false,
    };
  }

  // 计算是否在本周内
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  if (fetchTime >= startOfWeek && fetchTime <= endOfWeek) {
    // 本周内：显示周几
    const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return {
      display: weekdays[fetchTime.getDay()],
      showBelow: false,
    };
  }

  // 其他情况：根据是否是当年决定显示格式
  const isCurrentYear = now.getFullYear() === fetchTime.getFullYear();

  if (isCurrentYear) {
    // 当年：显示月-日
    const display = fetchTime.toLocaleDateString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
    });
    return {
      display,
      showBelow: false,
    };
  } else {
    // 非当年：显示完整日期，放在下方
    const display = fetchTime.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return {
      display,
      showBelow: true,
    };
  }
}

/**
 * 格式化邮件日期显示
 */
export function formatEmailDate(date: string | Date): string {
  const emailDate = typeof date === "string" ? new Date(date) : date;
  const now = new Date();

  // 计算时间差
  const diffMs = now.getTime() - emailDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // 今天：显示时间
    return emailDate.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } else if (diffDays === 1) {
    // 昨天
    return "昨天";
  } else if (diffDays < 7) {
    // 一周内：显示周几
    const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return weekdays[emailDate.getDay()];
  } else if (emailDate.getFullYear() === now.getFullYear()) {
    // 当年：显示月-日
    return emailDate.toLocaleDateString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
    });
  } else {
    // 其他年份：显示完整日期
    return emailDate.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }
}
