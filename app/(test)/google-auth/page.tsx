"use client";

import { useSession } from "next-auth/react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { UserProfile } from "@/components/auth/UserProfile";

export default function GoogleAuthPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <h1 className="text-3xl font-bold">谷歌登录演示页面</h1>
          </CardHeader>
          <Divider />
          <CardBody>
            <p className="mb-4 text-default-600">
              这是一个展示谷歌登录功能的页面。您可以使用谷歌账号登录和退出。
            </p>
            <div className="flex gap-4">
              <Button as={Link} href="/" variant="ghost">
                返回首页
              </Button>
              {!session && (
                <Button as={Link} href="/auth/signin" color="primary">
                  前往登录页面
                </Button>
              )}
            </div>
          </CardBody>
        </Card>

        {session ? (
          <div className="space-y-4">
            <h2 className="text-center text-2xl font-semibold">登录成功！</h2>
            <UserProfile />
          </div>
        ) : (
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-center text-xl font-semibold">请登录</h2>
              <p className="text-center text-default-600">
                您需要登录才能查看用户信息
              </p>
              <GoogleSignInButton callbackUrl="/google-auth" />
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
