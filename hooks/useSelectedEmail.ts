import { useState, useEffect } from "react";
import { Email } from "@/types/email";

const SELECTED_EMAIL_KEY = "selected_email";
const CACHED_EMAIL_CONTENT_KEY = "cached_email_content";

export function useSelectedEmail() {
  const [selectedEmail, setSelectedEmail] = useState<string>("");
  const [cachedEmailContent, setCachedEmailContent] = useState<Email | null>(
    null,
  );

  // 组件挂载时从 localStorage 恢复选中状态和邮件内容
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(SELECTED_EMAIL_KEY);
      const savedEmailContent = localStorage.getItem(CACHED_EMAIL_CONTENT_KEY);

      if (savedEmail) {
        setSelectedEmail(savedEmail);
      }

      if (savedEmailContent) {
        setCachedEmailContent(JSON.parse(savedEmailContent));
      }
    } catch (error) {
      console.error("恢复选中邮箱状态失败:", error);
    }
  }, []);

  // 处理邮箱选择，同时保存到 localStorage
  const handleEmailSelect = (email: string) => {
    setSelectedEmail(email);
    try {
      if (email) {
        localStorage.setItem(SELECTED_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(SELECTED_EMAIL_KEY);
        localStorage.removeItem(CACHED_EMAIL_CONTENT_KEY);
        setCachedEmailContent(null);
      }
    } catch (error) {
      console.error("保存选中邮箱状态失败:", error);
    }
  };

  // 缓存邮件内容
  const cacheEmailContent = (email: Email) => {
    setCachedEmailContent(email);
    try {
      localStorage.setItem(CACHED_EMAIL_CONTENT_KEY, JSON.stringify(email));
    } catch (error) {
      console.error("缓存邮件内容失败:", error);
    }
  };

  // 清除缓存的邮件内容
  const clearCachedEmailContent = () => {
    setCachedEmailContent(null);
    try {
      localStorage.removeItem(CACHED_EMAIL_CONTENT_KEY);
    } catch (error) {
      console.error("清除缓存邮件内容失败:", error);
    }
  };

  return {
    selectedEmail,
    setSelectedEmail: handleEmailSelect,
    cachedEmailContent,
    cacheEmailContent,
    clearCachedEmailContent,
  };
}
