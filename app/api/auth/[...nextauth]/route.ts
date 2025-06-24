import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// 强制使用 Node.js 运行时
export const runtime = "nodejs";

console.log("[NextAuth] Loading NextAuth configuration");

// Linux DO OAuth2 提供商配置
const LinuxDOProvider = {
  id: "linuxdo",
  name: "Linux DO",
  type: "oauth" as const,
  authorization: {
    url: "https://connect.linux.do/oauth2/authorize",
    params: {
      scope: "read",
      response_type: "code",
    },
  },
  token: "https://connect.linux.do/oauth2/token",
  userinfo: "https://connect.linux.do/api/user",
  clientId: process.env.LINUXDO_CLIENT_ID!,
  clientSecret: process.env.LINUXDO_CLIENT_SECRET!,

  profile(profile: any) {
    console.log("[NextAuth] LinuxDO profile:", profile);
    return {
      id: profile.id?.toString(),
      name: profile.name || profile.username || profile.login,
      email: `@${profile.username} • ${profile.trust_level} level`,
      image: profile.avatar_url,
      username: profile.username,
      trustLevel: profile.trust_level,
    };
  },
};

// 检查环境变量
console.log("[NextAuth] Environment check:", {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT_SET",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "NOT_SET",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT_SET",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "SET" : "NOT_SET",
  LINUXDO_CLIENT_ID: process.env.LINUXDO_CLIENT_ID ? "SET" : "NOT_SET",
  LINUXDO_CLIENT_SECRET: process.env.LINUXDO_CLIENT_SECRET ? "SET" : "NOT_SET",
});

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    LinuxDOProvider,
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: true,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("[NextAuth] SignIn callback:", {
        provider: account?.provider,
        user: user?.email || user?.id,
      });
      // 简化处理，暂时只做基本验证
      return true;
    },
    async jwt({ token, account, user, profile }) {
      console.log("[NextAuth] JWT callback:", { provider: account?.provider });

      // 为 LinuxDO 用户添加额外信息
      if (account?.provider === "linuxdo" && profile) {
        const linuxdoProfile = profile as any;
        token.username = linuxdoProfile.username;
        token.trustLevel = linuxdoProfile.trust_level;
        token.userId = linuxdoProfile.id?.toString();
      } else if (account?.provider === "google") {
        token.userId = user?.email;
      }

      return token;
    },
    async session({ session, token }) {
      console.log("[NextAuth] Session callback");

      // 添加用户信息到 session
      if (session.user) {
        (session.user as any).userId = token.userId;
        if (token.username) {
          (session.user as any).username = token.username;
          (session.user as any).trustLevel = token.trustLevel;
        }
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("[NextAuth] Redirect:", { url, baseUrl });

      // 确保重定向到正确的 URL
      const actualBaseUrl = process.env.NEXTAUTH_URL || baseUrl;

      if (url.startsWith("/")) {
        return `${actualBaseUrl}${url}`;
      }

      try {
        const redirectUrl = new URL(url);
        const baseUrlObj = new URL(actualBaseUrl);
        if (redirectUrl.origin === baseUrlObj.origin) {
          return url;
        }
      } catch (error) {
        console.error("[NextAuth] Redirect error:", error);
      }

      return actualBaseUrl;
    },
  },
});

console.log("[NextAuth] Handler created successfully");

export const GET = handler;
export const POST = handler;
