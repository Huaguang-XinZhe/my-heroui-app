import { useState } from "react";
import { Session } from "next-auth";
import { getOAuthUser } from "@/utils/oauthUserStorage";
import { addEmailsToCache } from "@/cache/emailCache";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

/**
 * 邀请分配 Hook
 * 处理通过邀请链接登录的 OAuth 用户的邮箱分配
 */
export function useInviteAllocation() {
  const [isProcessingInvite, setIsProcessingInvite] = useState(false);

  const checkOAuthInviteAllocation = async (
    session: Session | null,
    status: string,
  ) => {
    try {
      // 只处理 OAuth 登录的情况
      if (!session?.user || status !== "authenticated") return;

      // 检查 sessionStorage 中是否有邀请令牌
      const inviteToken = sessionStorage.getItem("inviteToken");
      if (!inviteToken) return; // 没有邀请令牌，不是通过邀请链接登录的

      console.log("检测到 OAuth 邀请登录，开始处理邮箱分配...");

      const sessionUser = session.user as any;
      let userId: string;

      // 获取用户 ID
      if (sessionUser.userId) {
        userId = sessionUser.userId;
      } else {
        // 从本地存储获取 OAuth 用户信息
        const oauthUser = getOAuthUser();
        if (!oauthUser) {
          console.log("无法获取 OAuth 用户信息");
          return;
        }
        userId = oauthUser.id;
      }

      setIsProcessingInvite(true);

      // 调用邮箱分配 API
      const response = await fetch("/api/invite/oauth-allocate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviteToken,
          userId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 将分配的邮箱添加到缓存
        if (result.cacheEmailInfo && result.cacheEmailInfo.length > 0) {
          addEmailsToCache(result.cacheEmailInfo);

          const message = result.isExisting
            ? `欢迎回来！已加载 ${result.cacheEmailInfo.length} 个邮箱账户`
            : `邀请验证成功！已为您分配 ${result.cacheEmailInfo.length} 个专属邮箱账户`;

          showSuccessToast(message);

          console.log(
            `OAuth 邮箱分配成功: ${result.cacheEmailInfo.length} 个邮箱已添加到缓存`,
          );
        }

        // 如果是新分配的邮箱，记录邀请使用
        if (!result.isExisting) {
          try {
            const useInviteResponse = await fetch("/api/admin/invite/use", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                token: inviteToken,
                userId,
                registrationMethod: "oauth",
              }),
            });

            const useResult = await useInviteResponse.json();
            if (!useResult.success) {
              console.error("记录邀请使用失败:", useResult.error);
            } else {
              console.log("邀请使用记录成功");
            }
          } catch (error) {
            console.error("调用邀请使用 API 失败:", error);
          }
        }

        // 清除邀请令牌，避免重复处理
        sessionStorage.removeItem("inviteToken");
      } else {
        console.error("OAuth 邮箱分配失败:", result.error);
        showErrorToast(result.error || "邮箱分配失败");

        // 仍然清除令牌，避免无限重试
        sessionStorage.removeItem("inviteToken");
      }
    } catch (error) {
      console.error("检查 OAuth 邀请分配时出错:", error);
      // 发生错误时也清除令牌
      sessionStorage.removeItem("inviteToken");
    } finally {
      setIsProcessingInvite(false);
    }
  };

  return {
    isProcessingInvite,
    checkOAuthInviteAllocation,
  };
}
