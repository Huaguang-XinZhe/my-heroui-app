import { NextRequest, NextResponse } from "next/server";
import { parseInviteToken } from "@/utils/inviteUtils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    console.log("测试令牌解析 - 输入令牌:", token?.substring(0, 50) + "...");
    console.log(
      "服务器端环境变量 CRYPTO_PRIVATE_KEY:",
      process.env.CRYPTO_PRIVATE_KEY ? "已设置" : "未设置",
    );

    const result = parseInviteToken(token);
    console.log("测试令牌解析 - 结果:", result);

    return NextResponse.json({
      success: true,
      result,
      serverPrivateKeySet: !!process.env.CRYPTO_PRIVATE_KEY,
    });
  } catch (error) {
    console.error("测试令牌解析失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
        serverPrivateKeySet: !!process.env.CRYPTO_PRIVATE_KEY,
      },
      { status: 500 },
    );
  }
}
