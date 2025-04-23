import "@/styles/globals.css";
import { Metadata } from "next";
import { Providers } from "./providers";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import clsx from "clsx";
import { Background } from "@/components/Background";

// 客户端组件不能导出 metadata❗
export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`, // 具体页面的 title 再加上后边的部分
  },
  description: siteConfig.description,
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="zh-CN">
      <head />
      <body className={clsx("font-sans antialiased", fontSans.variable)}>
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <Background>{children}</Background>
          {/* {children} */}
        </Providers>
      </body>
    </html>
  );
}
