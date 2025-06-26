import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * 身份验证管理 Hook
 * 处理用户登录状态检查和重定向逻辑
 */
export function useAuthManager() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hasTrialAccount, setHasTrialAccount] = useState(false);

  // 检查体验账户（仅在客户端）
  useEffect(() => {
    if (typeof window !== "undefined") {
      const trialAccount = localStorage.getItem("trialAccount");
      setHasTrialAccount(!!trialAccount);
    }
  }, []);

  useEffect(() => {
    // 如果正在加载身份验证状态，不做任何操作
    if (status === "loading") return;

    // 如果没有 NextAuth 会话且没有体验账户，重定向到登录页面
    if (status === "unauthenticated" && !hasTrialAccount) {
      router.push("/login");
      return;
    }
  }, [status, router, hasTrialAccount]);

  return {
    session,
    status,
    isAuthenticated: status === "authenticated" || hasTrialAccount,
    isLoading: status === "loading",
  };
}
