"use client";

import { useSession, signOut } from "next-auth/react";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { clearAllUserData } from "@/utils/utils";

export function UserProfile() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-4">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardBody className="flex flex-col items-center space-y-4 p-6">
        <Avatar
          src={session.user?.image || undefined}
          name={session.user?.name || undefined}
          size="lg"
          isBordered
        />
        <div className="text-center">
          <h2 className="text-xl font-semibold">{session.user?.name}</h2>
          <p className="text-default-500">{session.user?.email}</p>
        </div>
        <Button
          onPress={() => {
            // 清除所有用户数据
            clearAllUserData();
            // 退出登录
            signOut({ callbackUrl: "/login" });
          }}
          color="danger"
          variant="flat"
          className="w-full"
        >
          退出登录
        </Button>
      </CardBody>
    </Card>
  );
}
