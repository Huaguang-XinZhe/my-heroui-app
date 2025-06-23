"use client";

import { useSession } from "next-auth/react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Chip } from "@heroui/chip";

export default function UnauthorizedPage() {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-3 pb-0">
          <div className="flex items-center gap-2">
            <Chip color="danger" variant="flat" size="lg">
              🚫 访问被拒绝
            </Chip>
          </div>
          <h1 className="text-center text-2xl font-bold text-danger">
            权限不足
          </h1>
        </CardHeader>
        <CardBody className="gap-4 pt-2">
          <div className="space-y-2 text-center">
            <p className="text-default-600">很抱歉，您没有权限访问此页面。</p>
            <p className="text-sm text-default-500">此功能仅限管理员使用。</p>
            {session?.user?.email && (
              <p className="text-xs text-default-400">
                当前登录: {session.user.email}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button as={Link} href="/" color="primary" className="w-full">
              返回首页
            </Button>

            <Button
              as={Link}
              href="/batch-card-verify"
              color="secondary"
              variant="flat"
              className="w-full"
            >
              前往批量验证页面
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-default-400">
              如需管理员权限，请联系系统管理员
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
