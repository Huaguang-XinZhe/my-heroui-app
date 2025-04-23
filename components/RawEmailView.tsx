"use client";

import { Button } from "@heroui/button";
import { useState } from "react";
import { IconCode } from "./icons/icons";

interface RawEmailViewProps {
  topic: string;
  sender: string;
  date: string;
  html: string;
}

export function RawEmailView({ topic, sender, date, html }: RawEmailViewProps) {
  // 添加状态控制是否显示源代码
  const [showSourceCode, setShowSourceCode] = useState(false);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col gap-1">
        <div className="text-xl font-bold">原始邮件内容</div>
        <div className="text-sm text-gray-400">
          {topic} - {sender} - {date}
        </div>
      </div>

      {html ? (
        <div className="relative flex flex-1 gap-4">
          {/* 渲染视图 - 始终显示 */}
          <div
            className={`${showSourceCode ? "w-1/2" : "w-full"} overflow-hidden rounded border border-dark-border bg-white p-4 text-black transition-all duration-300`}
          >
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>

          {/* 源代码视图 - 条件显示 */}
          {showSourceCode && (
            <pre className="w-1/2 overflow-auto whitespace-pre-wrap break-all rounded border border-dark-border bg-dark-card p-4 font-mono text-xs text-gray-300 transition-all duration-300">
              {html}
            </pre>
          )}
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center text-gray-400">
          没有可用的原始邮件内容
        </div>
      )}

      {/* 切换源代码按钮 */}
      {html && (
        <div className="flex justify-end">
          <Button
            variant="flat"
            size="sm"
            startContent={<IconCode className="text-xs" />}
            onClick={() => setShowSourceCode(!showSourceCode)}
          >
            {showSourceCode ? "隐藏源代码" : "查看源代码"}
          </Button>
        </div>
      )}
    </div>
  );
}
