"use client";

import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { StatusBadge } from "./StatusBadge";
import { EmailSnippet } from "./EmailSnippet";
import { IconStop, IconRefresh } from "./icons/icons";

interface EmailStatusDisplayProps {
  isListening: boolean;
  email: string;
  terminationReason?: string | null;
  onStopListening: () => void;
  onStartListening: () => void;
}

export function EmailStatusDisplay({
  isListening,
  email,
  terminationReason,
  onStopListening,
  onStartListening,
}: EmailStatusDisplayProps) {
  // 根据状态确定要显示的内容
  const statusConfig = isListening
    ? {
        badge: {
          text: "当前监听",
          color: "success" as const,
          hasTooltip: false,
        },
        button: {
          action: onStopListening,
          text: "停止",
          color: "danger" as const,
          icon: <IconStop />,
        },
      }
    : {
        badge: {
          text: "已停止",
          color: "warning" as const,
          hasTooltip: true,
        },
        button: {
          action: onStartListening,
          text: "重新监听",
          color: "success" as const,
          icon: <IconRefresh />,
        },
      };

  return (
    <div className="sm:flex sm:items-center sm:justify-between">
      <div className="flex items-center overflow-hidden">
        {statusConfig.badge.hasTooltip ? (
          <Tooltip
            content={terminationReason}
            showArrow={true}
            color="warning"
            placement="right"
            classNames={{
              base: "before:bg-amber-950",
              content: "text-amber-300 bg-amber-950",
            }}
          >
            <StatusBadge
              as="button"
              text={statusConfig.badge.text}
              color={statusConfig.badge.color}
              size="sm"
            />
          </Tooltip>
        ) : (
          <StatusBadge
            text={statusConfig.badge.text}
            color={statusConfig.badge.color}
            size="sm"
          />
        )}
        <EmailSnippet email={email} className="min-w-0 flex-grow" />
      </div>
      
      {/* 桌面端按钮 */}
      <Button
        onPress={statusConfig.button.action}
        size="sm"
        variant="light"
        className="hidden sm:flex sm:items-center"
        color={statusConfig.button.color}
        startContent={statusConfig.button.icon}
      >
        {statusConfig.button.text}
      </Button>
      
      {/* 移动端按钮 */}
      <Button
        onPress={statusConfig.button.action}
        size="sm"
        variant="flat"
        className="mb-1 mt-2 flex w-full sm:hidden"
        color={statusConfig.button.color}
        startContent={statusConfig.button.icon}
      >
        {statusConfig.button.text}
      </Button>
    </div>
  );
}
