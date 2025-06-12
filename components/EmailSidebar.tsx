"use client";

import { useState, useEffect } from "react";
import { ProtocolBadge } from "./ProtocolBadge";
import { AddEmailModal } from "./AddEmailModal";
import { IconAt, IconPlus } from "./icons/icons";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { SearchInput } from "./SearchInput";
import { getCachedEmails } from "@/utils/emailCache";
import { CachedEmailInfo } from "@/types/email";

// 解析邮箱地址，返回用户名和域名
function parseEmail(
  email: string,
): { username: string; domain: string } | null {
  const parts = email.split("@");
  if (parts.length !== 2) return null;

  return {
    username: parts[0],
    domain: parts[1],
  };
}

// 辅助函数：截断邮箱地址，保留完整后缀
function truncateEmail(email: string): string {
  const parsed = parseEmail(email);
  if (!parsed) return email;

  const { username, domain } = parsed;
  if (username.length <= 10) return email;

  return `${username.substring(0, 7)}...@${domain}`;
}

// 检查邮箱是否被截断
function isEmailTruncated(email: string): boolean {
  const parsed = parseEmail(email);
  if (!parsed) return false;

  return parsed.username.length > 10;
}

interface EmailSidebarProps {
  onEmailSelect?: (email: string) => void;
  selectedEmail?: string;
}

export function EmailSidebar({
  onEmailSelect,
  selectedEmail,
}: EmailSidebarProps) {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [emailAccounts, setEmailAccounts] = useState<CachedEmailInfo[]>([]);

  // 组件挂载时加载邮箱数据
  useEffect(() => {
    const cachedEmails = getCachedEmails();
    setEmailAccounts(cachedEmails);
  }, []);

  const handleSwitchAccount = (email: string) => {
    if (onEmailSelect) {
      onEmailSelect(email);
    }
  };

  const handleAddEmailSuccess = (emails: CachedEmailInfo[]) => {
    // 添加邮箱成功后刷新邮箱列表
    setEmailAccounts(emails);
  };

  // 过滤邮箱账户并预处理显示数据
  const processedAccounts = emailAccounts
    .filter((account) =>
      account.email.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .map((account) => {
      // 检查是否需要截断
      const needsTruncate = isEmailTruncated(account.email);
      return {
        ...account,
        displayEmail: needsTruncate
          ? truncateEmail(account.email)
          : account.email,
      };
    });

  return (
    <aside className="hidden overflow-hidden rounded-xl border border-dark-border bg-dark-card p-4 shadow-lg md:flex md:flex-col">
      <h2 className="mb-4 flex items-center text-lg font-semibold text-indigo-500">
        <IconAt className="mr-2 mt-0.5" />
        我的邮箱
      </h2>

      {/* 搜索框 */}
      <SearchInput
        placeholder="搜索邮箱..."
        value={searchQuery}
        onChange={setSearchQuery}
        onClear={() => setSearchQuery("")}
      />

      {/* 邮箱列表 */}
      <ScrollShadow hideScrollBar className="flex-1">
        <div className="h-full space-y-2 p-2">
          {processedAccounts.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-gray-400">
              <p className="text-sm">暂无邮箱账户</p>
              <p className="mt-1 text-xs text-gray-500">点击下方按钮添加邮箱</p>
            </div>
          ) : (
            processedAccounts.map((account) => (
              <Card
                isPressable
                isDisabled={account.email === selectedEmail}
                onPress={() => handleSwitchAccount(account.email)}
                key={account.email}
                shadow="none"
                radius="lg"
                className={`w-full bg-transparent hover:bg-indigo-300/10 ${
                  account.email === selectedEmail
                    ? "outline outline-2 outline-blue-500 ring-1"
                    : ""
                }`}
              >
                <CardBody className="flex flex-row items-center justify-between py-2 pl-4 pr-4">
                  {/* 邮箱地址 */}
                  <div className="min-w-0 flex-1">
                    <h3
                      className="truncate text-sm font-medium text-gray-200"
                      title={account.email}
                    >
                      {account.displayEmail}
                    </h3>
                  </div>

                  {/* 协议标签 */}
                  <div className="ml-3 shrink-0">
                    <ProtocolBadge protocolType={account.protocolType} />
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </ScrollShadow>

      {/* 添加新邮箱按钮 */}
      <Button
        onPress={() => setShowModal(true)}
        color="secondary"
        className="mt-4 w-full"
        startContent={<IconPlus className="mr-1" />}
      >
        添加新邮箱
      </Button>

      {/* 添加邮箱模态框 */}
      <AddEmailModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleAddEmailSuccess}
      />
    </aside>
  );
}
