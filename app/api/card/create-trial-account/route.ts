import { NextRequest, NextResponse } from "next/server";
import { generateCardKey, CardKeyData } from "@/utils/cardKeyUtils";
import { verifyInviteToken } from "@/utils/inviteUtils";
import { createUser } from "@/lib/supabase/users";
import { getAvailableMailAccounts } from "@/lib/supabase/mailAccounts";
import { createClient } from "@/lib/supabase/client";

/**
 * 为用户分配邮箱账户
 */
async function allocateEmailAccounts(
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
    console.log("数据库中总邮箱数量:", availableAccounts.length);

    // 筛选出 IMAP 和 GRAPH 协议的邮箱（未分配或系统占位的）
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

    console.log("可用 IMAP 邮箱数量:", imapAccounts.length);
    console.log("可用 GRAPH 邮箱数量:", graphAccounts.length);

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      inviteToken,
      imapEmailCount,
      graphEmailCount,
      allowBatchAddEmails,
    } = body;

    console.log("创建体验账户请求:", {
      inviteToken,
      imapEmailCount,
      graphEmailCount,
      allowBatchAddEmails,
    });

    console.log("服务器端环境变量详情:", {
      NODE_ENV: process.env.NODE_ENV,
      CRYPTO_PRIVATE_KEY_EXISTS: !!process.env.CRYPTO_PRIVATE_KEY,
      CRYPTO_PRIVATE_KEY_VALUE:
        process.env.CRYPTO_PRIVATE_KEY?.substring(0, 10) + "...",
    });

    if (!inviteToken) {
      return NextResponse.json(
        { success: false, error: "邀请令牌不能为空" },
        { status: 400 },
      );
    }

    // 验证邀请令牌
    console.log("验证邀请令牌 (原始):", inviteToken);
    console.log(
      "服务器端环境变量 CRYPTO_PRIVATE_KEY:",
      process.env.CRYPTO_PRIVATE_KEY ? "已设置" : "未设置",
    );

    // 尝试 URL 解码令牌
    let decodedToken = inviteToken;
    try {
      decodedToken = decodeURIComponent(inviteToken);
      console.log("验证邀请令牌 (解码):", decodedToken);
    } catch (error) {
      console.log("URL 解码失败，使用原始令牌:", error);
    }

    const inviteResult = verifyInviteToken(decodedToken);
    console.log("邀请令牌验证结果:", inviteResult);

    if (!inviteResult.isValid || !inviteResult.canUse) {
      console.error("邀请令牌验证失败:", {
        isValid: inviteResult.isValid,
        canUse: inviteResult.canUse,
        error: inviteResult.error,
        remainingUses: inviteResult.remainingUses,
      });
      return NextResponse.json(
        {
          success: false,
          error: inviteResult.error || "邀请令牌无效",
          details: {
            isValid: inviteResult.isValid,
            canUse: inviteResult.canUse,
            remainingUses: inviteResult.remainingUses,
          },
        },
        { status: 400 },
      );
    }

    // 获取邀请数据
    const inviteData = inviteResult.data!;

    // 检查是否允许自动创建体验账户
    if (!inviteData.autoCreateTrialAccount) {
      return NextResponse.json(
        { success: false, error: "此邀请不支持自动创建体验账户" },
        { status: 400 },
      );
    }

    // 生成体验卡密
    const cardData: CardKeyData = {
      source: "内部",
      emailCount: imapEmailCount + graphEmailCount,
      duration: "长效",
      timestamp: Date.now(),
      id: `trial_${Date.now().toString().slice(-8)}`, // 取时间戳后8位作为ID
      reusable: true, // 体验卡密可重复使用
    };

    const cardKey = generateCardKey(cardData);

    // 在数据库中创建用户
    const userResult = await createUser({
      id: cardKey, // 使用卡密作为用户ID
      nickname: "华光共享号", // 不要改这里！！！
      user_type: "card_key",
      invited_by: inviteData.createdBy || undefined, // 记录邀请者
    });

    if (!userResult.success) {
      console.error("创建用户失败:", userResult.error);
      return NextResponse.json(
        { success: false, error: userResult.error || "创建用户失败" },
        { status: 500 },
      );
    }

    const userData = userResult.data;

    // 从数据库中分配邮箱账户
    console.log("开始分配邮箱账户:", {
      cardKey,
      imapEmailCount,
      graphEmailCount,
    });
    const allocatedEmails = await allocateEmailAccounts(
      cardKey,
      imapEmailCount,
      graphEmailCount,
    );
    console.log("邮箱分配结果:", allocatedEmails);

    if (!allocatedEmails.success) {
      console.error("邮箱分配失败:", allocatedEmails.error);
      return NextResponse.json(
        { success: false, error: allocatedEmails.error },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      cardKey,
      cardData,
      userData,
      allocatedEmails: allocatedEmails.emails,
      message: "体验账户创建成功",
    });
  } catch (error) {
    console.error("创建体验账户失败:", error);
    return NextResponse.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 },
    );
  }
}
