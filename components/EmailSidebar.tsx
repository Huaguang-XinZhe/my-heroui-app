"use client";

import { useState, useEffect, useCallback } from "react";
import { AddEmailModal } from "./AddEmailModal";
import { EmailItem } from "./EmailItem";
import { IconAt, IconPlus } from "./icons/icons";
import { Button } from "@heroui/button";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { SearchInput } from "./SearchInput";
import { getCachedEmails } from "@/cache/emailCache";
import { CachedEmailInfo } from "@/types/email";
import { isEmailTruncated, truncateEmail } from "@/utils/utils";

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

  // 过滤邮箱账户
  const processedAccounts = emailAccounts.filter((account) =>
    account.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <aside className="hidden overflow-hidden rounded-xl border border-dark-border bg-dark-card p-4 shadow-lg md:flex md:w-80 md:flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center text-lg font-semibold text-indigo-500">
          <IconAt className="mr-2 mt-0.5" />
          我的邮箱
        </h2>
        <span className="text-xs text-gray-500">{emailAccounts.length} 个</span>
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
              const isSelected = account.email === selectedEmail;

              return (
                <EmailItem
                  key={account.email}
                  account={account}
                  isSelected={isSelected}
                  onSelect={handleSwitchAccount}
                  displayEmail={account.email}
                />
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
