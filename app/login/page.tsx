"use client";

import { useState } from "react";
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

export default function LoginPage() {
  const [cardKey, setCardKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!cardKey) return;

    setIsLoading(true);
    // 模拟验证过程
    setTimeout(() => {
      setIsLoading(false);
      // 这里可以添加验证成功后的逻辑
    }, 2000);
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
          <Form onSubmit={handleSubmit} className="space-y-4">
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
                卡密仅可使用一次，登录后将自动创建账号。请务必保存好您的登录信息！
              </p>
            </div>
          </Form>

          {/* 分割线 */}
          <DividerWithText>或者</DividerWithText>

          {/* 授权登录区域 */}
          <div className="grid grid-cols-2 gap-4">
            <AuthButton icon={<FengziLogo />} text="Fengzi 授权" />

            <AuthButton icon={<FcGoogle />} text="谷歌授权" />
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">首次登录将自动注册账号</p>
            <Link
              href="/contact"
              className="mb-4 mt-2 inline-block text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
            >
              遇到问题？联系客服
            </Link>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
