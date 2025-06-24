import { getServerSession } from "next-auth/next";
import { NextRequest } from "next/server";

// 管理员检查函数
export async function isUserAdmin(request: NextRequest): Promise<boolean> {
  try {
    // 使用 NextAuth 获取 session
    const session = await getServerSession();

    if (!session?.user) {
      return false;
    }

    // 检查用户是否是管理员
    return session.user.isAdmin === true;
  } catch (error) {
    console.error("[AdminCheck] Error checking admin status:", error);
    return false;
  }
}

// 管理员验证中间件
export function requireAdmin() {
  return async (request: NextRequest) => {
    const isAdmin = await isUserAdmin(request);

    if (!isAdmin) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "需要管理员权限",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return null; // 允许继续
  };
}

// 客户端管理员检查 Hook
export function useAdminCheck() {
  const { data: session } = require("next-auth/react").useSession();

  return {
    isAdmin: session?.user?.isAdmin === true,
    isLoading: !session,
  };
}
