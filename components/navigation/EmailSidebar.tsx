"use client";

import { useState, useEffect, useCallback } from "react";
import { AddEmailModal } from "@/components/modals/AddEmailModal";
import { EmailItem } from "@/components/email/EmailItem";
import { IconAt, IconPlus } from "@/components/icons/icons";
import { Button } from "@heroui/button";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { SearchInput } from "@/components/ui/SearchInput";
import { getCachedEmails } from "@/cache/emailCache";
import { CachedEmailInfo } from "@/types/email";
import { siteConfig } from "@/config/site";

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
  const [switchCooldownEnd, setSwitchCooldownEnd] = useState<number>(0);

  // 组件挂载时加载邮箱数据
  useEffect(() => {
    const cachedEmails = getCachedEmails();
    setEmailAccounts(cachedEmails);
  }, []);

  // 管理邮箱切换冷却时间
  useEffect(() => {
    if (switchCooldownEnd > Date.now()) {
      const interval = setInterval(() => {
        if (Date.now() >= switchCooldownEnd) {
          setSwitchCooldownEnd(0);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [switchCooldownEnd]);

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

  // 获取邮箱切换冷却剩余时间
  const getSwitchCooldownTime = (): number => {
    if (!switchCooldownEnd) return 0;
    return Math.max(0, Math.ceil((switchCooldownEnd - Date.now()) / 1000));
  };

  // 检查是否在邮箱切换冷却期
  const isInSwitchCooldown = (): boolean => {
    return getSwitchCooldownTime() > 0;
  };

  const handleSwitchAccount = (email: string) => {
    // 如果是同一个邮箱，不需要处理
    if (email === selectedEmail) {
      return;
    }

    if (onEmailSelect) {
      onEmailSelect(email);

      // 设置邮箱切换冷却
      setSwitchCooldownEnd(
        Date.now() + siteConfig.cooldowns.emailSwitch * 1000,
      );

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
  const filteredAccounts = emailAccounts.filter((account) =>
    account.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <aside className="hidden overflow-hidden rounded-xl border border-dark-border bg-dark-card p-4 shadow-lg md:flex md:w-80 md:flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center text-lg font-semibold text-indigo-500">
          <IconAt className="mr-2 mt-0.5" />
          我的邮箱
        </h2>
        <span className="text-xs text-gray-500">
          {filteredAccounts.length} 个
        </span>
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
          {filteredAccounts.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-gray-400">
              <p className="text-sm">暂无邮箱账户</p>
              <p className="mt-1 text-xs text-gray-500">点击下方按钮添加邮箱</p>
            </div>
          ) : (
            filteredAccounts.map((account) => {
              const isSelected = account.email === selectedEmail;
              const isDisabled = !isSelected && isInSwitchCooldown();
              const tooltipContent = isDisabled
                ? `邮箱切换冷却 ${siteConfig.cooldowns.emailSwitch}s，请稍后再试`
                : undefined;

              return (
                <EmailItem
                  key={account.email}
                  account={account}
                  isSelected={isSelected}
                  onSelect={handleSwitchAccount}
                  displayEmail={account.email}
                  disabled={isDisabled}
                  tooltipContent={tooltipContent}
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
