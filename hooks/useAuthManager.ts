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

  // 立即检查体验账户状态，避免初始化延迟
  const [hasTrialAccount, setHasTrialAccount] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("trialAccount");
    }
    return false;
  });

  // 检查体验账户（仅在客户端）
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkTrialAccount = () => {
        const trialAccount = localStorage.getItem("trialAccount");
        setHasTrialAccount(!!trialAccount);
      };

      // 立即检查一次
      checkTrialAccount();

      // 定期检查 localStorage 变化（处理其他标签页的变化）
      const intervalId = setInterval(checkTrialAccount, 1000);

      // 监听 storage 事件（同一浏览器其他标签页的变化）
      window.addEventListener("storage", checkTrialAccount);

      return () => {
        clearInterval(intervalId);
        window.removeEventListener("storage", checkTrialAccount);
      };
    }
  }, []);

  useEffect(() => {
    // 如果正在加载身份验证状态，不做任何操作
    if (status === "loading") return;

    // 实时检查体验账户，避免竞态条件
    const currentTrialAccount =
      typeof window !== "undefined"
        ? localStorage.getItem("trialAccount")
        : null;

    // 如果没有 NextAuth 会话且没有体验账户，重定向到登录页面
    if (status === "unauthenticated" && !currentTrialAccount) {
      router.push("/login");
    }
  }, [status, router]);

  // 实时检查体验账户状态
  const currentHasTrialAccount =
    typeof window !== "undefined"
      ? !!localStorage.getItem("trialAccount")
      : false;

  return {
    session,
    status,
    isAuthenticated: status === "authenticated" || currentHasTrialAccount,
    isLoading: status === "loading",
  };
}
