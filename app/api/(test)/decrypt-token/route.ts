import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "需要提供 token" }, { status: 400 });
    }

    // 动态导入 jose
    const { jwtDecrypt } = await import("jose");

    // NextAuth.js 使用的密钥处理方式
    const secret = process.env.NEXTAUTH_SECRET || "your-secret-key";

    // NextAuth.js 会将密钥 hash 成固定长度 (32 bytes for A256GCM)
    const secretBuffer = createHash("sha256").update(secret).digest();
    const secretKey = new Uint8Array(secretBuffer);

    // 解密 JWE
    const { payload } = await jwtDecrypt(token, secretKey);

    return NextResponse.json({
      success: true,
      payload,
      originalToken: token.substring(0, 50) + "...",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "解密失败",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 },
    );
  }
}
