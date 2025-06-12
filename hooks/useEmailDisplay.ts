import { useEffect, useCallback } from "react";
import { useEmailState } from "./useEmailState";
import { useEmailFetcher } from "./useEmailFetcher";
import { useEmailSubscription } from "./useEmailSubscription";

interface UseEmailDisplayProps {
  selectedEmail?: string;
}

export function useEmailDisplay({ selectedEmail }: UseEmailDisplayProps) {
  // 邮件状态管理
  const emailState = useEmailState();

  // 邮件获取逻辑
  const { fetchEmails } = useEmailFetcher({
    selectedEmail,
    setIsLoading: emailState.setIsLoading,
    setError: emailState.setError,
    setLastFetchType: emailState.setLastFetchType,
    setHasFetched: emailState.setHasFetched,
    setEmail: emailState.setEmail,
  });

  // 订阅管理
  const subscription = useEmailSubscription({
    selectedEmail,
    setEmail: emailState.setEmail,
  });

  // 当选中的邮箱改变时的副作用
  useEffect(() => {
    if (selectedEmail) {
      // 获取最新邮件 - 直接调用，不依赖函数引用
      const fetchLatestEmail = async () => {
        try {
          await fetchEmails("inbox");
        } catch (error) {
          // fetchEmails 内部已经处理了错误
        }
      };
      fetchLatestEmail();
    } else {
      // 清理状态
      emailState.resetState();
    }
  }, [selectedEmail]); // 只依赖 selectedEmail

  return {
    // 邮件状态
    ...emailState,
    // 邮件操作
    fetchEmails,
    // 订阅相关
    ...subscription,
  };
}
