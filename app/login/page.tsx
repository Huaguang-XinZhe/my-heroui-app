"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Form } from "@heroui/form";
import { FcGoogle } from "react-icons/fc"; // Google 图标
import { FaInfoCircle } from "react-icons/fa"; // 信息图标
import { FaKey } from "react-icons/fa"; // 钥匙图标

import { Logo } from "@/components/icons/Logo";
import { SpinnerIcon } from "@/components/icons/SpinnerIcon";
import { motion } from "framer-motion";
import { DividerWithText } from "@/components/ui/DividerWithText";
import { AuthButton } from "@/components/auth/AuthButton";
import { signIn } from "next-auth/react";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { addEmailsToCache } from "@/cache/emailCache";
import {
  saveOAuthUser,
  getOAuthUser,
  OAuthUserInfo,
} from "@/utils/oauthUserStorage";

// 错误检查组件
function ErrorChecker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      console.log("[Login] OAuth error detected:", error);
      showErrorToast(`登录失败: ${error}`);
    }
  }, [searchParams]);

  return null;
}

function LoginForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cardKey, setCardKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 检查登录状态
  useEffect(() => {
    console.log("[Login] Session status:", status);
    if (session && status === "authenticated") {
      console.log("[Login] User already logged in, redirecting to home");
      router.push("/");
    }
  }, [session, router, status]);

  // 保存 OAuth 用户信息到本地存储
  useEffect(() => {
    if (session?.user && status === "authenticated") {
      const sessionUser = session.user as any;

      // 检查是否是 OAuth 登录
      if (sessionUser.userId) {
        let provider: "google" | "linuxdo";
        let userType: "oauth2-google" | "oauth2-linuxdo";

        // 通过 username 字段或 email 格式判断提供商
        if (sessionUser.username) {
          // 有 username 字段说明是 Linux DO 用户
          provider = "linuxdo";
          userType = "oauth2-linuxdo";
        } else {
          // 没有 username 字段说明是 Google 用户
          provider = "google";
          userType = "oauth2-google";
        }

        const oauthUserInfo: OAuthUserInfo = {
          id: sessionUser.userId,
          nickname: sessionUser.name || undefined,
          avatar_url: sessionUser.image || undefined,
          user_type: userType,
          level: sessionUser.trustLevel || undefined,
          provider,
          username: sessionUser.username || undefined,
        };

        // 检查本地是否已有该用户信息
        const existingUser = getOAuthUser();
        if (!existingUser || existingUser.id !== oauthUserInfo.id) {
          saveOAuthUser(oauthUserInfo);
          console.log("[Login] OAuth user info saved:", oauthUserInfo);
        }
      }
    }
  }, [session, status]);

  const handleCardKeySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!cardKey.trim()) {
      showErrorToast("请输入卡密");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/card/cardkey-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardKey: cardKey.trim(),
        }),
      });

      const result = await response.json();

      if (result.success && result.accountData) {
        const emailCount = result.allCacheEmailInfo?.length || 1;
        const message = result.isFirstTime
          ? `卡密验证成功！已为您分配 ${emailCount} 个专属邮箱账户`
          : `欢迎回来！已加载 ${emailCount} 个邮箱账户`;

        showSuccessToast(message);

        // 将所有邮箱添加到缓存
        if (result.allCacheEmailInfo && result.allCacheEmailInfo.length > 0) {
          addEmailsToCache(result.allCacheEmailInfo);
          console.log(
            `已添加 ${result.allCacheEmailInfo.length} 个邮箱到缓存:`,
            result.allCacheEmailInfo.map(
              (email: any) => `${email.email}(${email.protocolType})`,
            ),
          );
        } else if (result.cacheEmailInfo) {
          // 向后兼容：如果没有 allCacheEmailInfo，使用旧的 cacheEmailInfo
          addEmailsToCache([result.cacheEmailInfo]);
        }

        // 存储体验账户信息到 localStorage
        localStorage.setItem(
          "trialAccount",
          JSON.stringify({
            ...result.accountData,
            cardData: {
              ...result.userSession.cardData,
              originalCardKey: cardKey.trim(), // 保存原始卡密
            },
            isTrialAccount: true,
            // 新增：存储所有邮箱账户信息
            allEmailAccounts: result.allEmailAccounts || [result.accountData],
            emailCount: result.allEmailAccounts?.length || 1,
          }),
        );

        // 重定向到首页
        router.push("/");
      } else {
        showErrorToast(result.error || "卡密验证失败，请检查卡密是否正确");
      }
    } catch (error) {
      console.error("卡密验证失败:", error);
      showErrorToast("网络错误，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log("[Login] Attempting Google sign in");
    signIn("google", { callbackUrl: "/" });
  };

  const handleLinuxDOSignIn = () => {
    console.log("[Login] Attempting LinuxDO sign in");
    signIn("linuxdo", { callbackUrl: "/" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
        // delay: 0.1, // 轻微延迟，让 Header 先开始收缩
      }}
      className="max-w-md"
    >
      <Card className="rounded-2xl bg-[#0A0F1A] shadow-2xl shadow-indigo-500/10 ring-[0.5px] ring-indigo-500/10 hover:shadow-indigo-500/30">
        <CardHeader className="flex flex-col items-center gap-2 pb-0">
          {/* Logo 区域 */}
          <Logo className="mb-2 mt-4 size-16" />

          <h1 className="text-3xl font-extrabold text-white">欢迎回来</h1>
          <p className="text-sm text-gray-400">
            登录您的 <strong className="text-indigo-400">邮取星</strong> 账号
          </p>
        </CardHeader>

        <CardBody className="space-y-6 px-8 pt-6">
          {/* 卡密登录区域 - 使用表单包装 */}
          <Form onSubmit={handleCardKeySubmit} className="space-y-4">
            <Input
              isClearable
              onClear={() => setCardKey("")}
              placeholder="请输入卡密（by 华光共享号）"
              value={cardKey}
              onChange={(e) => setCardKey(e.target.value)}
              size="lg"
              radius="lg"
              startContent={
                <div className="pointer-events-none flex items-center text-indigo-500">
                  <FaKey className="h-4 w-4" />
                </div>
              }
              classNames={{
                input: "ml-1",
                inputWrapper: [
                  "bg-gray-900",
                  "group-hover:bg-gray-875", // 这个样式会生效，普通的 hover 或者 !hover 没用❗
                  "group-data-[focus=true]:bg-gray-900",
                ],
              }}
            />

            <Button
              type="submit"
              size="lg"
              radius="lg"
              color="primary"
              isLoading={isLoading}
              spinner={<SpinnerIcon className="h-5 w-5 animate-spin" />}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 font-medium transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className="inline-flex items-center">验证并登录</span>
            </Button>

            <div className="flex rounded-lg border-l-4 border-indigo-500 bg-indigo-900/20 p-4">
              <FaInfoCircle className="mt-0.5 w-8 text-indigo-400" />
              <p className="ml-2 text-sm font-medium text-indigo-300">
                卡密可重复使用，首次使用时将自动分配邮箱账户。请务必妥善保存，这是卡密登录的唯一凭证！
              </p>
            </div>
          </Form>

          {/* 分割线 */}
          <DividerWithText>或者</DividerWithText>

          {/* 授权登录区域 */}
          <div className="grid grid-cols-2 gap-4">
            <AuthButton
              icon={
                <img
                  src="/linuxdo-logo.png"
                  alt="Linux DO"
                  className="h-5 w-5"
                />
              }
              text="LinuxDO 授权"
              onPress={handleLinuxDOSignIn}
            />

            <AuthButton
              icon={<FcGoogle />}
              text="谷歌授权"
              onPress={handleGoogleSignIn}
            />
          </div>

          <div className="mt-4 text-center">
            <p className="mb-5 text-sm text-gray-500">首次登录将自动注册账号</p>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Suspense fallback={null}>
        <ErrorChecker />
      </Suspense>
      <LoginForm />
    </>
  );
}
