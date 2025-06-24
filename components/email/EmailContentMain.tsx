import { getEmailWithHtml } from "@/lib/emails";
import useSWR from "swr";
import React from "react";
import { Button } from "@heroui/button";

interface EmailLoadingProps {
  className?: string;
}

export const EmailLoading: React.FC<EmailLoadingProps> = ({ className }) => {
  return (
    <div className={`flex flex-col gap-4 p-6 ${className}`}>
      <div className="h-8 w-3/4 animate-pulse rounded bg-gray-700/50"></div>
      <div className="h-4 w-1/2 animate-pulse rounded bg-gray-700/30"></div>
      <div className="mt-6 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-4 w-full animate-pulse rounded bg-gray-700/20"
            style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

interface EmailErrorProps {
  error: Error;
  reset: () => void;
  className?: string;
}

export const EmailError: React.FC<EmailErrorProps> = ({
  error,
  reset,
  className,
}) => {
  return (
    <div
      className={`flex min-h-[500px] flex-col items-center justify-center p-6 ${className}`}
    >
      <p className="mb-6 text-center text-2xl text-red-500">
        加载邮件时出错：{error.message}
      </p>
      <Button onPress={reset} color="primary" variant="solid">
        重试
      </Button>
    </div>
  );
};

// 定义 fetcher 函数
const fetcher = (id: string) => getEmailWithHtml(id);

interface EmailContentProps {
  id: string;
  className?: string;
  children: (email: any) => React.ReactNode;
}

export const EmailContent: React.FC<EmailContentProps> = ({
  id,
  className,
  children,
}) => {
  // 使用 SWR 请求数据
  const {
    data: email,
    error,
    isLoading,
    mutate,
  } = useSWR(id, fetcher, {
    // 自动重试 3 次
    retry: 3,
    // 错误时自动重试
    shouldRetryOnError: true,
    // 聚焦时自动刷新
    revalidateOnFocus: false,
  });

  // 重试加载
  const handleRetry = () => {
    mutate();
  };

  // 加载状态
  if (isLoading) {
    return <EmailLoading className={className} />;
  }

  // 错误状态
  if (error) {
    return (
      <EmailError error={error} reset={handleRetry} className={className} />
    );
  }

  // 如果没有邮件
  if (!email) {
    return (
      <EmailError
        error={new Error("无法加载邮件")}
        reset={handleRetry}
        className={className}
      />
    );
  }

  // 使用 children 函数渲染
  return className ? (
    <div className={className}>{children(email)}</div>
  ) : (
    <>{children(email)}</>
  );
};
