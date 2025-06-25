import { NextRequest, NextResponse } from "next/server";
import { verifyCardKey } from "@/utils/cardKeyUtils";
import { verifyInviteToken } from "@/utils/inviteUtils";
import { createUser, getUserById } from "@/lib/supabase/users";
import { getAvailableMailAccounts } from "@/lib/supabase/mailAccounts";
import { createClient } from "@/lib/supabase/client";

/**
 * 邀请链接中的卡密登录 API
 * 支持根据邀请信息分配对应数量和协议类型的邮箱
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardKey, inviteToken } = body;

    if (!cardKey || !inviteToken) {
      return NextResponse.json(
        { success: false, error: "卡密和邀请令牌都不能为空" },
        { status: 400 },
      );
    }

    // 验证邀请令牌
    console.log("验证邀请令牌 (原始):", inviteToken);

    // 尝试 URL 解码令牌
    let decodedToken = inviteToken;
    try {
      decodedToken = decodeURIComponent(inviteToken);
      console.log("验证邀请令牌 (解码):", decodedToken);
    } catch (error) {
      console.log("URL 解码失败，使用原始令牌:", error);
    }

    const inviteResult = verifyInviteToken(decodedToken);
    if (!inviteResult.isValid || !inviteResult.canUse) {
      return NextResponse.json(
        { success: false, error: inviteResult.error || "邀请令牌无效" },
        { status: 400 },
      );
    }

    // 验证卡密
    const cardResult = verifyCardKey(cardKey.trim());
    if (!cardResult.isValid) {
      return NextResponse.json(
        { success: false, error: cardResult.error || "卡密验证失败" },
        { status: 400 },
      );
    }

    const inviteData = inviteResult.data!;
    const cardData = cardResult.data!;
    const userId = cardKey.trim();

    // 检查或创建用户
    let user = await getUserById(userId);
    if (!user) {
      const userResult = await createUser({
        id: userId,
        nickname: "卡密用户",
        user_type: "card_key",
        invited_by: inviteData.createdBy || undefined,
      });

      if (!userResult.success) {
        return NextResponse.json(
          { success: false, error: userResult.error || "创建用户失败" },
          { status: 500 },
        );
      }

      user = userResult.data!;
    }

    // 检查用户是否已有分配的邮箱
    const supabase = createClient();
    const { data: existingAccounts } = await supabase
      .from("mail_accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("is_banned", false);

    let allocatedEmails: any[] = [];

    if (existingAccounts && existingAccounts.length > 0) {
      // 用户已有邮箱，直接返回
      allocatedEmails = existingAccounts;
    } else {
      // 根据邀请信息分配邮箱
      const allocateResult = await allocateEmailsByInvite(
        userId,
        inviteData.imapEmailCount,
        inviteData.graphEmailCount,
      );

      if (!allocateResult.success) {
        return NextResponse.json(
          { success: false, error: allocateResult.error },
          { status: 500 },
        );
      }

      allocatedEmails = allocateResult.emails!;
    }

    return NextResponse.json({
      success: true,
      cardKey: userId,
      cardData,
      userData: user,
      allocatedEmails,
      accountData: {
        accountId: userId,
        email: allocatedEmails[0]?.email,
      },
      userSession: {
        userId,
        cardData,
        isTrialAccount: true,
      },
      message: "卡密验证成功",
    });
  } catch (error) {
    console.error("邀请卡密登录失败:", error);
    return NextResponse.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 },
    );
  }
}

/**
 * 根据邀请信息分配邮箱
 */
async function allocateEmailsByInvite(
  userId: string,
  imapCount: number,
  graphCount: number,
): Promise<{
  success: boolean;
  emails?: any[];
  error?: string;
}> {
  try {
    const supabase = createClient();

    // 获取可用的邮箱账户
    const availableAccounts = await getAvailableMailAccounts();

    // 筛选出未分配的 IMAP 和 GRAPH 协议的邮箱
    const imapAccounts = availableAccounts.filter(
      (account) =>
        account.protocolType === "IMAP" &&
        (!account.user_id || account.user_id === "SYSTEM_UNASSIGNED"),
    );
    const graphAccounts = availableAccounts.filter(
      (account) =>
        account.protocolType === "GRAPH" &&
        (!account.user_id || account.user_id === "SYSTEM_UNASSIGNED"),
    );

    // 检查邮箱数量是否足够
    if (imapAccounts.length < imapCount) {
      return {
        success: false,
        error: `IMAP 邮箱不足，需要 ${imapCount} 个，可用 ${imapAccounts.length} 个`,
      };
    }

    if (graphAccounts.length < graphCount) {
      return {
        success: false,
        error: `GRAPH 邮箱不足，需要 ${graphCount} 个，可用 ${graphAccounts.length} 个`,
      };
    }

    // 选择要分配的邮箱
    const selectedImapAccounts = imapAccounts.slice(0, imapCount);
    const selectedGraphAccounts = graphAccounts.slice(0, graphCount);
    const allSelectedAccounts = [
      ...selectedImapAccounts,
      ...selectedGraphAccounts,
    ];

    // 批量更新邮箱账户的 user_id
    const emailsToUpdate = allSelectedAccounts.map((account) => account.email);

    if (emailsToUpdate.length > 0) {
      const { error: updateError } = await supabase
        .from("mail_accounts")
        .update({ user_id: userId })
        .in("email", emailsToUpdate);

      if (updateError) {
        console.error("更新邮箱账户失败:", updateError);
        return {
          success: false,
          error: "分配邮箱账户失败",
        };
      }
    }

    return {
      success: true,
      emails: allSelectedAccounts,
    };
  } catch (error) {
    console.error("分配邮箱账户时出错:", error);
    return {
      success: false,
      error: "分配邮箱账户时出错",
    };
  }
}
