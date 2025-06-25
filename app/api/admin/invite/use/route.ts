import { NextRequest, NextResponse } from "next/server";
import { useInviteToken } from "@/utils/inviteUtils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, userId, registrationMethod = "unknown" } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "邀请令牌不能为空" },
        { status: 400 },
      );
    }

    console.log("服务端使用邀请令牌:", {
      token: token?.substring(0, 50) + "...",
      userId,
      registrationMethod,
    });

    // 尝试 URL 解码令牌
    let decodedToken = token;
    try {
      decodedToken = decodeURIComponent(token);
    } catch (error) {
      console.log("URL 解码失败，使用原始令牌:", error);
    }

    const result = useInviteToken(decodedToken, userId, registrationMethod);

    console.log("服务端使用邀请结果:", {
      success: result.success,
      error: result.error,
    });

    return NextResponse.json({
      success: result.success,
      data: result.data,
      error: result.error,
    });
  } catch (error) {
    console.error("服务端使用邀请令牌失败:", error);
    return NextResponse.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 },
    );
  }
}
