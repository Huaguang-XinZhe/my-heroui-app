import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// 强制使用 Node.js 运行时
export const runtime = "nodejs";

console.log("[NextAuth] Loading simplified NextAuth configuration");

// 检查必需的环境变量
if (!process.env.NEXTAUTH_SECRET) {
  console.error("[NextAuth] NEXTAUTH_SECRET is missing!");
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error("[NextAuth] Google OAuth credentials are missing!");
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  debug: true,
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log("[NextAuth] Redirect:", { url, baseUrl });
      // 简化重定向逻辑
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
});

console.log("[NextAuth] Handler created successfully");

export const GET = handler;
export const POST = handler;
