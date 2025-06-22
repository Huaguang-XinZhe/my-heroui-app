import { NextRequest, NextResponse } from "next/server";
import { GetJunkMailRequest, GetJunkMailResponse } from "@/types/email";
import { goMailApiService } from "@/lib/goMailApi";
import {
  storeMail,
  updateMailAccountFetchTime,
  logMailOperation,
  markMailAccountAsBanned,
  addMailAccount,
} from "@/lib/supabase/emails";
import { fillDefaultValues } from "@/utils/mailUtils";

/**
 * 获取垃圾邮件
 * POST /api/mail/latest/junk
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: GetJunkMailRequest = await request.json();

    if (!body.mailInfo || !body.mailInfo.email || !body.mailInfo.refreshToken) {
      return NextResponse.json(
        { success: false, error: "邮箱信息不完整" },
        { status: 400 },
      );
    }

    const { mailInfo } = body;
    console.log(`开始获取垃圾邮件: ${mailInfo.email}`);

    // 填充默认值（确保 serviceProvider 和 clientId 有默认值）
    const [processedMailInfo] = fillDefaultValues([mailInfo]);
    const processedBody = {
      ...body,
      mailInfo: processedMailInfo,
    };

    // 0. 确保邮箱账户存在于数据库中（忽略添加结果，因为可能已存在）
    await addMailAccount(processedMailInfo);

    // 1. 调用 GoMailAPI 获取垃圾邮件
    const goMailResult = await goMailApiService.getJunkMail(processedBody);

    if (!goMailResult.success) {
      // 记录错误日志
      const clientIp =
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown";
      const userAgent = request.headers.get("user-agent") || "unknown";

      await logMailOperation(
        mailInfo.email,
        "fetch_junk",
        "error",
        0,
        goMailResult.error,
        clientIp,
        userAgent,
      );

      // 如果是认证失败，标记账户为封禁
      if (
        goMailResult.error?.includes("401") ||
        goMailResult.error?.includes("authentication")
      ) {
        await markMailAccountAsBanned(mailInfo.email);
      }

      return NextResponse.json(
        {
          success: false,
          error: goMailResult.error || "GoMailAPI 调用失败",
        },
        { status: 502 },
      );
    }

    const goMailData = goMailResult.data;

    // 2. 异步存储到 Supabase 数据库
    // 注意：这里我们不等待数据库操作完成，立即返回结果（模拟原后端行为）
    Promise.resolve().then(async () => {
      try {
        const clientIp =
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown";
        const userAgent = request.headers.get("user-agent") || "unknown";

        // 如果获取到邮件，存储到数据库
        if (goMailData?.email) {
          const stored = await storeMail(
            goMailData.email,
            mailInfo.email,
            "junk",
          );
          if (stored) {
            console.log(`垃圾邮件已存储到数据库: ${goMailData.email.id}`);
          }
        }

        // 更新账户的最后获取时间
        await updateMailAccountFetchTime(mailInfo.email);

        // 记录操作日志
        await logMailOperation(
          mailInfo.email,
          "fetch_junk",
          "success",
          goMailData?.email ? 1 : 0,
          undefined,
          clientIp,
          userAgent,
        );

        const elapsed = Date.now() - startTime;
        console.log(`获取垃圾邮件完成，异步存储到数据库成功 (${elapsed}ms)`);
      } catch (dbError) {
        console.error("异步存储到数据库失败:", dbError);
      }
    });

    // 3. 立即返回 GoMailAPI 的结果
    const response: GetJunkMailResponse = {
      email: goMailData?.email || null,
    };

    const elapsed = Date.now() - startTime;
    console.log(
      `获取垃圾邮件完成: ${mailInfo.email}, 耗时: ${elapsed}ms, 结果: ${response.email ? "有邮件" : "无邮件"}`,
    );

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("获取垃圾邮件失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "服务器内部错误",
      },
      { status: 500 },
    );
  }
}
