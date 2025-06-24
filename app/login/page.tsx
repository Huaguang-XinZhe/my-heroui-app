"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Link } from "@heroui/link";
import { Form } from "@heroui/form";
import { FcGoogle } from "react-icons/fc"; // Google 图标
import { FaInfoCircle } from "react-icons/fa"; // 信息图标
import { FaKey } from "react-icons/fa"; // 钥匙图标

import { Logo } from "@/components/icons/Logo";
import { SpinnerIcon } from "@/components/icons/SpinnerIcon";
import { motion, AnimatePresence } from "framer-motion";
import { DividerWithText } from "@/components/DividerWithText";
import { AuthButton } from "@/components/AuthButton";
import { signIn } from "next-auth/react";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { addEmailsToCache } from "@/cache/emailCache";

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
    if (session) {
      console.log("[Login] User already logged in, redirecting to home");
      router.push("/");
    }
  }, [session, router]);

  const handleCardKeySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!cardKey.trim()) {
      showErrorToast("请输入卡密");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/card/batch-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardKeys: [cardKey.trim()],
        }),
      });

      if (!response.ok) {
        throw new Error("网络错误");
      }

      const data = await response.json();

      if (data.success && data.results?.[0]?.success) {
        const result = data.results[0];
        showSuccessToast(`验证成功！获得 ${result.emailCount} 个邮箱账号`);

        // 将邮箱添加到缓存
        if (result.emails?.length > 0) {
          await addEmailsToCache(result.emails);
        }

        // 清空输入框
        setCardKey("");

        // 跳转到首页
        router.push("/");
      } else {
        const errorMsg = data.results?.[0]?.error || "卡密验证失败";
        showErrorToast(errorMsg);
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

        <CardBody className="space-y-6 px-8 pb-8">
          {/* 卡密验证区域 */}
          <Form className="space-y-4" onSubmit={handleCardKeySubmit}>
            <Input
              isRequired
              label="卡密"
              placeholder="请输入您的卡密"
              value={cardKey}
              onValueChange={setCardKey}
              startContent={<FaKey className="text-lg text-gray-400" />}
              variant="flat"
              classNames={{
                input: "bg-transparent",
                inputWrapper:
                  "bg-gray-800/50 border border-gray-700 hover:border-indigo-500 focus-within:border-indigo-500 transition-colors",
              }}
            />

            <Button
              type="submit"
              color="primary"
              variant="solid"
              size="lg"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold text-white hover:from-indigo-600 hover:to-purple-700"
              isLoading={isLoading}
              spinner={<SpinnerIcon />}
            >
              {isLoading ? "验证中..." : "验证卡密"}
            </Button>
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
