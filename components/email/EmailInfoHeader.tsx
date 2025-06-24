"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { IconEye } from "@/components/icons/icons";
import { Email } from "@/types/email";
import { getFaviconUrl, formatEmailDate } from "@/utils/utils";
import { EmailViewModal } from "@/components/modals/EmailViewModal";

interface EmailInfoHeaderProps {
  email: Email;
}

export function EmailInfoHeader({ email }: EmailInfoHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 格式化发件人信息
  const fromInfo = email.from.name
    ? `${email.from.address}（${email.from.name}）`
    : email.from.address;

  const handleViewEmail = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="border-b border-dark-border pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Image
              alt={email.subject}
              src={getFaviconUrl(email.from.address)}
              className="h-8 w-8 flex-shrink-0 rounded sm:h-10 sm:w-10"
              width={40}
            />
            <div className="min-w-0 flex-1">
              <h2
                title={email.subject}
                className="max-w-[370px] truncate text-lg font-bold text-gray-100 sm:text-xl"
              >
                {email.subject}
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-400 sm:mt-1">
                <span title={fromInfo} className="max-w-[230px] truncate">
                  {fromInfo}
                </span>
                <span>·</span>
                <span className="shrink-0">{formatEmailDate(email.date)}</span>
              </div>
            </div>
          </div>

          {/* View Raw 按钮 */}
          {/* 桌面端 */}
          <Button
            onPress={handleViewEmail}
            variant="flat"
            size="sm"
            startContent={<IconEye className="text-sm" />}
            className="hidden px-3 py-1.5 text-sm sm:flex"
          >
            View Raw
          </Button>
          {/* 移动端 */}
          <Button
            onPress={handleViewEmail}
            isIconOnly
            variant="flat"
            size="sm"
            radius="md"
            startContent={<IconEye className="text-xs" />}
            className="sm:hidden"
          />
        </div>
      </div>

      {/* 邮件查看弹窗 */}
      <EmailViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        email={email}
      />
    </>
  );
}
