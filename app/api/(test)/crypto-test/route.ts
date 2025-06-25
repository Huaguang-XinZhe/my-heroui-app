import { NextRequest, NextResponse } from "next/server";
import { generateToken, parseToken } from "@/utils/cryptoUtils";

export async function GET() {
  try {
    console.log("开始加密测试...");

    // 测试数据
    const testData = {
      test: "hello",
      number: 123,
      array: [1, 2, 3],
    };

    console.log("测试数据:", testData);

    // 生成令牌
    const token = generateToken(testData, "test");
    console.log("令牌生成成功，长度:", token.length);

    // 解析令牌
    const parseResult = parseToken(token, "test");
    console.log("令牌解析结果:", parseResult);

    return NextResponse.json({
      success: true,
      data: {
        original: testData,
        token,
        tokenLength: token.length,
        parseResult,
        nodeVersion: process.version,
        hasBuffer: typeof Buffer !== "undefined",
        hasBtoa: typeof btoa !== "undefined",
        hasAtob: typeof atob !== "undefined",
      },
    });
  } catch (error) {
    console.error("加密测试失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
