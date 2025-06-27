import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createUser, getUserById } from "@/lib/supabase/users";
import { CreateUserRequest } from "@/types/email";

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

// 管理员邮箱列表（Google 用户）
const ADMIN_EMAILS: string[] = ["liu200111092022@gmail.com"];

// 管理员 Linux DO ID 列表
const ADMIN_LINUXDO_IDS: string[] = ["58149"];

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

      try {
        // 只处理 OAuth 登录
        if (!account || account.type !== "oauth") {
          console.log("[NextAuth] Non-OAuth login, allowing through");
          return true;
        }

        console.log("[NextAuth] Processing OAuth login");

        // 确定用户类型和用户信息
        let userType: "oauth2-google" | "oauth2-linuxdo";
        let userId: string;
        let userData: CreateUserRequest;

        if (account.provider === "google") {
          console.log("[NextAuth] Processing Google OAuth");
          userType = "oauth2-google";
          userId = user.email!;
          userData = {
            id: userId,
            nickname: user.name || user.email?.split("@")[0] || undefined,
            avatar_url: user.image || undefined,
            user_type: userType,
            // invited_by 将在邮箱分配时设置
          };
        } else if (account.provider === "linuxdo") {
          console.log("[NextAuth] Processing LinuxDO OAuth");
          userType = "oauth2-linuxdo";
          // 从 profile 中提取用户信息
          const linuxdoProfile = profile as any;
          const trustLevel = linuxdoProfile?.trust_level;
          userId = linuxdoProfile?.id?.toString() || user.id || "";
          userData = {
            id: userId,
            nickname: user.name || linuxdoProfile?.name,
            avatar_url: user.image || undefined,
            user_type: userType,
            level: trustLevel,
            // invited_by 将在邮箱分配时设置
          };
        } else {
          console.log("[NextAuth] Unknown provider, allowing through");
          return true;
        }

        console.log("[NextAuth] Checking if user exists:", userId);
        // 检查用户是否已存在
        const existingUser = await getUserById(userId);

        if (!existingUser) {
          console.log("[NextAuth] Creating new user");
          // 创建新用户
          const created = await createUser(userData);
          if (!created.success) {
            console.error("[NextAuth] Failed to create user:", userId);
            return false;
          }
          console.log("[NextAuth] Successfully created new user:", userId);
        } else {
          console.log("[NextAuth] User already exists:", userId);
        }

        console.log("[NextAuth] SignIn callback completed successfully");
        return true;
      } catch (error) {
        console.error("[NextAuth] SignIn callback failed:", error);
        return false;
      }
    },
    async jwt({ token, account, user, profile }) {
      console.log("[NextAuth] JWT callback:", { provider: account?.provider });

      // 为 LinuxDO 用户添加额外信息
      if (account?.provider === "linuxdo" && profile) {
        console.log("[NextAuth] Processing LinuxDO JWT");
        const linuxdoProfile = profile as any;
        token.username = linuxdoProfile.username;
        token.trustLevel = linuxdoProfile.trust_level;
        token.userId = linuxdoProfile.id?.toString();

        // 检查 LinuxDO 用户是否为管理员
        token.isAdmin = ADMIN_LINUXDO_IDS.includes(
          linuxdoProfile.id?.toString() || "",
        );
        console.log("[NextAuth] LinuxDO user isAdmin:", token.isAdmin);
      } else if (account?.provider === "google") {
        console.log("[NextAuth] Processing Google JWT");
        token.userId = user?.email || undefined;

        // 检查 Google 用户是否为管理员
        token.isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;
        console.log("[NextAuth] Google user isAdmin:", token.isAdmin);
      }

      return token;
    },
    async session({ session, token }) {
      console.log("[NextAuth] Session callback");

      // 将管理员信息添加到 session
      if (session.user) {
        session.user.isAdmin = token.isAdmin as boolean;

        // 添加用户信息到 session
        (session.user as any).userId = token.userId;
        if (token.username) {
          (session.user as any).username = token.username;
          (session.user as any).trustLevel = token.trustLevel;
          console.log("[NextAuth] LinuxDO session updated");
        } else {
          console.log("[NextAuth] Google session updated");
        }
      }

      console.log("[NextAuth] Final session isAdmin:", session.user?.isAdmin);
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
  events: {
    async signIn({ user, account, profile }) {
      console.log("[NextAuth] SignIn event:", {
        provider: account?.provider,
        userId: user?.id || user?.email,
      });
    },
    async signOut({ token, session }) {
      console.log("[NextAuth] SignOut event");
    },
    async createUser({ user }) {
      console.log("[NextAuth] CreateUser event:", { userId: user.id });
    },
    async linkAccount({ user, account, profile }) {
      console.log("[NextAuth] LinkAccount event:", {
        provider: account.provider,
        userId: user.id,
      });
    },
    async session({ session, token }) {
      console.log("[NextAuth] Session event");
    },
  },
});

console.log("[NextAuth] Handler created successfully");

export const GET = handler;
export const POST = handler;
