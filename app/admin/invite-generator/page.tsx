"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import {
  formatInviteDisplay,
  formatRegistrationMethods,
  formatExpiryTime,
} from "@/utils/inviteUtils.client";
import { InviteData } from "@/utils/inviteUtils";
import {
  IconKey,
  IconClock,
  IconUsers,
  IconMail,
  IconShield,
  IconRefresh,
  IconCopy,
  IconLink,
} from "@/components/icons/icons";

interface GeneratedInvite {
  token: string;
  data: InviteData;
  url: string;
}

export default function InviteGeneratorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 表单状态
  const [imapEmailCount, setImapEmailCount] = useState("0");
  const [graphEmailCount, setGraphEmailCount] = useState("1");
  const [maxRegistrations, setMaxRegistrations] = useState("1");
  const [validDays, setValidDays] = useState("7");

  // 注册方式开关
  const [allowLinuxdo, setAllowLinuxdo] = useState(false);
  const [allowGoogle, setAllowGoogle] = useState(false);
  const [allowCardKey, setAllowCardKey] = useState(false);
  const [allowOthers, setAllowOthers] = useState(false);

  // 权限设置
  const [allowBatchAddEmails, setAllowBatchAddEmails] = useState(true);

  // 特殊功能
  const [autoCreateTrialAccount, setAutoCreateTrialAccount] = useState(true);

  // 生成结果
  const [generatedInvites, setGeneratedInvites] = useState<GeneratedInvite[]>(
    [],
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // 检查登录状态和管理员权限
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (!session.user?.isAdmin) {
      router.push("/unauthorized");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <IconRefresh className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session || !session.user?.isAdmin) {
    return null;
  }

  // 生成自定义邀请链接
  const handleGenerateCustom = async () => {
    // 检查输入是否为空
    if (
      !imapEmailCount.trim() ||
      !graphEmailCount.trim() ||
      !maxRegistrations.trim() ||
      !validDays.trim()
    ) {
      alert("请填写所有必需字段");
      return;
    }

    const imapCount = parseInt(imapEmailCount);
    const graphCount = parseInt(graphEmailCount);
    const maxReg = parseInt(maxRegistrations);
    const validDaysNum = parseInt(validDays);

    // 检查是否为有效数字
    if (
      isNaN(imapCount) ||
      isNaN(graphCount) ||
      isNaN(maxReg) ||
      isNaN(validDaysNum)
    ) {
      alert("请输入有效的数字");
      return;
    }

    if (imapCount < 0 || graphCount < 0 || maxReg <= 0 || validDaysNum <= 0) {
      alert("请输入有效的数值");
      return;
    }

    // 检查是否至少有一种邮箱类型
    if (imapCount === 0 && graphCount === 0) {
      alert("IMAP 和 GRAPH 邮箱数量不能同时为 0");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/admin/invite/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "custom",
          imapEmailCount: imapCount,
          graphEmailCount: graphCount,
          maxRegistrations: maxReg,
          validDays: validDaysNum,
          registrationMethods: {
            linuxdo: allowLinuxdo,
            google: allowGoogle,
            cardKey: allowCardKey,
            others: allowOthers,
          },
          allowBatchAddEmails,
          autoCreateTrialAccount,
          createdBy: session?.user?.email || "admin",
        }),
      });

      const result = await response.json();

      if (result.success) {
        const newInvite: GeneratedInvite = {
          token: result.data.token,
          data: result.data.inviteData,
          url: result.data.url,
        };
        setGeneratedInvites([newInvite, ...generatedInvites]);
      } else {
        alert(result.error || "邀请链接生成失败");
      }
    } catch (error) {
      console.error("自定义邀请生成异常:", error);
      alert("邀请链接生成失败，请重试");
    }

    setIsGenerating(false);
  };

  // 生成快捷邀请链接
  const handleGenerateQuick = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch("/api/admin/invite/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "quick",
          createdBy: session?.user?.email || "admin",
        }),
      });

      const result = await response.json();

      if (result.success) {
        const newInvite: GeneratedInvite = {
          token: result.data.token,
          data: result.data.inviteData,
          url: result.data.url,
        };
        setGeneratedInvites([newInvite, ...generatedInvites]);
      } else {
        alert(result.error || "快捷邀请生成失败");
      }
    } catch (error) {
      console.error("快捷邀请生成异常:", error);
      alert("快捷邀请生成失败，请重试");
    }

    setIsGenerating(false);
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    // 这里可以添加 toast 提示
  };

  // 处理自动创建体验账户的变化
  const handleAutoCreateTrialAccountChange = (value: boolean) => {
    setAutoCreateTrialAccount(value);
    if (value) {
      // 如果开启自动创建体验账户，关闭所有注册方式
      setAllowLinuxdo(false);
      setAllowGoogle(false);
      setAllowCardKey(false);
      setAllowOthers(false);
    }
  };

  // 处理注册方式的变化
  const handleRegistrationMethodChange = (
    method: "linuxdo" | "google" | "cardKey" | "others",
    value: boolean,
  ) => {
    if (value) {
      // 如果选中任何一个注册方式，关闭自动创建体验账户
      setAutoCreateTrialAccount(false);

      if (method === "others") {
        // 如果选中其他，关闭其他三个方式
        setAllowLinuxdo(false);
        setAllowGoogle(false);
        setAllowCardKey(false);
        setAllowOthers(true);
      } else {
        // 如果选中非其他，去掉其他的选中
        setAllowOthers(false);
        switch (method) {
          case "linuxdo":
            setAllowLinuxdo(true);
            break;
          case "google":
            setAllowGoogle(true);
            break;
          case "cardKey":
            setAllowCardKey(true);
            break;
        }
      }
    } else {
      // 正常取消选择
      switch (method) {
        case "linuxdo":
          setAllowLinuxdo(false);
          break;
        case "google":
          setAllowGoogle(false);
          break;
        case "cardKey":
          setAllowCardKey(false);
          break;
        case "others":
          setAllowOthers(false);
          break;
      }
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-background">
      <div className="container mx-auto max-w-7xl space-y-6 p-6">
        <h1 className="mb-8 text-center text-3xl font-bold">邀请链接生成器</h1>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 快捷生成 */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <IconKey className="h-6 w-6 text-orange-500" />
              <h2 className="text-xl font-semibold">快捷生成</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20">
                <h3 className="mb-2 font-semibold text-orange-800 dark:text-orange-200">
                  默认配置
                </h3>
                <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-300">
                  <li>• 允许 1 人注册</li>
                  <li>• 7 天有效期</li>
                  <li>• 1 个 GRAPH 邮箱 + 1 个 IMAP 邮箱</li>
                  <li>• 自动创建体验账户</li>
                  <li>• 开放批量添加邮箱权限</li>
                </ul>
              </div>
              <Button
                onPress={handleGenerateQuick}
                color="warning"
                variant="flat"
                size="lg"
                className="w-full"
                isLoading={isGenerating}
                startContent={<IconKey className="h-5 w-5" />}
              >
                生成快捷邀请
              </Button>
            </CardBody>
          </Card>

          {/* 自定义配置 */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <IconShield className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold">自定义配置</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {/* 邮箱配额 */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="IMAP 邮箱数量"
                  value={imapEmailCount}
                  onValueChange={setImapEmailCount}
                  min="0"
                  description="允许设置为 0"
                  startContent={<IconMail className="h-4 w-4" />}
                />
                <Input
                  type="number"
                  label="GRAPH 邮箱数量"
                  value={graphEmailCount}
                  onValueChange={setGraphEmailCount}
                  min="0"
                  description="允许设置为 0"
                  startContent={<IconMail className="h-4 w-4" />}
                />
              </div>

              {/* 注册限制和有效期 */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="最大注册人数"
                  value={maxRegistrations}
                  onValueChange={setMaxRegistrations}
                  min="1"
                  startContent={<IconUsers className="h-4 w-4" />}
                />
                <Input
                  type="number"
                  label="有效天数"
                  value={validDays}
                  onValueChange={setValidDays}
                  min="1"
                  startContent={<IconClock className="h-4 w-4" />}
                />
              </div>

              <Divider />

              {/* 注册方式 */}
              <div>
                <h3 className="mb-3 text-sm font-medium">开放的注册方式</h3>
                <div className="space-y-3">
                  <Switch
                    isSelected={allowLinuxdo}
                    onValueChange={(value) =>
                      handleRegistrationMethodChange("linuxdo", value)
                    }
                  >
                    LinuxDo 登录
                  </Switch>
                  <Switch
                    isSelected={allowGoogle}
                    onValueChange={(value) =>
                      handleRegistrationMethodChange("google", value)
                    }
                  >
                    Google 登录
                  </Switch>
                  <Switch
                    isSelected={allowCardKey}
                    onValueChange={(value) =>
                      handleRegistrationMethodChange("cardKey", value)
                    }
                  >
                    卡密登录
                  </Switch>
                  <Switch
                    isSelected={allowOthers}
                    onValueChange={(value) =>
                      handleRegistrationMethodChange("others", value)
                    }
                  >
                    其他方式
                  </Switch>
                </div>
              </div>

              <Divider />

              {/* 权限设置 */}
              <div>
                <h3 className="mb-3 text-sm font-medium">权限设置</h3>
                <div className="space-y-3">
                  <Switch
                    isSelected={allowBatchAddEmails}
                    onValueChange={setAllowBatchAddEmails}
                  >
                    允许批量添加邮箱
                  </Switch>
                </div>
              </div>

              <Divider />

              {/* 特殊功能 */}
              <div>
                <h3 className="mb-3 text-sm font-medium">特殊功能</h3>
                <div className="space-y-3">
                  <Switch
                    isSelected={autoCreateTrialAccount}
                    onValueChange={handleAutoCreateTrialAccountChange}
                  >
                    自动创建体验账户
                  </Switch>
                  <p className="text-xs text-gray-500">
                    启用后，用户使用邀请链接时会直接获得体验账户，无需手动注册
                  </p>
                </div>
              </div>

              <Button
                onPress={handleGenerateCustom}
                color="primary"
                variant="flat"
                size="lg"
                className="w-full"
                isLoading={isGenerating}
                startContent={<IconShield className="h-5 w-5" />}
              >
                生成自定义邀请
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* 生成结果 */}
        {generatedInvites.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <IconLink className="h-6 w-6 text-green-500" />
                <h2 className="text-xl font-semibold">
                  生成的邀请链接 ({generatedInvites.length} 个)
                </h2>
              </div>
              <Button
                size="sm"
                variant="light"
                onPress={() => setGeneratedInvites([])}
              >
                清空
              </Button>
            </CardHeader>
            <CardBody>
              <div className="max-h-96 space-y-4 overflow-y-auto">
                {generatedInvites.map((invite, index) => (
                  <div
                    key={index}
                    className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        邀请链接 #{index + 1}
                      </span>
                      <div className="flex gap-2">
                        <Chip
                          size="sm"
                          color={
                            Date.now() > invite.data.expiresAt
                              ? "danger"
                              : "success"
                          }
                          variant="flat"
                        >
                          {formatExpiryTime(invite.data.expiresAt)}
                        </Chip>
                      </div>
                    </div>

                    {/* 令牌信息 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          令牌:
                        </span>
                        <Button
                          size="sm"
                          variant="light"
                          color="primary"
                          onPress={() => copyToClipboard(invite.token, "令牌")}
                          startContent={<IconCopy className="h-4 w-4" />}
                        >
                          复制
                        </Button>
                      </div>
                      <code className="block w-full rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
                        {formatInviteDisplay(invite.token, 50)}
                      </code>
                    </div>

                    {/* URL 信息 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          完整链接:
                        </span>
                        <Button
                          size="sm"
                          variant="light"
                          color="primary"
                          onPress={() => copyToClipboard(invite.url, "链接")}
                          startContent={<IconCopy className="h-4 w-4" />}
                        >
                          复制
                        </Button>
                      </div>
                      <code className="block w-full rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
                        {invite.url}
                      </code>
                    </div>

                    {/* 配置详情 */}
                    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                      <div>
                        <span className="text-gray-500">IMAP:</span>{" "}
                        <span className="font-medium">
                          {invite.data.imapEmailCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">GRAPH:</span>{" "}
                        <span className="font-medium">
                          {invite.data.graphEmailCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">人数:</span>{" "}
                        <span className="font-medium">
                          {invite.data.maxRegistrations}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">批量邮箱:</span>{" "}
                        <span className="font-medium">
                          {invite.data.allowBatchAddEmails ? "是" : "否"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                      <div>
                        <span className="text-gray-500">自动体验账户:</span>{" "}
                        <span className="font-medium">
                          {invite.data.autoCreateTrialAccount ? "是" : "否"}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="text-gray-500">注册方式:</span>{" "}
                      <span className="font-medium">
                        {formatRegistrationMethods(
                          invite.data.registrationMethods,
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
