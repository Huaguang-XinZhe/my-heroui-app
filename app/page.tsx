"use client";

import { useRef } from "react";
import { Spinner } from "@heroui/spinner";
import { Header } from "@/components/layout/Header";
import { EmailSidebar } from "@/components/navigation/EmailSidebar";
import { CurrentEmailInfo } from "@/components/email/CurrentEmailInfo";
import { FadeIn } from "@/components/common/animated-elements";
import { EmailDisplay } from "@/components/email/EmailDisplay";
import { EmailFormatGuide } from "@/components/email/EmailFormatGuide";
import { FormatGuideProvider } from "@/contexts/FormatGuideContext";
import { useSelectedEmail } from "@/hooks/useSelectedEmail";
import { useHomePageManager } from "@/hooks/useHomePageManager";

export default function HomePage() {
  const { isLoading, loadingText } = useHomePageManager();
  const {
    selectedEmail,
    setSelectedEmail,
    cachedEmailContent,
    cacheEmailContent,
    clearCachedEmailContent,
  } = useSelectedEmail();

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

  // 如果正在加载，显示加载界面
  if (isLoading) {
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
