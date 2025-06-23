import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // 检查是否访问受保护的管理员路径
    if (req.nextUrl.pathname.startsWith("/admin/")) {
      // 检查用户是否为管理员
      if (!req.nextauth.token?.isAdmin) {
        // 非管理员重定向到未授权页面
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // 对于受保护的路径，必须有 token
        if (req.nextUrl.pathname.startsWith("/admin/")) {
          return !!token;
        }
        return true;
      },
    },
  },
);

export const config = {
  matcher: [
    // 保护所有管理员页面
    "/admin/:path*",
    // 可以在这里添加其他需要保护的路径
  ],
};
