"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@heroui/card";
import { Snippet } from "@heroui/snippet";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { IconAt, IconShield, IconExternalLink } from "./icons/icons";
import { getCachedEmails } from "@/cache/emailCache";
import { CachedEmailInfo } from "@/types/email";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

interface CurrentEmailInfoProps {
  selectedEmail?: string;
  onRefreshInfo?: (refreshFn: () => void) => void;
}

// 获取邮箱登录链接
const getEmailLoginUrl = (email: string, serviceProvider?: string): string => {
  const domain = email.split("@")[1]?.toLowerCase();

  // 根据服务提供商或域名生成登录链接
  if (
    serviceProvider === "MICROSOFT" ||
    domain?.includes("outlook") ||
    domain?.includes("hotmail") ||
    domain?.includes("live")
  ) {
    return "https://login.microsoftonline.com";
  } else if (domain?.includes("gmail")) {
    return "https://mail.google.com";
  } else if (domain?.includes("yahoo")) {
    return "https://mail.yahoo.com";
  } else if (domain?.includes("qq")) {
    return "https://mail.qq.com";
  } else if (domain?.includes("163")) {
    return "https://mail.163.com";
  } else if (domain?.includes("126")) {
    return "https://mail.126.com";
  } else {
    // 默认尝试构建通用链接
    return `https://mail.${domain}`;
  }
};

// 模糊显示密码
const maskPassword = (password: string): string => {
  if (password.length <= 2) return "*".repeat(password.length);
  if (password.length <= 4)
    return (
      password[0] +
      "*".repeat(password.length - 2) +
      password[password.length - 1]
    );
  return (
    password.substring(0, 2) +
    "*".repeat(password.length - 4) +
    password.substring(password.length - 2)
  );
};

export function CurrentEmailInfo({
  selectedEmail,
  onRefreshInfo,
}: CurrentEmailInfoProps) {
  const [emailInfo, setEmailInfo] = useState<CachedEmailInfo | null>(null);

  // 获取当前选中邮箱的详细信息
  const refreshEmailInfo = useCallback(() => {
    if (selectedEmail) {
      const cachedEmails = getCachedEmails();
      const info =
        cachedEmails.find((email) => email.email === selectedEmail) || null;
      setEmailInfo(info);
    }
  }, [selectedEmail]);

  // 初始化邮箱信息
  useEffect(() => {
    refreshEmailInfo();
  }, [refreshEmailInfo]);

  // 暴露刷新函数给父组件
  useEffect(() => {
    if (onRefreshInfo) {
      onRefreshInfo(refreshEmailInfo);
    }
  }, [refreshEmailInfo, onRefreshInfo]);

  // 如果没有选中邮箱，不渲染组件
  if (!selectedEmail) {
    return null;
  }

  // 如果找不到邮箱信息，显示错误信息
  if (!emailInfo) {
    return (
      <Card className="flex items-center justify-center border border-dark-border bg-dark-card p-4">
        <div className="text-center text-red-400">
          <IconShield className="mx-auto mb-2 h-8 w-8" />
          <p className="text-sm">无法找到邮箱信息</p>
          <p className="mt-1 text-xs text-gray-500">{selectedEmail}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border border-dark-border bg-dark-card p-4">
      {/* 标题和网页登录 */}
      <div className="mb-1 flex items-center justify-between">
        <h2 className="flex items-center text-lg font-semibold text-indigo-500">
          <IconAt className="mr-2" />
          邮箱信息
        </h2>
        <Tooltip content="复制邮箱并打开网页登录" showArrow>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="primary"
            onPress={() => {
              // 复制邮箱到剪贴板
              navigator.clipboard.writeText(emailInfo.email).catch(() => {
                showErrorToast("复制失败", "请手动复制邮箱地址");
              });

              // 打开邮箱登录页面
              const loginUrl = getEmailLoginUrl(
                emailInfo.email,
                emailInfo.serviceProvider,
              );
              window.open(loginUrl, "_blank");
            }}
          >
            <IconExternalLink className="h-3 w-3" />
          </Button>
        </Tooltip>
      </div>

      {/* 第一行：邮箱地址和密码 */}
      <div className="flex items-center space-x-10 p-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">邮箱</span>
          <Snippet
            symbol="📮"
            variant="flat"
            color="default"
            size="sm"
            classNames={{
              base: "bg-dark-card border border-dark-border",
              pre: "text-white text-sm",
            }}
            onCopy={() => {
              showSuccessToast("邮箱复制成功", "邮箱地址已复制到剪贴板");
            }}
          >
            {emailInfo.email}
          </Snippet>
        </div>
        {emailInfo.password && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">密码</span>
            <Snippet
              symbol="🔐"
              variant="flat"
              color="default"
              size="sm"
              classNames={{
                base: "bg-dark-card border border-dark-border",
                pre: "text-white text-sm",
                copyButton: "data-[pressed=true]:scale-95",
              }}
              codeString={emailInfo.password}
              onCopy={() => {
                showSuccessToast("密码复制成功", "完整密码已复制到剪贴板");
              }}
            >
              {maskPassword(emailInfo.password)}
            </Snippet>
          </div>
        )}
      </div>
    </Card>
  );
}
