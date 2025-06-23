import { NextRequest, NextResponse } from "next/server";
import { verifyCardKey, CardKeyData } from "@/utils/cardKeyUtils";

interface BatchVerifyRequest {
  cardKeys: string[];
  userId?: string;
}

interface VerifyResult {
  key: string;
  isValid: boolean;
  data?: CardKeyData;
  error?: string;
}

interface EmailGroup {
  shortTerm: number;
  longTerm: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: BatchVerifyRequest = await request.json();
    const { cardKeys, userId = "匿名用户" } = body;

    if (!cardKeys || !Array.isArray(cardKeys) || cardKeys.length === 0) {
      return NextResponse.json(
        { success: false, error: "卡密列表不能为空" },
        { status: 400 },
      );
    }

    if (cardKeys.length > 100) {
      return NextResponse.json(
        { success: false, error: "单次最多验证 100 个卡密" },
        { status: 400 },
      );
    }

    // 批量验证卡密
    const results: VerifyResult[] = [];
    const emailCounts: EmailGroup = { shortTerm: 0, longTerm: 0 };

    for (const cardKey of cardKeys) {
      const result = verifyCardKey(cardKey.trim(), userId);

      results.push({
        key: cardKey.trim(),
        isValid: result.isValid,
        data: result.data,
        error: result.error,
      });

      // 如果验证成功，累计邮箱数量
      if (result.isValid && result.data) {
        if (result.data.duration === "短效") {
          emailCounts.shortTerm += result.data.emailCount;
        } else {
          emailCounts.longTerm += result.data.emailCount;
        }
      }
    }

    // 注意：邮箱分配功能已迁移到新的用户系统中
    // 这里只返回验证结果，不再提供邮箱分配
    const emailData = {
      shortTerm: [] as string[],
      longTerm: [] as string[],
    };

    // 在新架构下，不再自动分配邮箱
    // 用户需要通过用户系统管理自己的邮箱账户

    const validCount = results.filter((r) => r.isValid).length;
    const totalEmailsRequested = emailCounts.shortTerm + emailCounts.longTerm;

    return NextResponse.json({
      success: true,
      results,
      emailData,
      summary: {
        totalVerified: results.length,
        validCount,
        invalidCount: results.length - validCount,
        totalEmailsRequested,
        totalEmailsProvided: 0, // 新架构下不再提供邮箱分配
        shortTermRequested: emailCounts.shortTerm,
        shortTermProvided: 0,
        longTermRequested: emailCounts.longTerm,
        longTermProvided: 0,
      },
      notice: "邮箱分配功能已迁移到新的用户系统中，请通过用户账户管理邮箱。",
    });
  } catch (error) {
    console.error("批量验证卡密失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "服务器内部错误",
      },
      { status: 500 },
    );
  }
}
