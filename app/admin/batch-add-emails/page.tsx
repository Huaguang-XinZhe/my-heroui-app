"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { useSession } from "next-auth/react";
import { EmailInputSection } from "@/components/EmailInputSection";
import { FailureDetailsModal } from "@/components/FailureDetailsModal";
import { ProtocolType } from "@/types/email";
import { parseEmailInput } from "@/utils/emailParser";
import {
  showSuccessToast,
  showWarningToast,
  showErrorToast,
} from "@/utils/toast";
import {
  IconShield,
  IconDatabase,
  IconCheck,
  IconRefresh,
} from "@/components/icons/icons";

interface AdminBatchAddResponse {
  fromOthers: Array<{ email: string; isBanned: boolean }>;
  errors: Array<{ email: string; isBanned: boolean; error: string }>;
  successes: Array<{
    email: string;
    refreshToken: string;
    protocolType: ProtocolType;
  }>;
}

export default function AdminBatchAddEmailsPage() {
  const { data: session, status } = useSession();

  const [emailInput, setEmailInput] = useState("");
  const [protocolType, setProtocolType] = useState<ProtocolType>("UNKNOWN");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFailureDetails, setShowFailureDetails] = useState(false);
  const [failureData, setFailureData] = useState<{
    fromOthers: Array<{ email: string; isBanned: boolean }>;
    errors: Array<{ email: string; isBanned: boolean; error: string }>;
  }>({ fromOthers: [], errors: [] });

  // 空函数，EmailInputSection 需要但我们不使用
  const toggleFormatGuide = () => {};

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

  const handleSubmit = async () => {
    if (!emailInput.trim()) {
      showWarningToast("邮箱信息不能为空！", "请在文本框中输入邮箱数据");
      return;
    }

    // 检查协议类型
    if (protocolType === "UNKNOWN") {
      showWarningToast(
        "请选择协议类型",
        "批量添加邮箱时必须选择确定的协议类型（IMAP 或 GRAPH）",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // 解析输入的邮箱数据
      const allEmails = parseEmailInput(emailInput, protocolType);

      if (allEmails.length === 0) {
        showWarningToast(
          "格式错误",
          "未能解析出有效的邮箱信息，请检查输入格式",
        );
        return;
      }

      console.log(`管理员批量添加: ${allEmails.length} 个邮箱`);

      // 发送批量添加请求到管理员 API
      const response = await fetch("/api/admin/mail/batch-add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mailInfos: allEmails,
          refreshNeeded: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result: AdminBatchAddResponse = await response.json();
      const { fromOthers, errors, successes } = result;

      // 处理结果显示
      const failureCount = fromOthers.length + errors.length;

      const viewButton = (
        <Button
          size="sm"
          variant="flat"
          onPress={() => {
            setFailureData({ fromOthers, errors });
            setShowFailureDetails(true);
          }}
        >
          查看详情
        </Button>
      );

      if (failureCount === 0) {
        // 全部成功
        showSuccessToast(`全部成功`, `${successes.length} 个邮箱添加成功`);
      } else if (successes.length > 0) {
        // 部分成功
        showWarningToast(
          `${failureCount} 个失败，${successes.length} 个成功`,
          undefined,
          viewButton,
        );
      } else {
        // 全部失败
        showErrorToast(`全部失败`, undefined, viewButton);
      }

      // 清空输入
      setEmailInput("");
      setProtocolType("UNKNOWN");
    } catch (error) {
      showErrorToast(
        "添加失败",
        error instanceof Error ? error.message : "未知错误",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = async (unbannedEmails: string[]) => {
    // 从原始输入中找到对应的邮箱信息行
    const originalLines = emailInput.split("\n");
    const retryLines = originalLines.filter((line) => {
      const email = line.split("----")[0]?.trim();
      return email && unbannedEmails.includes(email);
    });

    setEmailInput(retryLines.join("\n"));
    setShowFailureDetails(false);
  };

  return (
    <>
      <div className="h-screen overflow-y-auto bg-background">
        <div className="container mx-auto max-w-4xl space-y-6 p-6">
          {/* 页面标题 */}
          <div className="text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <IconShield className="h-10 w-10 text-indigo-500" />
              <h1 className="text-3xl font-bold">管理员批量添加邮箱</h1>
            </div>
            <p className="text-gray-400">
              添加邮箱到系统邮箱池，未分配给特定用户
            </p>
          </div>

          {/* 管理员信息 */}
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20">
                    <IconShield className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="font-semibold">{session.user.name}</p>
                    <p className="text-sm text-gray-400">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <Chip color="success" variant="flat" size="sm">
                  管理员权限
                </Chip>
              </div>
            </CardBody>
          </Card>

          {/* 邮箱输入区域 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <IconDatabase className="h-6 w-6 text-indigo-500" />
                <h2 className="text-xl font-semibold">批量添加邮箱</h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-6">
              <EmailInputSection
                emailInput={emailInput}
                setEmailInput={setEmailInput}
                protocolType={protocolType}
                setProtocolType={setProtocolType}
                showFormatGuide={false}
                toggleFormatGuide={toggleFormatGuide}
                isSubmitting={isSubmitting}
                height="h-48"
                placeholder="输入邮箱数据，每行一条，将添加到系统邮箱池中（未分配给特定用户）"
                showProtocolSelector={true}
                showFormatGuideButton={false}
              />

              <div className="flex gap-3">
                <Button
                  onPress={handleSubmit}
                  color="primary"
                  size="lg"
                  startContent={isSubmitting ? null : <IconCheck />}
                  isLoading={isSubmitting}
                  isDisabled={isSubmitting || !emailInput.trim()}
                  className="flex-1"
                >
                  {isSubmitting ? "添加中..." : "批量添加到系统"}
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* 功能说明 */}
          <Card>
            <CardBody>
              <h3 className="mb-3 font-semibold">功能说明</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• 此功能仅供管理员使用，添加的邮箱将进入系统邮箱池</li>
                <li>• 添加的邮箱不会分配给特定用户，处于未分配状态</li>
                <li>• 系统会自动检查邮箱是否已存在，避免重复添加</li>
                <li>• 支持拖拽文件导入，格式与普通添加邮箱相同</li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* 失败详情弹窗 */}
      <FailureDetailsModal
        isOpen={showFailureDetails}
        onClose={() => setShowFailureDetails(false)}
        fromOthers={failureData.fromOthers}
        errors={failureData.errors}
        onRetry={handleRetry}
      />
    </>
  );
}
