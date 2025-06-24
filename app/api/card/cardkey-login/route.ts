import { NextRequest, NextResponse } from "next/server";
import { verifyCardKey } from "@/utils/cardKeyUtils";
import { createClient, createUser, getUserById } from "@/lib/supabase/client";
import { CachedEmailInfo } from "@/types/email";

interface CardKeyLoginRequest {
  cardKey: string;
  userId?: string;
}

interface UserSession {
  userId: string;
  email?: string;
  isTrialAccount: boolean;
  cardData: any;
}

/**
 * 卡密登录 API
 * POST /api/card/cardkey-login
 *
 * 重构后的业务逻辑：
 * 1. 验证卡密有效性
 * 2. 检查/创建用户账户
 * 3. 分配可用邮箱账户
 * 4. 返回登录会话信息
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body: CardKeyLoginRequest = await request.json();
    const { cardKey, userId } = body;

    if (!cardKey || !cardKey.trim()) {
      return NextResponse.json(
        { success: false, error: "卡密不能为空" },
        { status: 400 },
      );
    }

    const trimmedCardKey = cardKey.trim();

    // 1. 验证卡密
    const verifyResult = verifyCardKey(trimmedCardKey, userId);

    if (!verifyResult.isValid) {
      return NextResponse.json(
        { success: false, error: verifyResult.error || "卡密验证失败" },
        { status: 400 },
      );
    }

    const cardData = verifyResult.data!;
    const finalUserId = userId || trimmedCardKey; // 使用卡密作为用户ID

    const supabase = createClient();

    // 2. 检查/创建用户账户
    let user = await getUserById(finalUserId);

    if (!user) {
      // 创建新的卡密用户
      const created = await createUser({
        id: finalUserId,
        nickname: "华光共享号",
        user_type: "card_key",
      });

      if (!created) {
        return NextResponse.json(
          { success: false, error: "用户创建失败" },
          { status: 500 },
        );
      }

      user = await getUserById(finalUserId);
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "用户账户异常" },
        { status: 500 },
      );
    }

    // 3. 查找用户已分配的邮箱账户
    const { data: userMailAccounts, error: userAccountsError } = await supabase
      .from("mail_accounts")
      .select(
        "email, refresh_token, protocol_type, service_provider, client_id, password, secondary_email, secondary_password",
      )
      .eq("user_id", finalUserId)
      .eq("is_banned", false)
      .limit(1);

    let accountData: any;
    let isFirstTime = false;

    if (userMailAccounts && userMailAccounts.length > 0) {
      // 用户已有分配的邮箱
      accountData = userMailAccounts[0];
    } else {
      // 第一次使用，分配新邮箱
      isFirstTime = true;

      // 优先查找 GRAPH 协议类型的未分配邮箱
      let { data: availableAccount, error: fetchError } = await supabase
        .from("mail_accounts")
        .select(
          "email, refresh_token, protocol_type, service_provider, client_id, password, secondary_email, secondary_password",
        )
        .eq("user_id", "SYSTEM_UNASSIGNED")
        .eq("is_banned", false)
        .eq("protocol_type", "GRAPH")
        .limit(1)
        .single();

      // 如果没有 GRAPH 协议的邮箱，则查找其他可用邮箱
      if (fetchError || !availableAccount) {
        const { data: fallbackAccount, error: fallbackError } = await supabase
          .from("mail_accounts")
          .select(
            "email, refresh_token, protocol_type, service_provider, client_id, password, secondary_email, secondary_password",
          )
          .eq("user_id", "SYSTEM_UNASSIGNED")
          .eq("is_banned", false)
          .limit(1)
          .single();

        if (fallbackError || !fallbackAccount) {
          return NextResponse.json(
            { success: false, error: "暂无可用的邮箱账户，请稍后再试" },
            { status: 503 },
          );
        }

        availableAccount = fallbackAccount;
      }

      // 将邮箱分配给用户
      const { error: updateError } = await supabase
        .from("mail_accounts")
        .update({
          user_id: finalUserId,
        })
        .eq("email", availableAccount.email);

      if (updateError) {
        console.error("邮箱分配失败:", updateError);
        return NextResponse.json(
          { success: false, error: "邮箱分配失败，请重试" },
          { status: 500 },
        );
      }

      accountData = { ...availableAccount, user_id: finalUserId };
    }

    // 4. 创建用户会话数据
    const userSession: UserSession = {
      userId: finalUserId,
      email: accountData.email,
      isTrialAccount: true,
      cardData,
    };

    // 5. 创建缓存邮箱信息
    const cacheEmailInfo: CachedEmailInfo = {
      email: accountData.email,
      refreshToken: accountData.refresh_token,
      protocolType: accountData.protocol_type,
      user_id: finalUserId,
      password: accountData.password,
      serviceProvider: accountData.service_provider,
    };

    console.log(
      `卡密登录成功: ${accountData.email} (${accountData.protocol_type}) - 用户: ${finalUserId} - 卡密: ${trimmedCardKey}${isFirstTime ? " [首次分配]" : " [已有邮箱]"}`,
    );

    return NextResponse.json(
      {
        success: true,
        isFirstTime,
        userSession,
        accountData: {
          email: accountData.email,
          refreshToken: accountData.refresh_token,
          protocolType: accountData.protocol_type,
          serviceProvider: accountData.service_provider,
          clientId: accountData.client_id,
          password: accountData.password,
          secondaryEmail: accountData.secondary_email,
          secondaryPassword: accountData.secondary_password,
        },
        cacheEmailInfo,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("卡密登录失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "服务器内部错误",
      },
      { status: 500 },
    );
  }
}
