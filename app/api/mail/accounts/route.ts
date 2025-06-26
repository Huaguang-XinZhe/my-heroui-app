import { NextRequest, NextResponse } from "next/server";
import { getAvailableMailAccounts } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/client";
import { getUserMailAccounts } from "@/lib/supabase/mailAccounts";

/**
 * 邮件账户管理
 * GET /api/mail/accounts - 获取所有邮件账户
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // 'all', 'active', 'banned'
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const supabase = createClient();
    let query = supabase
      .from("mail_accounts")
      .select(
        `
        email,
        service_provider,
        protocol_type,
        is_banned,
        created_at,
        updated_at,
        last_fetched_at,
        notes
      `,
      )
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    // 根据状态过滤
    if (status === "active") {
      query = query.eq("is_banned", false);
    } else if (status === "banned") {
      query = query.eq("is_banned", true);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    // 获取统计信息
    const { data: stats } = await supabase
      .from("mail_accounts")
      .select("is_banned")
      .then((result) => {
        const total = result.data?.length || 0;
        const active = result.data?.filter((a) => !a.is_banned).length || 0;
        const banned = total - active;

        return {
          data: {
            total,
            active,
            banned,
          },
        };
      });

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        limit,
        offset,
        total: data?.length || 0,
      },
      stats,
    });
  } catch (error) {
    console.error("获取邮件账户失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "服务器内部错误",
      },
      { status: 500 },
    );
  }
}

/**
 * 邮件账户管理
 * PATCH /api/mail/accounts - 更新邮件账户状态
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, action } = body; // action: 'ban', 'unban'

    if (!email || !action) {
      return NextResponse.json(
        { success: false, error: "邮箱地址和操作类型不能为空" },
        { status: 400 },
      );
    }

    const supabase = createClient();
    const isBanned = action === "ban";

    const { error } = await supabase
      .from("mail_accounts")
      .update({
        is_banned: isBanned,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `邮箱 ${email} 已${isBanned ? "封禁" : "解封"}`,
    });
  } catch (error) {
    console.error("更新邮件账户状态失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "服务器内部错误",
      },
      { status: 500 },
    );
  }
}

/**
 * 获取指定用户的邮箱账户
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "用户ID不能为空" },
        { status: 400 },
      );
    }

    console.log(`[API] Getting email accounts for user: ${userId}`);

    // 从数据库获取用户的邮箱账户
    const accounts = await getUserMailAccounts(userId);

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({
        success: true,
        accounts: [],
        message: "用户暂无邮箱账户",
      });
    }

    console.log(
      `[API] Found ${accounts.length} email accounts for user: ${userId}`,
    );

    return NextResponse.json({
      success: true,
      accounts,
      message: `找到 ${accounts.length} 个邮箱账户`,
    });
  } catch (error) {
    console.error("[API] Error getting user email accounts:", error);
    return NextResponse.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 },
    );
  }
}
