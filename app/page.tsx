"use client";

import { useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/spinner";
import { Header } from "@/components/Header";
// import { HistorySidebar } from "@/components/HistorySidebar";
import { EmailSidebar } from "@/components/EmailSidebar";
import { FadeIn } from "@/components/animated-elements";
import { EmailFetcher } from "@/components/EmailFetcher";
import { EmailDisplay } from "@/components/EmailDisplay";
import { EmailFormatGuide } from "@/components/EmailFormatGuide";
import { FormatGuideProvider } from "@/contexts/FormatGuideContext";
import { useSelectedEmail } from "@/hooks/useSelectedEmail";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    selectedEmail,
    setSelectedEmail,
    cachedEmailContent,
    cacheEmailContent,
    clearCachedEmailContent,
  } = useSelectedEmail();

  // 检查身份验证状态
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

  const sidebarRefreshRef = useRef<(() => void) | null>(null);
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
  };

  // 处理冷却触发
  const handleTriggerCooldown = (type: "inbox" | "junk") => {
    if (triggerCooldownRef.current) {
      triggerCooldownRef.current(type);
    }
  };

  // 如果正在加载身份验证状态，显示加载界面
  if (status === "loading") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <Spinner size="lg" color="primary" />
        <p className="text-gray-400">正在验证身份...</p>
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
