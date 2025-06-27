import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { generateInviteToken, generateInviteUrl } from "@/utils/inviteUtils";
import { InviteData } from "@/utils/inviteUtils";

export async function POST(request: NextRequest) {
  try {
    // 检查管理员权限（你可能需要根据你的认证系统调整这部分）
    // const session = await getServerSession();
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json(
    //     { success: false, error: "需要管理员权限" },
    //     { status: 403 }
    //   );
    // }

    // 添加调试信息
    console.log("环境检查:", {
      hasCryptoKey: !!process.env.CRYPTO_PRIVATE_KEY,
      keyLength: process.env.CRYPTO_PRIVATE_KEY?.length || 0,
      nodeEnv: process.env.NODE_ENV,
    });

    const body = await request.json();
    const {
      imapEmailCount,
      graphEmailCount,
      maxRegistrations,
      validDays,
      registrationMethods,
      allowBatchAddEmails,
      autoCreateTrialAccount,
      createdBy,
      type = "custom", // "custom" 或 "quick"
    } = body;

    let inviteData: InviteData;

    if (type === "quick") {
      // 快捷邀请配置
      inviteData = {
        imapEmailCount: 1,
        graphEmailCount: 1,
        maxRegistrations: 1,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7天后过期
        registrationMethods: {
          linuxdo: false,
          google: false,
          cardKey: false,
          others: false,
        },
        allowBatchAddEmails: true,
        autoCreateTrialAccount: true,
        id: Math.random().toString(36).substring(2, 15),
        createdAt: Date.now(),
        createdBy: createdBy || "admin",
      };
    } else {
      // 自定义邀请配置
      if (
        imapEmailCount === undefined ||
        imapEmailCount === null ||
        graphEmailCount === undefined ||
        graphEmailCount === null ||
        !maxRegistrations ||
        !validDays
      ) {
        return NextResponse.json(
          { success: false, error: "缺少必需的参数" },
          { status: 400 },
        );
      }

      // 检查邮箱数量是否为负数
      if (parseInt(imapEmailCount) < 0 || parseInt(graphEmailCount) < 0) {
        return NextResponse.json(
          { success: false, error: "邮箱数量不能为负数" },
          { status: 400 },
        );
      }

      // 检查是否至少有一种邮箱类型
      if (parseInt(imapEmailCount) === 0 && parseInt(graphEmailCount) === 0) {
        return NextResponse.json(
          { success: false, error: "IMAP 和 GRAPH 邮箱数量不能同时为 0" },
          { status: 400 },
        );
      }

      inviteData = {
        imapEmailCount: parseInt(imapEmailCount),
        graphEmailCount: parseInt(graphEmailCount),
        maxRegistrations: parseInt(maxRegistrations),
        expiresAt: Date.now() + parseInt(validDays) * 24 * 60 * 60 * 1000,
        registrationMethods: registrationMethods || {
          linuxdo: false,
          google: false,
          cardKey: false,
          others: false,
        },
        allowBatchAddEmails: allowBatchAddEmails !== false, // 默认为 true
        autoCreateTrialAccount: autoCreateTrialAccount === true,
        id: Math.random().toString(36).substring(2, 15),
        createdAt: Date.now(),
        createdBy: createdBy || "admin",
      };
    }

    // 服务器端生成令牌
    let token: string;
    try {
      token = generateInviteToken(inviteData);
      console.log("令牌生成成功，长度:", token.length);
    } catch (tokenError) {
      console.error("令牌生成失败:", tokenError);
      return NextResponse.json(
        { success: false, error: "令牌生成失败" },
        { status: 500 },
      );
    }

    // 获取完整的基础 URL
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const host = request.headers.get("host");
    const baseUrl = `${protocol}://${host}`;

    const url = generateInviteUrl(token, baseUrl);

    console.log("服务器端生成邀请令牌:", {
      type,
      tokenLength: token.length,
      inviteId: inviteData.id,
    });

    return NextResponse.json({
      success: true,
      data: {
        token,
        url,
        inviteData,
        tokenLength: token.length,
      },
    });
  } catch (error) {
    console.error("生成邀请令牌失败:", error);
    return NextResponse.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 },
    );
  }
}
