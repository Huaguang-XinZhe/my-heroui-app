import { NextRequest, NextResponse } from "next/server";
import { verifyInviteToken } from "@/utils/inviteUtils";
import { getUserById, updateUser } from "@/lib/supabase/users";
import { getUserMailAccounts } from "@/lib/supabase/mailAccounts";
import { getAvailableMailAccounts } from "@/lib/supabase/mailAccounts";
import { createClient } from "@/lib/supabase/client";
import { CachedEmailInfo } from "@/types/email";

interface OAuthAllocateRequest {
  inviteToken: string;
  userId: string;
}

/**
 * 为 OAuth 用户根据邀请信息分配邮箱
 */
export async function POST(request: NextRequest) {
  try {
    const body: OAuthAllocateRequest = await request.json();
    const { inviteToken, userId } = body;

    if (!inviteToken || !userId) {
      return NextResponse.json(
        { success: false, error: "邀请令牌和用户ID都不能为空" },
        { status: 400 },
      );
    }

    // 验证邀请令牌
    console.log("验证邀请令牌:", inviteToken.substring(0, 20) + "...");

    // 尝试 URL 解码令牌
    let decodedToken = inviteToken;
    try {
      decodedToken = decodeURIComponent(inviteToken);
      console.log("邀请令牌解码成功");
    } catch (error) {
      console.log("URL 解码失败，使用原始令牌");
    }

    const inviteResult = verifyInviteToken(decodedToken);
    if (!inviteResult.isValid || !inviteResult.canUse) {
      return NextResponse.json(
        { success: false, error: inviteResult.error || "邀请令牌无效" },
        { status: 400 },
      );
    }

    const inviteData = inviteResult.data!;

    // 检查用户是否存在
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "用户不存在" },
        { status: 404 },
      );
    }

    // 如果用户的 invited_by 字段为空，且有邀请信息，更新用户的 invited_by 字段
    if (!user.invited_by && inviteData.createdBy) {
      console.log(
        `更新用户 ${userId} 的 invited_by 字段为 ${inviteData.createdBy}`,
      );
      await updateUser(userId, { invited_by: inviteData.createdBy });
    }

    // 检查用户是否已有分配的邮箱
    const existingAccounts = await getUserMailAccounts(userId);
    if (existingAccounts.length > 0) {
      // 用户已有邮箱，返回现有邮箱信息
      const cacheEmailInfo: CachedEmailInfo[] = existingAccounts.map(
        (account) => ({
          email: account.email,
          refreshToken: account.refresh_token || "",
          protocolType: account.protocol_type,
          user_id: account.user_id,
          password: account.password,
          serviceProvider: account.service_provider,
        }),
      );

      return NextResponse.json({
        success: true,
        message: "用户已有邮箱账户",
        allocatedEmails: existingAccounts,
        cacheEmailInfo,
        isExisting: true,
      });
    }

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

    // 创建缓存邮箱信息
    const cacheEmailInfo: CachedEmailInfo[] = allocateResult.emails!.map(
      (account: any) => ({
        email: account.email,
        refreshToken: account.refreshToken || account.refresh_token || "",
        protocolType: account.protocolType || account.protocol_type,
        user_id: userId,
        password: account.password,
        serviceProvider: account.serviceProvider || account.service_provider,
      }),
    );

    console.log(
      `OAuth 用户邮箱分配成功: ${userId} 获得 ${allocateResult.emails!.length} 个邮箱`,
    );

    return NextResponse.json({
      success: true,
      message: "邮箱分配成功",
      allocatedEmails: allocateResult.emails,
      cacheEmailInfo,
      isExisting: false,
    });
  } catch (error) {
    console.error("OAuth 用户邮箱分配失败:", error);
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
