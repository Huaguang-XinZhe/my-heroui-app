"use client";

import { useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { AddEmailModal } from "./AddEmailModal";
import { IconAt, IconPlus } from "./icons/icons";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { SearchInput } from "./SearchInput";

interface EmailAccount {
  id: string;
  email: string;
}

const emailAccounts: EmailAccount[] = [
  {
    id: "1",
    email: "example@gmail.com",
  },
  {
    id: "2",
    email: "user@outlook.com",
  },
  {
    id: "3",
    email: "longemailaddress123456@qq.com",
  },
  {
    id: "4",
    email: "developer@github.com",
  },
  {
    id: "5",
    email: "contact@company.org",
  },
  {
    id: "6",
    email: "support@heroui.dev",
  },
  {
    id: "7",
    email: "newsletter@medium.com",
  },
  {
    id: "8",
    email: "notifications@twitter.com",
  },
  {
    id: "9",
    email: "info@linkedin.com",
  },
  {
    id: "10",
    email: "noreply@amazon.com",
  },
  {
    id: "11",
    email: "admin@heroicons.com",
  },
];

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

export function EmailSidebar() {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeAccountId, setActiveAccountId] = useState<string>("1");

  const handleSwitchAccount = (id: string) => {
    setActiveAccountId(id);
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
    <aside className="hidden overflow-hidden rounded-xl border border-dark-border bg-dark-card p-4 shadow-lg md:flex md:w-72 md:flex-col">
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
        <div className="space-y-2 p-2">
          {processedAccounts.map((account) => (
            <Card
              isPressable
              isDisabled={account.id === activeAccountId}
              onPress={() => handleSwitchAccount(account.id)}
              key={account.id}
              shadow="none"
              radius="lg"
              className="w-full bg-transparent hover:bg-indigo-300/10"
            >
              <CardBody className="flex flex-row items-center justify-between py-2 pl-4 pr-3">
                <div className="min-w-0 flex-1">
                  <h3
                    className="truncate text-sm font-medium text-gray-200"
                    title={account.email}
                  >
                    {account.displayEmail}
                  </h3>
                </div>
                <div className="ml-2 shrink-0">
                  {account.id === activeAccountId && (
                    <StatusBadge text="Current" color="success" size="md" />
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
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
      <AddEmailModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </aside>
  );
}
