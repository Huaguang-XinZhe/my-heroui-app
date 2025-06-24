import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createUser, getUserById } from "@/lib/supabase/users";
import { CreateUserRequest } from "@/types/email";

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

// 管理员邮箱列表（Google 用户）
const ADMIN_EMAILS: string[] = ["liu200111092022@gmail.com"];

// 管理员 Linux DO ID 列表
const ADMIN_LINUXDO_IDS: string[] = ["58149"];

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    LinuxDOProvider,
  ],
  pages: {
    signIn: "/login", // 修正登录页面路径
    error: "/login", // 错误时也重定向到登录页面
  },
  debug: process.env.NODE_ENV === "development", // 只在开发环境启用调试
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // 只处理 OAuth 登录
        if (!account || account.type !== "oauth") return true;

        // 确定用户类型和用户信息
        let userType: "oauth2-google" | "oauth2-linuxdo";
        let userId: string;
        let userData: CreateUserRequest;

        if (account.provider === "google") {
          userType = "oauth2-google";
          userId = user.email!;
          userData = {
            id: userId,
            nickname: user.name || user.email?.split("@")[0] || undefined,
            avatar_url: user.image || undefined,
            user_type: userType,
          };
        } else if (account.provider === "linuxdo") {
          userType = "oauth2-linuxdo";
          // 从 profile 中提取用户信息
          const linuxdoProfile = profile as any;
          const trustLevel = linuxdoProfile?.trust_level;
          userId = linuxdoProfile?.id?.toString() || user.id || ""; // 使用 ID 作为用户 ID
          userData = {
            id: userId,
            nickname: user.name || linuxdoProfile?.name,
            avatar_url: user.image || undefined,
            user_type: userType,
            level: trustLevel,
          };
        } else {
          return true; // 其他提供商，继续默认流程
        }

        // 检查用户是否已存在
        const existingUser = await getUserById(userId);

        if (!existingUser) {
          // 创建新用户
          const created = await createUser(userData);
          if (!created) {
            console.error("创建用户失败:", userId);
            return false;
          }
          console.log("成功创建新用户:", userId);
        } else {
          console.log("用户已存在:", userId);
        }

        return true;
      } catch (error) {
        console.error("登录回调处理失败:", error);
        return false;
      }
    },
    async jwt({ token, account, user, profile }) {
      // 为 Linux DO 用户添加额外信息
      if (account?.provider === "linuxdo" && profile) {
        const linuxdoProfile = profile as any;
        token.username = linuxdoProfile.username;
        token.trustLevel = linuxdoProfile.trust_level;
        token.userId = linuxdoProfile.id?.toString(); // 使用 ID 作为用户 ID

        // 检查 Linux DO 用户是否为管理员
        token.isAdmin = ADMIN_LINUXDO_IDS.includes(
          linuxdoProfile.id?.toString() || "",
        );
      } else if (account?.provider === "google") {
        token.userId = user?.email;

        // 检查 Google 用户是否为管理员
        token.isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;
      }

      return token;
    },
    async session({ session, token }) {
      // 将管理员信息添加到 session
      if (session.user) {
        session.user.isAdmin = token.isAdmin as boolean;

        // 添加 Linux DO 相关信息
        if (token.username) {
          (session.user as any).username = token.username;
          (session.user as any).trustLevel = token.trustLevel;
          (session.user as any).userId = token.userId;
        } else if (token.userId) {
          (session.user as any).userId = token.userId;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // 确保重定向到正确的 URL
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
});

export { handler as GET, handler as POST };
