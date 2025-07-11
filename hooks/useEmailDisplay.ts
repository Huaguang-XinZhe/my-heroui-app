import { useEffect, useCallback } from "react";
import { useEmailState } from "./useEmailState";
import { useEmailFetcher } from "./useEmailFetcher";
import { useEmailSubscription } from "./useEmailSubscription";
import { Email } from "@/types/email";

interface UseEmailDisplayProps {
  selectedEmail?: string;
  cachedEmailContent?: Email | null;
  onEmailFetched?: (email: Email) => void;
  onSidebarRefresh?: () => void;
  onTriggerCooldown?: (type: "inbox" | "junk") => void;
}

export function useEmailDisplay({
  selectedEmail,
  cachedEmailContent,
  onEmailFetched,
  onSidebarRefresh,
  onTriggerCooldown,
}: UseEmailDisplayProps) {
  // 邮件状态管理
  const emailState = useEmailState();

  // 包装 setEmail 函数，添加缓存逻辑
  const setEmailWithCache = useCallback(
    (email: Email) => {
      emailState.setEmail(email);
      if (onEmailFetched) {
        onEmailFetched(email);
      }
      if (onSidebarRefresh) {
        onSidebarRefresh();
      }
    },
    [emailState.setEmail, onEmailFetched, onSidebarRefresh],
  );

  // 邮件获取逻辑
  const { fetchEmails: originalFetchEmails } = useEmailFetcher({
    selectedEmail,
    setIsLoading: emailState.setIsLoading,
    setError: emailState.setError,
    setLastFetchType: emailState.setLastFetchType,
    setHasFetched: emailState.setHasFetched,
    setEmail: setEmailWithCache,
  });

  // 包装 fetchEmails 函数，添加立即冷却逻辑
  const fetchEmails = useCallback(
    async (type: "inbox" | "junk") => {
      if (onTriggerCooldown) {
        onTriggerCooldown(type);
      }
      return originalFetchEmails(type);
    },
    [originalFetchEmails, onTriggerCooldown],
  );

  // 订阅管理
  const subscription = useEmailSubscription({
    selectedEmail,
    setEmail: setEmailWithCache,
  });

  // 当选中的邮箱改变时的副作用
  useEffect(() => {
    if (selectedEmail) {
      // 每次切换邮箱时，先重置状态（除了正在加载的状态）
      emailState.setEmail(null);
      emailState.setError(null);
      emailState.setLastFetchType(null);
      emailState.setHasFetched(false);

      // 如果有缓存的邮件内容，显示缓存内容并标记为已获取
      if (cachedEmailContent) {
        emailState.setEmail(cachedEmailContent);
        emailState.setHasFetched(true);
      } else {
        // 没有缓存内容时，自动获取收件箱邮件
        const fetchLatestEmail = async () => {
          try {
            await fetchEmails("inbox");
          } catch (error) {
            // fetchEmails 内部已经处理了错误
          }
        };
        fetchLatestEmail();
      }
    } else {
      // 清理状态
      emailState.resetState();
    }
  }, [selectedEmail, cachedEmailContent]); // 依赖 selectedEmail 和 cachedEmailContent

  return {
    // 邮件状态
    ...emailState,
    // 邮件操作
    fetchEmails,
    // 订阅相关
    ...subscription,
  };
}
