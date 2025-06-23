"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Link } from "@heroui/link";
import { Form } from "@heroui/form";
import { FcGoogle } from "react-icons/fc"; // Google 图标
import { FaInfoCircle } from "react-icons/fa"; // 信息图标
import { FaKey } from "react-icons/fa"; // 钥匙图标
import { FengziLogo } from "@/components/icons/FengziLogo";
import { Logo } from "@/components/icons/Logo";
import { SpinnerIcon } from "@/components/icons/SpinnerIcon";
import { motion, AnimatePresence } from "framer-motion";
import { DividerWithText } from "@/components/DividerWithText";
import { AuthButton } from "@/components/AuthButton";
import { signIn } from "next-auth/react";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { addEmailsToCache } from "@/cache/emailCache";

export default function LoginPage() {
  const [cardKey, setCardKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  // 如果已登录，重定向到首页
  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  // 如果已登录，显示加载状态或返回 null
  if (session) {
    return null;
  }

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
        const message = result.isFirstTime
          ? `卡密验证成功！已为您分配专属邮箱账户`
          : `欢迎回来！卡密验证成功`;

        showSuccessToast(message);

        // 将邮箱添加到缓存
        if (result.cacheEmailInfo) {
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
    signIn("google", { callbackUrl: "/" });
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
            <AuthButton icon={<FengziLogo />} text="Fengzi 授权" />

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
