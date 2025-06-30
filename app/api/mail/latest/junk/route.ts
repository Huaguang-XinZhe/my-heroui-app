import { NextRequest, NextResponse } from "next/server";
import { goMailApiService } from "@/lib/goMailApi";
import { GetJunkMailRequest, GetJunkMailResponse, Email } from "@/types/email";
import { storeMail, getUserByEmail } from "@/lib/supabase/client";
import { fillDefaultValues } from "@/utils/mailUtils";

/**
 * 获取垃圾邮件
 * POST /api/mail/latest/junk
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log("🚀 [垃圾邮件API] 开始处理请求");

    // 解析请求体
    const body: GetJunkMailRequest = await request.json();
    console.log(
      "📥 [垃圾邮件API] 接收到请求体:",
      JSON.stringify(body, null, 2),
    );

    const { mailInfo } = body;

    if (!mailInfo) {
      console.error("❌ [垃圾邮件API] mailInfo 为空");
      return NextResponse.json({ error: "mailInfo 参数缺失" }, { status: 400 });
    }

    console.log(`📧 [垃圾邮件API] 开始获取垃圾邮件: ${mailInfo.email}`);
    console.log(
      "📋 [垃圾邮件API] 原始 mailInfo:",
      JSON.stringify(mailInfo, null, 2),
    );

    // 1. 确保 mailInfo 有必要的默认值（特别是 serviceProvider）
    const processedMailInfo = fillDefaultValues([mailInfo])[0];
    console.log(
      "🔧 [垃圾邮件API] 处理后的 mailInfo:",
      JSON.stringify(processedMailInfo, null, 2),
    );

    // 2. 调用 GoMailAPI 获取垃圾邮件
    console.log("🌐 [垃圾邮件API] 准备调用 GoMailAPI getJunkMail...");
    console.log(
      "📤 [垃圾邮件API] 发送给 GoMailAPI 的参数:",
      JSON.stringify(
        {
          mailInfo: processedMailInfo,
        },
        null,
        2,
      ),
    );

    const goMailResult = await goMailApiService.getJunkMail({
      mailInfo: processedMailInfo,
    });

    console.log("📥 [垃圾邮件API] GoMailAPI 返回结果:");
    console.log("  - success:", goMailResult.success);
    console.log("  - error:", goMailResult.error);
    console.log("  - data 存在:", !!goMailResult.data);
    console.log("  - data.email 存在:", !!goMailResult.data?.email);

    if (goMailResult.data) {
      console.log(
        "📊 [垃圾邮件API] GoMailAPI data 详情:",
        JSON.stringify(goMailResult.data, null, 2),
      );
    }

    // 修正：GoMailAPI 返回的 data 直接就是邮件对象，不是 { email: ... }
    if (!goMailResult.success || !goMailResult.data) {
      console.log(
        `❌ [垃圾邮件API] 没有获取到垃圾邮件: ${mailInfo.email}${goMailResult.error ? `, 错误: ${goMailResult.error}` : ""}`,
      );
      return NextResponse.json({ email: null }, { status: 200 });
    }

    // goMailResult.data 的类型是 GetJunkMailResponse，但实际返回的是直接的邮件对象
    // 这是类型定义与实际 API 返回不匹配的问题
    const emailData = goMailResult.data as any as Email;
    console.log("✅ [垃圾邮件API] 成功获取到垃圾邮件数据");

    // 3. 异步存储到 Supabase 数据库
    // 注意：这里我们不等待数据库操作完成，立即返回结果（模拟原后端行为）
    console.log("🗄️ [垃圾邮件API] 开始异步存储到数据库...");
    Promise.resolve().then(async () => {
      try {
        console.log("🔍 [垃圾邮件API] 查找用户:", mailInfo.email);
        // 通过邮箱地址查找用户（邮箱已经在 mail_accounts 表中，肯定有对应的用户）
        const user = await getUserByEmail(mailInfo.email);
        console.log(
          "👤 [垃圾邮件API] 用户查找结果:",
          user ? `找到用户 ID: ${user.id}` : "未找到用户",
        );

        if (user && emailData) {
          console.log("💾 [垃圾邮件API] 开始存储邮件到数据库...");
          // 存储邮件到数据库
          const stored = await storeMail(
            emailData,
            user.id,
            true, // 来自垃圾邮件
          );

          if (stored) {
            console.log(
              `✅ [垃圾邮件API] 垃圾邮件已存储到数据库: ${emailData.id}`,
            );
          } else {
            console.log(`❌ [垃圾邮件API] 垃圾邮件存储失败: ${emailData.id}`);
          }
        } else {
          // 如果找不到用户，说明邮箱账户可能未正确分配给用户
          console.warn(
            `⚠️ [垃圾邮件API] 邮箱 ${mailInfo.email} 未找到对应用户，跳过邮件存储`,
          );
        }

        const elapsed = Date.now() - startTime;
        console.log(
          `🎉 [垃圾邮件API] 获取垃圾邮件完成，异步存储处理完成 (${elapsed}ms)`,
        );
      } catch (dbError) {
        console.error("💥 [垃圾邮件API] 异步存储到数据库失败:", dbError);
      }
    });

    // 4. 立即返回 GoMailAPI 的结果
    const response: GetJunkMailResponse = {
      email: emailData || null,
    };

    console.log(
      "📤 [垃圾邮件API] 准备返回响应:",
      JSON.stringify(response, null, 2),
    );

    const elapsed = Date.now() - startTime;
    console.log(
      `🎯 [垃圾邮件API] 获取垃圾邮件完成: ${mailInfo.email}, 耗时: ${elapsed}ms, 结果: ${response.email ? "有邮件" : "无邮件"}`,
    );

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`💥 [垃圾邮件API] 获取垃圾邮件失败 (${elapsed}ms):`, error);
    console.error("📋 [垃圾邮件API] 错误详情:", {
      message: error instanceof Error ? error.message : "未知错误",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "获取垃圾邮件失败",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 },
    );
  }
}
