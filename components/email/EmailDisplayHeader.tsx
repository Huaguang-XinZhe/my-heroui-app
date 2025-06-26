"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { IconEnvelope, IconRefresh, IconTrash } from "@/components/icons/icons";
import { EmailSubscriptionButton } from "./EmailSubscriptionButton";
import { SubscriptionStatus } from "@/types/subscription";
import { siteConfig } from "@/config/site";

interface EmailDisplayHeaderProps {
  isLoading: boolean;
  lastFetchType: "inbox" | "junk" | null;
  onFetchEmails: (type: "inbox" | "junk") => void;
  // 订阅相关props
  subscriptionStatus: SubscriptionStatus;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
  showActions?: boolean;
}

export interface EmailDisplayHeaderRef {
  triggerCooldown: (type: "inbox" | "junk") => void;
}

export const EmailDisplayHeader = forwardRef<
  EmailDisplayHeaderRef,
  EmailDisplayHeaderProps
>(
  (
    {
      isLoading,
      lastFetchType,
      onFetchEmails,
      subscriptionStatus,
      onSubscribe,
      onUnsubscribe,
      showActions = true,
    },
    ref,
  ) => {
    const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

    // 暴露冷却触发函数给父组件
    useImperativeHandle(ref, () => ({
      triggerCooldown: (type: "inbox" | "junk") => {
        const cooldownTime =
          type === "inbox"
            ? siteConfig.cooldowns.inbox
            : siteConfig.cooldowns.junk;
        setCooldowns((prev) => ({
          ...prev,
          [type]: Date.now() + cooldownTime * 1000, // 转换为毫秒
        }));
      },
    }));

    // 管理冷却时间
    useEffect(() => {
      const intervals: NodeJS.Timeout[] = [];

      Object.entries(cooldowns).forEach(([type, endTime]) => {
        if (endTime > Date.now()) {
          const interval = setInterval(() => {
            if (Date.now() >= endTime) {
              setCooldowns((prev) => {
                const newCooldowns = { ...prev };
                delete newCooldowns[type];
                return newCooldowns;
              });
            }
          }, 1000);
          intervals.push(interval);
        }
      });

      return () => intervals.forEach(clearInterval);
    }, [cooldowns]);

    // 处理获取邮件，添加冷却逻辑
    const handleFetchEmails = (type: "inbox" | "junk") => {
      // 检查是否在冷却期
      const cooldownEnd = cooldowns[type];
      if (cooldownEnd && Date.now() < cooldownEnd) {
        return;
      }

      // 设置冷却期
      const cooldownTime =
        type === "inbox"
          ? siteConfig.cooldowns.inbox
          : siteConfig.cooldowns.junk;
      setCooldowns((prev) => ({
        ...prev,
        [type]: Date.now() + cooldownTime * 1000, // 转换为毫秒
      }));

      // 调用原始的获取邮件函数
      onFetchEmails(type);
    };

    // 获取冷却剩余时间
    const getCooldownTime = (type: "inbox" | "junk"): number => {
      const cooldownEnd = cooldowns[type];
      if (!cooldownEnd) return 0;
      return Math.max(0, Math.ceil((cooldownEnd - Date.now()) / 1000));
    };

    // 检查是否在冷却期
    const isInCooldown = (type: "inbox" | "junk"): boolean => {
      return getCooldownTime(type) > 0;
    };

    return (
      <h2 className="flex items-center justify-between border-b border-dark-border pb-3 text-lg font-semibold text-indigo-500">
        <div className="flex items-center">
          <IconEnvelope className="mr-2" />
          收件箱
        </div>

        {/* 操作按钮组 - 只在 showActions 为 true 时显示 */}
        {showActions && (
          <div className="flex items-center gap-2">
            {/* 订阅按钮 */}
            {/* <EmailSubscriptionButton
              status={subscriptionStatus}
              onSubscribe={onSubscribe}
              onUnsubscribe={onUnsubscribe}
              disabled={isLoading}
            /> */}

            <Tooltip
              content={
                isInCooldown("inbox")
                  ? `获取收件箱邮件冷却 ${siteConfig.cooldowns.inbox}s，请稍后再试`
                  : "获取最新一封收件箱邮件"
              }
              showArrow
            >
              <div className="inline-block">
                <Button
                  isIconOnly
                  variant="flat"
                  size="sm"
                  isLoading={isLoading && lastFetchType === "inbox"}
                  isDisabled={isInCooldown("inbox")}
                  onPress={() => handleFetchEmails("inbox")}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <IconRefresh className="text-sm" />
                </Button>
              </div>
            </Tooltip>
            <Tooltip
              content={
                isInCooldown("junk")
                  ? `获取垃圾邮件冷却 ${siteConfig.cooldowns.junk}s，请稍后再试`
                  : "获取最新一封垃圾邮件"
              }
              showArrow
            >
              <div className="inline-block">
                <Button
                  isIconOnly
                  variant="flat"
                  size="sm"
                  isLoading={isLoading && lastFetchType === "junk"}
                  isDisabled={isInCooldown("junk")}
                  onPress={() => handleFetchEmails("junk")}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <IconTrash className="text-sm" />
                </Button>
              </div>
            </Tooltip>
          </div>
        )}
      </h2>
    );
  },
);

EmailDisplayHeader.displayName = "EmailDisplayHeader";
