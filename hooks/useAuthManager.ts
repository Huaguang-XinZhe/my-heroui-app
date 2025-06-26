import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * 身份验证管理 Hook
 * 处理用户登录状态检查和重定向逻辑
 */
export function useAuthManager() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 如果正在加载身份验证状态，不做任何操作
    if (status === "loading") return;

    // 检查是否有体验账户信息（卡密登录）
    const trialAccount = localStorage.getItem("trialAccount");

    // 如果没有 NextAuth 会话且没有体验账户，重定向到登录页面
    if (status === "unauthenticated" && !trialAccount) {
      router.push("/login");
      return;
    }
  }, [status, router]);

  return {
    session,
    status,
    isAuthenticated:
      status === "authenticated" || localStorage.getItem("trialAccount"),
    isLoading: status === "loading",
  };
}
