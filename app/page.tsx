"use client";

import { useRef } from "react";
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
  const {
    selectedEmail,
    setSelectedEmail,
    cachedEmailContent,
    cacheEmailContent,
    clearCachedEmailContent,
  } = useSelectedEmail();

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
