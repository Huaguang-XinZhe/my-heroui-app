import { useEffect } from "react";
import { useAuthManager } from "./useAuthManager";
import { useOAuthEmailManager } from "./useOAuthEmailManager";
import { useInviteAllocation } from "./useInviteAllocation";

/**
 * 主页管理 Hook
 * 整合身份验证、OAuth 邮箱管理和邀请分配逻辑
 */
export function useHomePageManager() {
  const { session, status, isAuthenticated, isLoading } = useAuthManager();
  const { isLoadingAccounts, checkOAuthDirectLogin } = useOAuthEmailManager();
  const { isProcessingInvite, checkOAuthInviteAllocation } =
    useInviteAllocation();

  // 处理 OAuth 用户的邮箱管理
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // 检查 OAuth 用户的邀请邮箱分配
      checkOAuthInviteAllocation(session, status);

      // 检查 OAuth 用户的邮箱账户（非邀请登录）
      checkOAuthDirectLogin(session, status);
    }
  }, [session, status, isAuthenticated, isLoading]);

  return {
    session,
    status,
    isAuthenticated,
    isLoading: isLoading || isProcessingInvite || isLoadingAccounts,
    loadingText: isProcessingInvite
      ? "正在为您分配邮箱账户..."
      : isLoadingAccounts
        ? "正在加载邮箱账户..."
        : "正在验证身份...",
  };
}
