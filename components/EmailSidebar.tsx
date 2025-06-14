"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ProtocolBadge } from "./ProtocolBadge";
import { AddEmailModal } from "./AddEmailModal";
import { IconAt, IconPlus } from "./icons/icons";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { SearchInput } from "./SearchInput";
import { getCachedEmails } from "@/cache/emailCache";
import { CachedEmailInfo } from "@/types/email";
import { formatFetchTime } from "@/utils/utils";

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
  onRefreshList?: (refreshFn: () => void) => void;
  onTriggerCooldown?: (type: "inbox" | "junk") => void;
}

export function EmailSidebar({
  onEmailSelect,
  selectedEmail,
  onRefreshList,
  onTriggerCooldown,
}: EmailSidebarProps) {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [emailAccounts, setEmailAccounts] = useState<CachedEmailInfo[]>([]);
  const selectedEmailRef = useRef<HTMLDivElement>(null);

  // 组件挂载时加载邮箱数据
  useEffect(() => {
    const cachedEmails = getCachedEmails();
    setEmailAccounts(cachedEmails);
  }, []);

  // 刷新邮箱列表的函数
  const refreshEmailList = useCallback(() => {
    const updatedEmails = getCachedEmails();
    setEmailAccounts(updatedEmails);
  }, []);

  // 暴露刷新函数给父组件
  useEffect(() => {
    if (onRefreshList) {
      onRefreshList(refreshEmailList);
    }
  }, [refreshEmailList, onRefreshList]);

  // 滚动到选中的邮箱
  useEffect(() => {
    if (selectedEmail && selectedEmailRef.current) {
      selectedEmailRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedEmail]);

  const handleSwitchAccount = (email: string) => {
    if (onEmailSelect) {
      onEmailSelect(email);
      // 点击邮箱时立即触发收件箱冷却
      if (onTriggerCooldown) {
        onTriggerCooldown("inbox");
      }
    }
  };

  const handleAddEmailSuccess = (emails: CachedEmailInfo[]) => {
    // 添加邮箱成功后刷新邮箱列表，从缓存中重新读取所有邮箱
    refreshEmailList();
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

  // 格式化时间显示
  const getTimeDisplay = (timestamp?: number) => {
    if (!timestamp) return null;

    const now = new Date();
    const fetchTime = new Date(timestamp);

    // 检查是否是今天
    const isToday =
      now.getFullYear() === fetchTime.getFullYear() &&
      now.getMonth() === fetchTime.getMonth() &&
      now.getDate() === fetchTime.getDate();

    if (isToday) {
      // 今天：只显示时间
      return {
        primary: formatFetchTime(timestamp),
        secondary: null,
      };
    }

    // 计算是否在本周内
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    if (fetchTime >= startOfWeek && fetchTime <= endOfWeek) {
      // 本周内：显示周几
      return {
        primary: formatFetchTime(timestamp),
        secondary: null,
      };
    }

    // 其他：显示日期，时间放在下方
    return {
      primary: formatFetchTime(timestamp),
      secondary: fetchTime.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  };

  return (
    <aside className="hidden overflow-hidden rounded-xl border border-dark-border bg-dark-card p-4 shadow-lg md:flex md:w-80 md:flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center text-lg font-semibold text-indigo-500">
          <IconAt className="mr-2 mt-0.5" />
          我的邮箱
        </h2>
        <div className="flex items-center rounded-full bg-indigo-500/20 px-2 py-1">
          <span className="text-sm font-medium text-indigo-400">
            {emailAccounts.length}
          </span>
        </div>
      </div>

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
            processedAccounts.map((account) => {
              const timeDisplay = getTimeDisplay(account.lastFetchTime);
              const isSelected = account.email === selectedEmail;

              return (
                <Card
                  ref={isSelected ? selectedEmailRef : null}
                  isPressable
                  isDisabled={isSelected}
                  onPress={() => handleSwitchAccount(account.email)}
                  key={account.email}
                  shadow="none"
                  radius="lg"
                  className={`w-full bg-transparent hover:bg-indigo-300/10 ${
                    isSelected
                      ? "outline outline-2 outline-blue-500 ring-1"
                      : ""
                  }`}
                >
                  <CardBody className="flex flex-col py-2 pl-4 pr-4">
                    {/* 第一行：协议标签、邮箱地址和时间 */}
                    <div className="flex flex-row items-center justify-between">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        {/* 协议标签 */}
                        <ProtocolBadge protocolType={account.protocolType} />

                        {/* 邮箱地址 */}
                        <h3
                          className="flex-1 truncate text-sm font-medium text-gray-200"
                          title={account.email}
                        >
                          {account.displayEmail}
                        </h3>
                      </div>

                      {/* 获取时间 */}
                      {timeDisplay && (
                        <div className="ml-2 shrink-0 text-right">
                          <span
                            className="text-xs text-gray-500"
                            title={`上次获取：${new Date(account.lastFetchTime!).toLocaleString("zh-CN")}`}
                          >
                            {timeDisplay.primary}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 第二行：时间详情（仅在需要时显示） */}
                    {timeDisplay?.secondary && (
                      <div className="mt-1 flex justify-end">
                        <span className="text-xs text-gray-500">
                          {timeDisplay.secondary}
                        </span>
                      </div>
                    )}
                  </CardBody>
                </Card>
              );
            })
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
