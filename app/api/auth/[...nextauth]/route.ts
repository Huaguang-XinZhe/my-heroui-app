import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createUser, getUserById } from "@/lib/supabase/users";
import { CreateUserRequest } from "@/types/email";

// 日志辅助函数
const logInfo = (message: string, data?: any) => {
  console.log(
    `[NextAuth] ${message}`,
    data ? JSON.stringify(data, null, 2) : "",
  );
};

const logError = (message: string, error?: any) => {
  console.error(`[NextAuth ERROR] ${message}`, error);
};

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
    logInfo("LinuxDO profile received:", profile);
    const processedProfile = {
      id: profile.id?.toString(),
      name: profile.name || profile.username || profile.login,
      email: `@${profile.username} • ${profile.trust_level} level`,
      image: profile.avatar_url,
      username: profile.username,
      trustLevel: profile.trust_level,
    };
    logInfo("LinuxDO profile processed:", processedProfile);
    return processedProfile;
  },
};

// 管理员邮箱列表（Google 用户）
const ADMIN_EMAILS: string[] = ["liu200111092022@gmail.com"];

// 管理员 Linux DO ID 列表
const ADMIN_LINUXDO_IDS: string[] = ["58149"];

// 环境变量检查
logInfo("Environment variables check:", {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT_SET",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "NOT_SET",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT_SET",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "SET" : "NOT_SET",
  LINUXDO_CLIENT_ID: process.env.LINUXDO_CLIENT_ID ? "SET" : "NOT_SET",
  LINUXDO_CLIENT_SECRET: process.env.LINUXDO_CLIENT_SECRET ? "SET" : "NOT_SET",
  NODE_ENV: process.env.NODE_ENV,
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
    signIn: "/login", // 修正登录页面路径
    error: "/login", // 错误时也重定向到登录页面
  },
  debug: true, // 强制开启调试模式
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      logInfo("SignIn callback triggered", {
        provider: account?.provider,
        accountType: account?.type,
        userId: user?.id,
        userEmail: user?.email,
      });

      try {
        // 只处理 OAuth 登录
        if (!account || account.type !== "oauth") {
          logInfo("Non-OAuth login, allowing through");
          return true;
        }

        logInfo("Processing OAuth login", { provider: account.provider });

        // 确定用户类型和用户信息
        let userType: "oauth2-google" | "oauth2-linuxdo";
        let userId: string;
        let userData: CreateUserRequest;

        if (account.provider === "google") {
          logInfo("Processing Google OAuth");
          userType = "oauth2-google";
          userId = user.email!;
          userData = {
            id: userId,
            nickname: user.name || user.email?.split("@")[0] || undefined,
            avatar_url: user.image || undefined,
            user_type: userType,
          };
          logInfo("Google user data prepared:", userData);
        } else if (account.provider === "linuxdo") {
          logInfo("Processing LinuxDO OAuth");
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
          logInfo("LinuxDO user data prepared:", userData);
        } else {
          logInfo("Unknown provider, allowing through:", account.provider);
          return true; // 其他提供商，继续默认流程
        }

        logInfo("Checking if user exists:", userId);
        // 检查用户是否已存在
        const existingUser = await getUserById(userId);

        if (!existingUser) {
          logInfo("User does not exist, creating new user");
          // 创建新用户
          const created = await createUser(userData);
          if (!created) {
            logError("Failed to create user:", userId);
            return false;
          }
          logInfo("Successfully created new user:", userId);
        } else {
          logInfo("User already exists:", userId);
        }

        logInfo("SignIn callback completed successfully");
        return true;
      } catch (error) {
        logError("SignIn callback failed:", error);
        return false;
      }
    },
    async jwt({ token, account, user, profile }) {
      logInfo("JWT callback triggered", {
        provider: account?.provider,
        hasToken: !!token,
        hasAccount: !!account,
        hasUser: !!user,
        hasProfile: !!profile,
      });

      // 为 Linux DO 用户添加额外信息
      if (account?.provider === "linuxdo" && profile) {
        logInfo("Processing LinuxDO JWT");
        const linuxdoProfile = profile as any;
        token.username = linuxdoProfile.username;
        token.trustLevel = linuxdoProfile.trust_level;
        token.userId = linuxdoProfile.id?.toString(); // 使用 ID 作为用户 ID

        // 检查 Linux DO 用户是否为管理员
        token.isAdmin = ADMIN_LINUXDO_IDS.includes(
          linuxdoProfile.id?.toString() || "",
        );
        logInfo("LinuxDO token updated:", {
          username: token.username,
          trustLevel: token.trustLevel,
          userId: token.userId,
          isAdmin: token.isAdmin,
        });
      } else if (account?.provider === "google") {
        logInfo("Processing Google JWT");
        token.userId = user?.email;

        // 检查 Google 用户是否为管理员
        token.isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;
        logInfo("Google token updated:", {
          userId: token.userId,
          isAdmin: token.isAdmin,
        });
      }

      return token;
    },
    async session({ session, token }) {
      logInfo("Session callback triggered", {
        hasSession: !!session,
        hasUser: !!session?.user,
        hasToken: !!token,
      });

      // 将管理员信息添加到 session
      if (session.user) {
        session.user.isAdmin = token.isAdmin as boolean;

        // 添加 Linux DO 相关信息
        if (token.username) {
          (session.user as any).username = token.username;
          (session.user as any).trustLevel = token.trustLevel;
          (session.user as any).userId = token.userId;
          logInfo("LinuxDO session updated");
        } else if (token.userId) {
          (session.user as any).userId = token.userId;
          logInfo("Google session updated");
        }
      }

      logInfo("Final session:", {
        userId: (session.user as any)?.userId,
        username: (session.user as any)?.username,
        isAdmin: session.user?.isAdmin,
      });

      return session;
    },
    async redirect({ url, baseUrl }) {
      logInfo("Redirect callback triggered", {
        url,
        baseUrl,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      });

      // 确保重定向到正确的 URL
      // 在生产环境中，baseUrl 应该是实际的域名
      const actualBaseUrl = process.env.NEXTAUTH_URL || baseUrl;

      // 如果是相对路径，拼接基础 URL
      if (url.startsWith("/")) {
        const finalUrl = `${actualBaseUrl}${url}`;
        logInfo("Redirecting to relative path:", finalUrl);
        return finalUrl;
      }

      // 如果是完整 URL 且来源相同，允许重定向
      try {
        const redirectUrl = new URL(url);
        const baseUrlObj = new URL(actualBaseUrl);
        if (redirectUrl.origin === baseUrlObj.origin) {
          logInfo("Redirecting to same origin:", url);
          return url;
        }
      } catch (error) {
        logError("Redirect URL parsing error:", error);
      }

      // 默认返回首页
      logInfo("Redirecting to home:", actualBaseUrl);
      return actualBaseUrl;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      logInfo("SignIn event triggered", {
        provider: account?.provider,
        userId: user?.id || user?.email,
      });
    },
    async signOut({ token, session }) {
      logInfo("SignOut event triggered");
    },
    async createUser({ user }) {
      logInfo("CreateUser event triggered", { userId: user.id });
    },
    async linkAccount({ user, account, profile }) {
      logInfo("LinkAccount event triggered", {
        provider: account.provider,
        userId: user.id,
      });
    },
    async session({ session, token }) {
      logInfo("Session event triggered");
    },
  },
});

export { handler as GET, handler as POST };
