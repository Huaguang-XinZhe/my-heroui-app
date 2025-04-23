"use client";

import { Snippet } from "@heroui/snippet";

interface EmailSnippetProps {
  email: string;
  className?: string;
}

export function EmailSnippet({ email, className = "" }: EmailSnippetProps) {
  return (
    <Snippet
      symbol="："
      variant="bordered"
      color="default"
      size="md"
      tooltipProps={{
        content: "复制邮箱",
        placement: "right",
        offset: 5,
        closeDelay: 0,
      }}
      classNames={{
        base: `border-none px-1 py-0 gap-0 justify-start w-full ${className}`,
        pre: "truncate text-sm sm:text-base font-mono font-medium",
        symbol: "text-gray-500 shrink-0",
        copyButton: "ml-1",
      }}
    >
      {email}
    </Snippet>
  );
}
