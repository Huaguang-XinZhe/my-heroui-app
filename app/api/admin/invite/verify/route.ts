import { NextRequest, NextResponse } from "next/server";
import { verifyInviteToken } from "@/utils/inviteUtils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "邀请令牌不能为空" },
        { status: 400 },
      );
    }

    console.log("服务端验证邀请令牌:", token?.substring(0, 50) + "...");

    // 尝试 URL 解码令牌
    let decodedToken = token;
    try {
      decodedToken = decodeURIComponent(token);
      console.log("服务端令牌解码成功");
    } catch (error) {
      console.log("URL 解码失败，使用原始令牌:", error);
    }

    const result = verifyInviteToken(decodedToken);
    console.log("服务端验证结果:", {
      isValid: result.isValid,
      canUse: result.canUse,
      error: result.error,
      remainingUses: result.remainingUses,
    });

    return NextResponse.json({
      success: true,
      result: {
        isValid: result.isValid,
        canUse: result.canUse,
        error: result.error,
        remainingUses: result.remainingUses,
        data: result.data,
      },
    });
  } catch (error) {
    console.error("服务端验证邀请令牌失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: "服务器内部错误",
        result: {
          isValid: false,
          canUse: false,
          error: "服务器验证失败",
        },
      },
      { status: 500 },
    );
  }
}
