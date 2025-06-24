"use client";

import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { IconInbox, IconKey, IconPlay } from "@/components/icons/icons";
import { EmailStatusDisplay } from "@/components/email/EmailStatusDisplay";

interface EmailFetcherProps {
  onSubmit?: (value: string) => void;
}

export function EmailFetcher({ onSubmit }: EmailFetcherProps) {
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(true);
  const [listeningEmail, setListeningEmail] = useState("example@gmail.com");
  const [terminationReason, setTerminationReason] = useState<string | null>(
    "监听时间过长，系统自动终止！",
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;

    setIsLoading(true);

    try {
      // 模拟异步操作
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setInputValue("");
      setIsListening(true);
      setListeningEmail(inputValue);
      // setTerminationReason(null);

      if (onSubmit) {
        onSubmit(inputValue);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      handleSubmit();
    }
  };

  const stopListening = () => {
    setIsListening(false);
    // setTerminationReason(null);
  };

  const startListening = () => {
    setIsListening(true);
    // setTerminationReason(null);
  };

  // 模拟自动终止的函数，实际应用中可能由外部调用
  const autoTerminate = (reason: string) => {
    setIsListening(false);
    setTerminationReason(reason);
  };

  return (
    <Card className="border border-dark-border bg-dark-card p-4 sm:p-6">
      <h2 className="mb-3 flex items-center text-lg font-semibold text-indigo-500">
        <IconInbox className="mr-2" />
        获取邮件
      </h2>

      <div className="mb-4 flex flex-col sm:flex-row">
        <div className="relative flex-1">
          <Input
            isClearable
            fullWidth
            onClear={() => setInputValue("")}
            type="text"
            placeholder="请输入单条四件套或 refreshToken..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            startContent={<IconKey className="text-gray-500" />}
            classNames={{
              input: "ml-1 text-sm",
              inputWrapper: [
                "bg-dark-input",
                "group-hover:bg-gray-875",
                "group-data-[focus=true]:bg-dark-input",
                "sm:border-r-0",
                "sm:rounded-r-none",
              ],
            }}
          />
        </div>
        <Button
          isDisabled={!inputValue.trim() || isLoading}
          isLoading={isLoading}
          color="primary"
          variant="shadow"
          className="mt-2 w-full sm:mt-0 sm:w-auto sm:rounded-l-none"
          startContent={!isLoading && <IconPlay />}
          onPress={handleSubmit}
        >
          获取或监听
        </Button>
      </div>

      <EmailStatusDisplay
        isListening={isListening}
        email={listeningEmail}
        terminationReason={terminationReason}
        onStopListening={stopListening}
        onStartListening={startListening}
      />
    </Card>
  );
}
