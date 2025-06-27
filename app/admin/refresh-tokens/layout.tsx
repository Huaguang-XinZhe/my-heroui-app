import { Metadata } from "next";

export const metadata: Metadata = {
  title: "分批刷新 Refresh Token - 管理后台",
  description: "批量刷新邮箱账户的 refresh_token，支持分批处理和单个测试",
};

export default function RefreshTokensLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-y-auto">
      <div className="container mx-auto max-w-6xl space-y-6 p-6">
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold">分批刷新 Refresh Token</h1>
          <p className="text-gray-600">
            获取所有未刷新 refresh_token 的邮箱账户，分批完成刷新操作
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
