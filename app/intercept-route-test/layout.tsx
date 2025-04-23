export default function InterceptRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* 主页面内容 */}
      {children}
    </div>
  );
}
