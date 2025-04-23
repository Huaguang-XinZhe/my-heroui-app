import { Header } from "@/components/Header";
import { HistorySidebar } from "@/components/HistorySidebar";
import { EmailSidebar } from "@/components/EmailSidebar";
import { FadeIn } from "@/components/animated-elements";
import { EmailFetcher } from "@/components/EmailFetcher";
import { EmailDisplay } from "@/components/EmailDisplay";

export default function HomePage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <FadeIn className="flex h-full min-h-0 w-full justify-center gap-6 overflow-hidden p-4">
        <HistorySidebar />
        <div className="flex max-w-2xl flex-1 flex-col gap-6 sm:min-w-[450px]">
          {/* 邮箱输入和获取区域 */}
          <EmailFetcher />

          {/* 收件箱 */}
          <EmailDisplay
            id="amazon-1"
            sender="service@amazon.com"
            icon="https://www.amazon.com/favicon.ico"
            topic="Amazon 注册成功"
            date="2023-06-10 14:30"
            code="842913"
          />
        </div>
        <EmailSidebar />
      </FadeIn>
    </div>
  );
}
