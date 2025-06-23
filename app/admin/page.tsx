"use client";

import { useSession } from "next-auth/react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import Link from "next/link";
import {
  IconShield,
  IconRefresh,
  IconKey,
  IconDatabase,
  IconCheck,
} from "@/components/icons/icons";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();

  // 检查权限
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <IconRefresh className="mx-auto mb-4 h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user?.isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-96">
          <CardBody className="text-center">
            <IconShield className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold">访问受限</h2>
            <p className="text-gray-400">此页面仅供管理员访问</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const adminFeatures = [
    {
      title: "卡密生成",
      description: "生成和管理系统卡密",
      icon: <IconKey className="h-8 w-8" />,
      href: "/admin/card-key-generator",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "批量添加邮箱",
      description: "批量添加邮箱到系统池（未分配）",
      icon: <IconDatabase className="h-8 w-8" />,
      href: "/admin/batch-add-emails",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  ];

  return (
    <div className="h-screen overflow-y-auto bg-background">
      <div className="container mx-auto max-w-6xl space-y-8 p-6">
        {/* 页面标题 */}
        <div className="text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <IconShield className="h-12 w-12 text-indigo-500" />
            <h1 className="text-4xl font-bold">管理员控制台</h1>
          </div>
          <p className="text-gray-400">系统管理和配置工具</p>
        </div>

        {/* 管理员信息 */}
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20">
                  <IconShield className="h-6 w-6 text-indigo-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    欢迎，{session.user.name}
                  </h2>
                  <p className="text-gray-400">{session.user.email}</p>
                </div>
              </div>
              <Chip color="success" variant="flat">
                管理员权限
              </Chip>
            </div>
          </CardBody>
        </Card>

        {/* 功能区域 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {adminFeatures.map((feature) => (
            <Card
              key={feature.title}
              className="transition-shadow hover:shadow-lg"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl p-3 ${feature.bgColor}`}>
                    <div className={feature.color}>{feature.icon}</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <p className="mb-4 text-gray-400">{feature.description}</p>
                <Button
                  as={Link}
                  href={feature.href}
                  color="primary"
                  variant="flat"
                  className="w-full"
                >
                  进入
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
