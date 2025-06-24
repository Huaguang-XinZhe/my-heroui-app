"use client";

import { useRef, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";
import { ProtocolBadge } from "@/components/ui/ProtocolBadge";
import { CachedEmailInfo } from "@/types/email";
import { getTimeDisplay } from "@/utils/utils";

interface EmailItemProps {
  account: CachedEmailInfo;
  isSelected: boolean;
  onSelect: (email: string) => void;
  displayEmail: string;
}

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

// 检查邮箱是否被截断
function isEmailTruncated(email: string): boolean {
  const parsed = parseEmail(email);
  if (!parsed) return false;

  return parsed.username.length > 10;
}

export function EmailItem({ account, isSelected, onSelect }: EmailItemProps) {
  const selectedEmailRef = useRef<HTMLDivElement>(null);

  // 滚动到选中的邮箱
  useEffect(() => {
    if (isSelected && selectedEmailRef.current) {
      selectedEmailRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isSelected]);

  const timeDisplay = getTimeDisplay(account.lastFetchTime);
  const hasTime = timeDisplay !== null;

  return (
    <Card
      ref={isSelected ? selectedEmailRef : null}
      isPressable
      isDisabled={isSelected}
      onPress={() => onSelect(account.email)}
      shadow="none"
      radius="lg"
      className={`bg-transparent hover:bg-indigo-300/10 ${
        isSelected ? "outline outline-2 outline-blue-500 ring-1" : ""
      } ${hasTime ? "w-full" : "w-full max-w-full"}`}
    >
      <CardBody className="flex flex-col py-2 pl-4 pr-4">
        {/* 主行：协议标签、邮箱地址和时间（如果不在下方显示） */}
        <div className="flex min-w-0 flex-row items-center justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {/* 协议标签 */}
            <ProtocolBadge protocolType={account.protocolType} />

            {/* 邮箱地址 - 始终允许截断以防止溢出 */}
            <h3 className="min-w-0 flex-1 truncate text-sm font-medium text-gray-200">
              {account.email}
            </h3>
          </div>

          {/* 获取时间（仅在不需要显示在下方时显示） */}
          {timeDisplay && !timeDisplay.showBelow && (
            <div className="ml-2 shrink-0">
              <span className="text-xs text-gray-500">
                {timeDisplay.display}
              </span>
            </div>
          )}
        </div>

        {/* 第二行：长日期或其他需要在下方显示的时间 */}
        {timeDisplay?.showBelow && (
          <div className="mt-1 flex justify-start pl-6">
            <span className="text-xs text-gray-500">{timeDisplay.display}</span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
