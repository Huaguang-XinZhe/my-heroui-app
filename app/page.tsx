"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
// import { HistorySidebar } from "@/components/HistorySidebar";
import { EmailSidebar } from "@/components/EmailSidebar";
import { FadeIn } from "@/components/animated-elements";
import { EmailFetcher } from "@/components/EmailFetcher";
import { EmailDisplay } from "@/components/EmailDisplay";

export default function HomePage() {
  const [selectedEmail, setSelectedEmail] = useState<string>("");

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <FadeIn className="flex h-full min-h-0 w-full justify-center gap-6 overflow-hidden p-4">
        {/* 暂时隐藏历史邮件板块 */}
        {/* <HistorySidebar /> */}

        <div className="flex max-w-2xl flex-1 flex-col gap-6 sm:min-w-[450px]">
          {/* 暂时隐藏邮箱输入和获取区域 */}
          <EmailFetcher />

          {/* 收件箱 */}
          <EmailDisplay selectedEmail={selectedEmail} />
        </div>

        <EmailSidebar
          onEmailSelect={setSelectedEmail}
          selectedEmail={selectedEmail}
        />
      </FadeIn>
    </div>
  );
}
