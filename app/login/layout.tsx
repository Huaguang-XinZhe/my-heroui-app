import { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { MotionHeader } from "@/components/MotionHeader";

export const metadata: Metadata = {
  title: "登录 - 邮取星",
  description: "登录到邮取星账户，享受便捷的邮件管理服务",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <MotionHeader />
      <main className="flex flex-1 items-center justify-center">
        {children}
      </main>
      <Footer />
    </div>
  );
}
