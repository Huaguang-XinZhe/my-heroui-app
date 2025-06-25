"use client";

import { useRef, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/spinner";
import { Header } from "@/components/layout/Header";
// import { HistorySidebar } from "@/components/HistorySidebar";
import { EmailSidebar } from "@/components/navigation/EmailSidebar";
import { CurrentEmailInfo } from "@/components/email/CurrentEmailInfo";
import { FadeIn } from "@/components/common/animated-elements";
import { EmailFetcher } from "@/components/email/EmailFetcher";
import { EmailDisplay } from "@/components/email/EmailDisplay";
import { EmailFormatGuide } from "@/components/email/EmailFormatGuide";
import { FormatGuideProvider } from "@/contexts/FormatGuideContext";
import { useSelectedEmail } from "@/hooks/useSelectedEmail";
import { getOAuthUser } from "@/utils/oauthUserStorage";
import { addEmailsToCache } from "@/cache/emailCache";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isProcessingInvite, setIsProcessingInvite] = useState(false);
  const {
    selectedEmail,
    setSelectedEmail,
    cachedEmailContent,
    cacheEmailContent,
    clearCachedEmailContent,
  } = useSelectedEmail();

  // 检查身份验证状态和处理邀请分配
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

    // 检查 OAuth 用户的邀请邮箱分配
    checkOAuthInviteAllocation();
  }, [status, router]);

  // 检查 OAuth 用户是否需要根据邀请分配邮箱
  const checkOAuthInviteAllocation = async () => {
    try {
      // 只处理 OAuth 登录的情况
      if (!session?.user || status !== "authenticated") return;

      // 检查 sessionStorage 中是否有邀请令牌
      const inviteToken = sessionStorage.getItem("inviteToken");
      if (!inviteToken) return; // 没有邀请令牌，不是通过邀请链接登录的

      console.log("检测到 OAuth 邀请登录，开始处理邮箱分配...");

      const sessionUser = session.user as any;
      let userId: string;

      // 获取用户 ID
      if (sessionUser.userId) {
        userId = sessionUser.userId;
      } else {
        // 从本地存储获取 OAuth 用户信息
        const oauthUser = getOAuthUser();
        if (!oauthUser) {
          console.log("无法获取 OAuth 用户信息");
          return;
        }
        userId = oauthUser.id;
      }

      setIsProcessingInvite(true);

      // 调用邮箱分配 API
      const response = await fetch("/api/invite/oauth-allocate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviteToken,
          userId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 将分配的邮箱添加到缓存
        if (result.cacheEmailInfo && result.cacheEmailInfo.length > 0) {
          addEmailsToCache(result.cacheEmailInfo);

          const message = result.isExisting
            ? `欢迎回来！已加载 ${result.cacheEmailInfo.length} 个邮箱账户`
            : `邀请验证成功！已为您分配 ${result.cacheEmailInfo.length} 个专属邮箱账户`;

          showSuccessToast(message);

          console.log(
            `OAuth 邮箱分配成功: ${result.cacheEmailInfo.length} 个邮箱已添加到缓存`,
          );
        }

        // 如果是新分配的邮箱，记录邀请使用
        if (!result.isExisting) {
          try {
            const useInviteResponse = await fetch("/api/admin/invite/use", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                token: inviteToken,
                userId,
                registrationMethod: "oauth",
              }),
            });

            const useResult = await useInviteResponse.json();
            if (!useResult.success) {
              console.error("记录邀请使用失败:", useResult.error);
            } else {
              console.log("邀请使用记录成功");
            }
          } catch (error) {
            console.error("调用邀请使用 API 失败:", error);
          }
        }

        // 清除邀请令牌，避免重复处理
        sessionStorage.removeItem("inviteToken");
      } else {
        console.error("OAuth 邮箱分配失败:", result.error);
        showErrorToast(result.error || "邮箱分配失败");

        // 仍然清除令牌，避免无限重试
        sessionStorage.removeItem("inviteToken");
      }
    } catch (error) {
      console.error("检查 OAuth 邀请分配时出错:", error);
      // 发生错误时也清除令牌
      sessionStorage.removeItem("inviteToken");
    } finally {
      setIsProcessingInvite(false);
    }
  };

  const sidebarRefreshRef = useRef<(() => void) | null>(null);
  const currentEmailInfoRefreshRef = useRef<(() => void) | null>(null);
  const triggerCooldownRef = useRef<((type: "inbox" | "junk") => void) | null>(
    null,
  );

  // 处理邮箱选择
  const handleEmailSelect = (email: string) => {
    if (email !== selectedEmail) {
      // 切换邮箱时清除缓存的邮件内容
      clearCachedEmailContent();
    }
    setSelectedEmail(email);
  };

  // 处理邮件获取成功，缓存邮件内容
  const handleEmailFetched = (email: any) => {
    cacheEmailContent(email);
  };

  // 处理侧边栏刷新
  const handleSidebarRefresh = () => {
    if (sidebarRefreshRef.current) {
      sidebarRefreshRef.current();
    }
    // 同时刷新当前邮箱信息
    if (currentEmailInfoRefreshRef.current) {
      currentEmailInfoRefreshRef.current();
    }
  };

  // 处理冷却触发
  const handleTriggerCooldown = (type: "inbox" | "junk") => {
    if (triggerCooldownRef.current) {
      triggerCooldownRef.current(type);
    }
  };

  // 如果正在加载身份验证状态或处理邀请分配，显示加载界面
  if (status === "loading" || isProcessingInvite) {
    const loadingText = isProcessingInvite
      ? "正在为您分配邮箱账户..."
      : "正在验证身份...";

    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <Spinner size="lg" color="primary" />
        <p className="text-gray-400">{loadingText}</p>
      </div>
    );
  }

  return (
    <FormatGuideProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <Header />
        <FadeIn className="flex h-full min-h-0 w-full justify-center gap-6 overflow-hidden p-4">
          {/* 暂时隐藏历史邮件板块 */}
          {/* <HistorySidebar /> */}

          <div className="flex max-w-2xl flex-1 flex-col gap-6 sm:min-w-[450px]">
            {/* 暂时隐藏邮箱输入和获取区域 */}
            {/* <EmailFetcher /> */}

            {/* 当前邮箱信息 */}
            <CurrentEmailInfo
              selectedEmail={selectedEmail}
              onRefreshInfo={(refreshFn) => {
                currentEmailInfoRefreshRef.current = refreshFn;
              }}
            />

            {/* 收件箱 */}
            <EmailDisplay
              selectedEmail={selectedEmail}
              cachedEmailContent={cachedEmailContent}
              onEmailFetched={handleEmailFetched}
              onSidebarRefresh={handleSidebarRefresh}
              onTriggerCooldown={handleTriggerCooldown}
              triggerCooldownRef={triggerCooldownRef}
            />
          </div>

          <EmailSidebar
            onEmailSelect={handleEmailSelect}
            selectedEmail={selectedEmail}
            onRefreshList={(refreshFn) => {
              sidebarRefreshRef.current = refreshFn;
            }}
            onTriggerCooldown={handleTriggerCooldown}
          />
        </FadeIn>

        {/* 格式说明组件 - 独立覆盖层 */}
        <EmailFormatGuide />
      </div>
    </FormatGuideProvider>
  );
}
