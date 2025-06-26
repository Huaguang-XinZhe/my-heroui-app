import { useState } from "react";
import { Session } from "next-auth";
import { addEmailsToCache, getCachedEmails } from "@/cache/emailCache";
import { showSuccessToast } from "@/utils/toast";

/**
 * OAuth 邮箱管理 Hook
 * 处理直接登录（非邀请）的 OAuth 用户的邮箱账户加载
 */
export function useOAuthEmailManager() {
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [accountsChecked, setAccountsChecked] = useState(false);

  const checkOAuthDirectLogin = async (
    session: Session | null,
    status: string,
  ) => {
    try {
      // 只处理 OAuth 登录且未检查过账户的情况
      if (!session?.user || status !== "authenticated" || accountsChecked)
        return;

      // 检查是否是邀请登录（有邀请令牌）
      const inviteToken = sessionStorage.getItem("inviteToken");
      if (inviteToken) return; // 是邀请登录，由邀请分配逻辑处理

      const sessionUser = session.user as any;
      if (!sessionUser.userId) return; // 不是 OAuth 登录

      console.log(
        "[OAuthEmailManager] OAuth direct login detected, checking email accounts...",
      );

      // 检查缓存中是否已有邮箱账户
      const cachedEmails = getCachedEmails();
      if (cachedEmails.length > 0) {
        console.log(
          `[OAuthEmailManager] Email accounts already cached (${cachedEmails.length}), skipping API call`,
        );
        setAccountsChecked(true);
        return;
      }

      setIsLoadingAccounts(true);
      setAccountsChecked(true);

      // 调用后端 API 获取用户的邮箱账户
      const response = await fetch("/api/mail/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: sessionUser.userId }),
      });

      if (!response.ok) {
        console.log("[OAuthEmailManager] Failed to fetch user email accounts");
        return;
      }

      const result = await response.json();

      if (result.success && result.accounts && result.accounts.length > 0) {
        // 将邮箱账户添加到缓存
        const cacheEmailInfo = result.accounts.map((account: any) => ({
          email: account.email,
          refreshToken: account.refresh_token || "",
          protocolType: account.protocol_type,
          user_id: account.user_id,
          password: account.password,
          serviceProvider: account.service_provider,
        }));

        addEmailsToCache(cacheEmailInfo);
        console.log(
          `[OAuthEmailManager] Loaded ${cacheEmailInfo.length} email accounts to cache`,
        );

        showSuccessToast(
          `欢迎回来！已加载 ${cacheEmailInfo.length} 个邮箱账户`,
        );
      } else {
        console.log("[OAuthEmailManager] No email accounts found for user");
      }
    } catch (error) {
      console.error(
        "[OAuthEmailManager] Error checking OAuth direct login:",
        error,
      );
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  return {
    isLoadingAccounts,
    checkOAuthDirectLogin,
  };
}
