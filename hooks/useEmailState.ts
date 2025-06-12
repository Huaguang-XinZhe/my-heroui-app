import { useState } from "react";
import { Email } from "@/types/email";

export interface EmailState {
  email: Email | null;
  isLoading: boolean;
  error: string | null;
  lastFetchType: "inbox" | "junk" | null;
  hasFetched: boolean;
}

export function useEmailState() {
  const [email, setEmail] = useState<Email | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchType, setLastFetchType] = useState<"inbox" | "junk" | null>(
    null,
  );
  const [hasFetched, setHasFetched] = useState(false);

  const resetState = () => {
    setEmail(null);
    setError(null);
    setHasFetched(false);
    setLastFetchType(null);
  };

  return {
    // 状态
    email,
    isLoading,
    error,
    lastFetchType,
    hasFetched,
    // 状态更新方法
    setEmail,
    setIsLoading,
    setError,
    setLastFetchType,
    setHasFetched,
    resetState,
  };
}
