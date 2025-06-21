"use client";

import { useSession } from "next-auth/react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Code } from "@heroui/code";

export default function DebugSession() {
  const { data: session, status } = useSession();

  const fetchServerSession = async () => {
    const response = await fetch("/api/debug-session");
    const data = await response.json();
    console.log("Server Session:", data);
  };

  const copyTokenToClipboard = () => {
    const cookies = document.cookie.split(";");
    // 通过这种方法获取不到 httpOnly 的 cookie！但是插件有时候为什么能获取到❓
    // console.log(cookies);
    const sessionCookie = cookies.find((c) =>
      c.trim().startsWith("next-auth.session-token"),
    );
    if (sessionCookie) {
      const token = sessionCookie.split("=")[1];
      navigator.clipboard.writeText(token);
      alert("Token 已复制到剪贴板");
    } else {
      alert("未找到 session token");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Session 调试页面</h1>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">客户端 Session</h2>
          </CardHeader>
          <CardBody>
            <p className="mb-2">状态: {status}</p>
            {session ? (
              <Code className="whitespace-pre-wrap">
                {JSON.stringify(session, null, 2)}
              </Code>
            ) : (
              <p>未登录</p>
            )}
          </CardBody>
        </Card>

        <div className="flex gap-2">
          <Button onPress={fetchServerSession} color="primary">
            获取服务端 Session
          </Button>
          <Button onPress={copyTokenToClipboard} color="secondary">
            复制 Token
          </Button>
        </div>
      </div>
    </div>
  );
}
