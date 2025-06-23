import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import {
  BatchAddAccountRequest,
  BatchAddMailAccountResponse,
  MailInfo,
} from "@/types/email";
import { batchAddMailAccounts } from "@/lib/supabase/client";
import { validateBatchMailInfos, fillDefaultValues } from "@/utils/mailUtils";

// 管理员邮箱列表（复制自 auth route）
const ADMIN_EMAILS: string[] = [
  "2475096613@qq.com",
  "liu200111092022@gmail.com",
];

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user?.email) {
        token.isAdmin = ADMIN_EMAILS.includes(user.email);
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
};

/**
 * 管理员批量添加邮箱账户（未分配用户）
 * POST /api/admin/mail/batch-add
 *
 * 该接口仅供管理员使用，将邮箱添加到系统中但不分配给特定用户
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "无权限：仅管理员可以使用此功能" },
        { status: 403 },
      );
    }

    const body: BatchAddAccountRequest = await request.json();

    // 验证请求数据
    const validationError = validateBatchMailInfos(body.mailInfos);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    console.log(
      `管理员批量添加邮箱账户: ${body.mailInfos.length} 个账户，操作员: ${session.user.email}`,
    );

    // 预处理：填充默认值
    const processedMailInfos = fillDefaultValues(body.mailInfos);

    // 使用特殊的用户ID表示未分配状态
    const UNASSIGNED_USER_ID = "SYSTEM_UNASSIGNED";

    // 批量添加到数据库，使用系统用户ID
    const dbResult = await batchAddMailAccounts(
      processedMailInfos,
      UNASSIGNED_USER_ID,
    );

    const elapsed = Date.now() - startTime;
    console.log(
      `管理员批量添加邮箱账户完成 (${elapsed}ms) - 来自其他用户: ${dbResult.fromOthers.length}，错误: ${dbResult.errors.length}，成功: ${dbResult.successes.length}`,
    );

    const response: BatchAddMailAccountResponse = {
      fromOthers: dbResult.fromOthers,
      errors: dbResult.errors,
      successes: dbResult.successes,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`管理员批量添加邮箱账户失败 (${elapsed}ms):`, error);
    return NextResponse.json(
      {
        error: "批量添加邮箱账户失败",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 },
    );
  }
}
