import { CachedEmailInfo } from "@/types/email";

const CACHE_KEY = "email_cache";

/**
 * 获取缓存的邮箱列表
 */
export function getCachedEmails(): CachedEmailInfo[] {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.error("读取邮箱缓存失败:", error);
    return [];
  }
}

/**
 * 设置缓存的邮箱列表
 */
export function setCachedEmails(emails: CachedEmailInfo[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(emails));
  } catch (error) {
    console.error("保存邮箱缓存失败:", error);
  }
}

/**
 * 添加邮箱到缓存
 */
export function addEmailsToCache(newEmails: CachedEmailInfo[]): void {
  const cachedEmails = getCachedEmails();
  const uniqueEmails = new Map<string, CachedEmailInfo>();

  // 先添加已缓存的邮箱
  cachedEmails.forEach((email) => {
    uniqueEmails.set(email.email, email);
  });

  // 再添加新邮箱（会覆盖重复的）
  newEmails.forEach((email) => {
    uniqueEmails.set(email.email, email);
  });

  setCachedEmails(Array.from(uniqueEmails.values()));
}

/**
 * 清空邮箱缓存
 */
export function clearEmailCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error("清空邮箱缓存失败:", error);
  }
}

/**
 * 更新邮箱的最后获取时间
 */
export function updateEmailFetchTime(email: string): void {
  try {
    const cachedEmails = getCachedEmails();
    const updatedEmails = cachedEmails.map((emailInfo) =>
      emailInfo.email === email
        ? { ...emailInfo, lastFetchTime: Date.now() }
        : emailInfo,
    );
    setCachedEmails(updatedEmails);
  } catch (error) {
    console.error("更新邮箱获取时间失败:", error);
  }
}
