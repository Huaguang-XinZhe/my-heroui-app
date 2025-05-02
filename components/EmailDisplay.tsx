"use client";

import { IconEnvelope, IconClock, IconEye } from "./icons/icons";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import { Snippet } from "@heroui/snippet";
import { Image } from "@heroui/image";
import Link from "next/link";

interface EmailDisplayProps {
  id: string;
  sender: string;
  icon: string;
  topic: string;
  date: string;
  code: string;
}

export function EmailDisplay({
  id,
  sender,
  icon,
  topic,
  date,
  code,
}: EmailDisplayProps) {
  return (
    <Card className="flex flex-1 flex-col overflow-hidden border border-dark-border bg-dark-card p-4 sm:p-6">
      {/* 头部区域 */}
      <h2 className="flex items-center border-b border-dark-border pb-3 text-lg font-semibold text-indigo-500">
        <IconEnvelope className="mr-2" />
        收件箱
      </h2>

      {/* 内容区域 */}
      <div className="mt-2 flex flex-1 flex-col px-2 pt-3 sm:mt-0 sm:px-6 sm:pt-6">
        {/* 服务标识和查看原邮件按钮 */}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Image alt={topic} src={icon} className="h-8 w-8 sm:h-10 sm:w-10" />
            <div>
              <h2 className="text-lg font-bold text-gray-100 sm:text-xl">
                {topic}
              </h2>
              <div className="text-xs text-gray-400 sm:mt-1">
                {sender} · {date}
              </div>
            </div>
          </div>
          {/* 桌面端 */}
          {/* 有点奇怪，这里把 Link 放到 Button 的外边就会导航到新页面，拦截路由不会起作用❗ */}
          <Button
            as={Link}
            href={`/emails/${id}`}
            scroll={false}
            prefetch={false}
            variant="flat"
            size="sm"
            startContent={<IconEye className="text-sm" />}
            className="hidden px-3 py-1.5 text-sm sm:flex"
          >
            View Raw
          </Button>
          {/* 移动端 */}
          <Button
            as={Link}
            href={`/emails/${id}`}
            scroll={false}
            prefetch={false}
            isIconOnly
            variant="flat"
            size="sm"
            radius="md"
            startContent={<IconEye className="text-xs" />}
            className="sm:hidden"
          />
        </div>

        {/* 验证码显示 */}
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex flex-col justify-center">
            <Snippet
              hideSymbol
              variant="flat"
              size="lg"
              // symbol={false} // 这样也能隐藏 symbol❗
              className="bg-dark-hover py-4 pl-4 pr-3 font-mono text-3xl tracking-wider sm:py-6 sm:pl-6 sm:pr-4 sm:text-5xl"
              tooltipProps={{
                content: "复制验证码",
                showArrow: true,
                offset: 5,
              }}
            >
              {code}
            </Snippet>

            {/* 验证码有效期 */}
            <div className="mt-3 flex items-center justify-center text-xs text-gray-400 sm:mt-4 sm:text-sm">
              <IconClock className="mr-1.5 text-indigo-400 sm:mr-2" />
              10 分钟内有效
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
