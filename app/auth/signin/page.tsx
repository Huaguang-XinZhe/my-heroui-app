"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (session) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-3 pb-0">
          <h1 className="text-center text-2xl font-bold">欢迎登录</h1>
          <p className="text-center text-sm text-default-500">
            请使用您的谷歌账号登录
          </p>
        </CardHeader>
        <Divider />
        <CardBody className="gap-4">
          <GoogleSignInButton />
        </CardBody>
      </Card>
    </div>
  );
}
