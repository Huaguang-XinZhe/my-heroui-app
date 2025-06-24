import { User } from "@/types/email";

const OAUTH_USER_STORAGE_KEY = "oauth_user_info";

/**
 * OAuth 用户信息
 */
export interface OAuthUserInfo extends User {
  provider: "google" | "linuxdo";
  username?: string; // Linux DO 用户名
}

/**
 * 保存 OAuth 用户信息到本地存储
 */
export function saveOAuthUser(userInfo: OAuthUserInfo): void {
  try {
    localStorage.setItem(OAUTH_USER_STORAGE_KEY, JSON.stringify(userInfo));
    console.log("OAuth 用户信息已保存到本地:", userInfo.id);
  } catch (error) {
    console.error("保存 OAuth 用户信息失败:", error);
  }
}

/**
 * 从本地存储获取 OAuth 用户信息
 */
export function getOAuthUser(): OAuthUserInfo | null {
  try {
    const stored = localStorage.getItem(OAUTH_USER_STORAGE_KEY);
    if (!stored) return null;

    const userInfo = JSON.parse(stored) as OAuthUserInfo;
    console.log("从本地获取 OAuth 用户信息:", userInfo.id);
    return userInfo;
  } catch (error) {
    console.error("获取 OAuth 用户信息失败:", error);
    return null;
  }
}

/**
 * 清除本地存储的 OAuth 用户信息
 */
export function clearOAuthUser(): void {
  try {
    localStorage.removeItem(OAUTH_USER_STORAGE_KEY);
    console.log("OAuth 用户信息已清除");
  } catch (error) {
    console.error("清除 OAuth 用户信息失败:", error);
  }
}

/**
 * 检查用户是否存在于本地存储
 */
export function hasOAuthUser(): boolean {
  return localStorage.getItem(OAUTH_USER_STORAGE_KEY) !== null;
}
