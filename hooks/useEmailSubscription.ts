import { useState, useCallback, useEffect } from "react";
import { SubscriptionState } from "@/types/subscription";
import { Email, MailRequestInfo } from "@/types/email";
import { mailSubscriptionService } from "@/services/subscriptionService";
import { getCachedEmails } from "@/utils/emailCache";
import { showSuccessToast, showErrorToast, showInfoToast } from "@/utils/toast";

interface UseEmailSubscriptionProps {
  selectedEmail?: string;
  setEmail: (email: Email) => void;
}

export function useEmailSubscription({
  selectedEmail,
  setEmail,
}: UseEmailSubscriptionProps) {
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>(
    {
      status: "idle",
    },
  );

  // 处理新邮件接收
  const handleEmailReceived = useCallback(
    (newEmail: Email) => {
      setEmail(newEmail);
      showSuccessToast("收到新邮件", newEmail.subject);
    },
    [setEmail],
  );

  // 处理订阅状态变化
  const handleSubscriptionStateChange = useCallback(
    (state: SubscriptionState) => {
      setSubscriptionState(state);

      // 根据状态显示相应的提示
      if (state.status === "connected" && state.message?.includes("订阅成功")) {
        showSuccessToast("订阅成功", "正在监听新邮件");
      } else if (state.status === "error" && state.error) {
        showErrorToast("订阅失败", state.error);
      }
    },
    [],
  );

  // 开始订阅
  const handleSubscribe = useCallback(async () => {
    if (!selectedEmail) return;

    try {
      const cachedEmails = getCachedEmails();
      const emailInfo = cachedEmails.find((e) => e.email === selectedEmail);

      if (!emailInfo) {
        showErrorToast("订阅失败", "邮箱信息未找到");
        return;
      }

      const mailInfo: MailRequestInfo = {
        email: emailInfo.email,
        refreshToken: emailInfo.refreshToken,
        protocolType: emailInfo.protocolType,
      };

      await mailSubscriptionService.subscribe({
        mailInfo,
        refreshNeeded: false,
      });
    } catch (error) {
      showErrorToast(
        "订阅失败",
        error instanceof Error ? error.message : "未知错误",
      );
    }
  }, [selectedEmail]);

  // 停止订阅
  const handleUnsubscribe = useCallback(() => {
    mailSubscriptionService.disconnect();
    showInfoToast("订阅已停止", "不再监听新邮件");
  }, []);

  // 重置订阅状态
  const resetSubscription = useCallback(() => {
    mailSubscriptionService.disconnect();
    setSubscriptionState({ status: "idle" });
  }, []);

  // 设置订阅服务的回调函数
  useEffect(() => {
    mailSubscriptionService.setOnStateChange(handleSubscriptionStateChange);
    mailSubscriptionService.setOnEmailReceived(handleEmailReceived);

    return () => {
      mailSubscriptionService.cleanup();
    };
  }, [handleSubscriptionStateChange, handleEmailReceived]);

  // 当邮箱变化时自动清理订阅
  useEffect(() => {
    if (!selectedEmail) {
      // 当没有选中邮箱时，断开订阅并重置状态
      mailSubscriptionService.disconnect();
      setSubscriptionState({ status: "idle" });
    } else {
      // 当切换邮箱时，断开之前的订阅
      mailSubscriptionService.disconnect();
      setSubscriptionState({ status: "idle" });
    }
  }, [selectedEmail]);

  return {
    subscriptionState,
    handleSubscribe,
    handleUnsubscribe,
    resetSubscription,
  };
}
