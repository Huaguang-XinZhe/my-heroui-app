import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// 管理员邮箱列表
const ADMIN_EMAILS: string[] = [
  // 在这里添加管理员邮箱地址
  // "admin@example.com",
  // "your-admin-email@gmail.com"
  "2475096613@qq.com",
  "liu200111092022@gmail.com",
];

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  debug: true, // 开启调试模式
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // 检查用户是否为管理员
      if (user?.email) {
        token.isAdmin = ADMIN_EMAILS.includes(user.email);
      }
      return token;
    },
    async session({ session, token }) {
      // 将管理员信息添加到 session
      if (session.user) {
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
