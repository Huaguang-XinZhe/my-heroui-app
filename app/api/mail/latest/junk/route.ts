import { NextRequest, NextResponse } from "next/server";
import { goMailApiService } from "@/lib/goMailApi";
import {
  GetJunkMailRequest,
  GetJunkMailResponse,
  MailRequestInfo,
} from "@/types/email";
import { storeMail, getUserByEmail } from "@/lib/supabase/client";
import { fillDefaultValues } from "@/utils/mailUtils";

/**
 * 获取垃圾邮件
 * POST /api/mail/latest/junk
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: GetJunkMailRequest = await request.json();
    const { mailInfo } = body;

    console.log(`开始获取垃圾邮件: ${mailInfo.email}`);

    // 1. 确保 mailInfo 有必要的默认值（特别是 serviceProvider）
    const processedMailInfo = fillDefaultValues([mailInfo])[0];

    // 2. 调用 GoMailAPI 获取垃圾邮件
    const goMailResult = await goMailApiService.getJunkMail({
      mailInfo: processedMailInfo,
    });

    if (!goMailResult.success || !goMailResult.data?.email) {
      console.log(
        `没有获取到垃圾邮件: ${mailInfo.email}${goMailResult.error ? `, 错误: ${goMailResult.error}` : ""}`,
      );
      return NextResponse.json({ email: null }, { status: 200 });
    }

    const goMailData = goMailResult.data;

    // 3. 异步存储到 Supabase 数据库
    // 注意：这里我们不等待数据库操作完成，立即返回结果（模拟原后端行为）
    Promise.resolve().then(async () => {
      try {
        // 通过邮箱地址查找用户（邮箱已经在 mail_accounts 表中，肯定有对应的用户）
        const user = await getUserByEmail(mailInfo.email);

        if (user && goMailData?.email) {
          // 存储邮件到数据库
          const stored = await storeMail(
            goMailData.email,
            user.id,
            true, // 来自垃圾邮件
          );

          if (stored) {
            console.log(`垃圾邮件已存储到数据库: ${goMailData.email.id}`);
          } else {
            console.log(`垃圾邮件存储失败: ${goMailData.email.id}`);
          }
        } else {
          // 如果找不到用户，说明邮箱账户可能未正确分配给用户
          console.warn(`邮箱 ${mailInfo.email} 未找到对应用户，跳过邮件存储`);
        }

        const elapsed = Date.now() - startTime;
        console.log(`获取垃圾邮件完成，异步存储处理完成 (${elapsed}ms)`);
      } catch (dbError) {
        console.error("异步存储到数据库失败:", dbError);
      }
    });

    // 4. 立即返回 GoMailAPI 的结果
    const response: GetJunkMailResponse = {
      email: goMailData?.email || null,
    };

    const elapsed = Date.now() - startTime;
    console.log(
      `获取垃圾邮件完成: ${mailInfo.email}, 耗时: ${elapsed}ms, 结果: ${response.email ? "有邮件" : "无邮件"}`,
    );

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`获取垃圾邮件失败 (${elapsed}ms):`, error);

    return NextResponse.json(
      {
        error: "获取垃圾邮件失败",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 },
    );
  }
}
