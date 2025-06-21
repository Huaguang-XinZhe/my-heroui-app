import { NextRequest, NextResponse } from "next/server";
import { verifyCardKey, CardKeyData } from "@/utils/cardKeyUtils";
import { getEmailsByType, logCardVerification } from "@/lib/supabase/emails";

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

    // 从 Supabase 获取邮箱
    const emailData = {
      shortTerm: [] as string[],
      longTerm: [] as string[],
    };

    // 获取短效邮箱
    if (emailCounts.shortTerm > 0) {
      emailData.shortTerm = await getEmailsByType(
        "short_term",
        emailCounts.shortTerm,
      );
    }

    // 获取长效邮箱
    if (emailCounts.longTerm > 0) {
      emailData.longTerm = await getEmailsByType(
        "long_term",
        emailCounts.longTerm,
      );
    }

    // 记录验证日志
    const validCards = results.filter((r) => r.isValid);
    if (validCards.length > 0) {
      const logEntries = validCards.map((card) => ({
        card_key: card.key,
        user_id: userId,
        verified_at: new Date().toISOString(),
        email_count: card.data?.emailCount || 0,
        duration: card.data?.duration || "未知",
        source: card.data?.source || "未知",
        custom_source: card.data?.customSource,
      }));

      await logCardVerification(logEntries);
    }

    const validCount = results.filter((r) => r.isValid).length;
    const totalEmailsProvided =
      emailData.shortTerm.length + emailData.longTerm.length;
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
        totalEmailsProvided,
        shortTermRequested: emailCounts.shortTerm,
        shortTermProvided: emailData.shortTerm.length,
        longTermRequested: emailCounts.longTerm,
        longTermProvided: emailData.longTerm.length,
      },
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
