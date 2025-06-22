import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import { goMailApiService } from "@/lib/goMailApi";

/**
 * 邮件系统健康检查
 * GET /api/mail/health
 */
export async function GET(request: NextRequest) {
  try {
    const checks = {
      timestamp: new Date().toISOString(),
      nextjs: true, // Next.js API 正常运行
      supabase: false,
      goMailApi: false,
      details: {
        supabase: { status: "unknown", error: null as string | null },
        goMailApi: { status: "unknown", error: null as string | null },
      },
    };

    // 检查 Supabase 连接
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("emails")
        .select("count")
        .limit(1);

      if (error) {
        checks.details.supabase = {
          status: "error",
          error: error.message,
        };
      } else {
        checks.supabase = true;
        checks.details.supabase = {
          status: "healthy",
          error: null,
        };
      }
    } catch (error) {
      checks.details.supabase = {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    // 检查 GoMailAPI 连接（设置较短的超时时间，避免阻塞）
    try {
      // 设置超时检查
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error("GoMailAPI 检查超时")), 5000); // 5秒超时
      });

      const healthPromise = goMailApiService.healthCheck();

      const isHealthy = await Promise.race([healthPromise, timeoutPromise]);
      checks.goMailApi = isHealthy;
      checks.details.goMailApi = {
        status: isHealthy ? "healthy" : "error",
        error: isHealthy ? null : "Service unavailable",
      };
    } catch (error) {
      checks.details.goMailApi = {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    // 只要 Next.js 和 Supabase 正常就认为系统可用
    const isHealthy = checks.nextjs && checks.supabase;

    return NextResponse.json(
      {
        status: isHealthy ? "healthy" : "degraded",
        checks,
      },
      {
        status: isHealthy ? 200 : 503,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "系统错误",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
