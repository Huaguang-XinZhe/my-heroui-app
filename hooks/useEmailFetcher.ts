import { useCallback } from "react";
import { getCachedEmails } from "@/utils/emailCache";
import { getLatestMail, getJunkMail } from "@/api/mailService";
import {
  GetLatestMailRequest,
  GetJunkMailRequest,
  MailRequestInfo,
} from "@/types/email";

interface UseEmailFetcherProps {
  selectedEmail?: string;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastFetchType: (type: "inbox" | "junk" | null) => void;
  setHasFetched: (fetched: boolean) => void;
  setEmail: (email: any) => void;
}

export function useEmailFetcher({
  selectedEmail,
  setIsLoading,
  setError,
  setLastFetchType,
  setHasFetched,
  setEmail,
}: UseEmailFetcherProps) {
  const fetchEmails = useCallback(
    // todo 为什么要用这个包着？
    async (type: "inbox" | "junk") => {
      if (!selectedEmail) return;

      setIsLoading(true);
      setError(null);
      setLastFetchType(type);
      setHasFetched(false);

      try {
        // 从缓存中获取邮箱信息
        const cachedEmails = getCachedEmails();
        const emailInfo = cachedEmails.find((e) => e.email === selectedEmail);

        if (!emailInfo) {
          throw new Error("邮箱信息未找到");
        }

        const mailInfo: MailRequestInfo = {
          email: emailInfo.email,
          refreshToken: emailInfo.refreshToken,
          protocolType: emailInfo.protocolType,
        };

        let result;

        if (type === "inbox") {
          const request: GetLatestMailRequest = {
            mailInfo,
            refreshNeeded: false,
          };
          result = await getLatestMail(request);
        } else {
          const request: GetJunkMailRequest = {
            mailInfo,
          };
          result = await getJunkMail(request);
        }

        if (!result.success) {
          throw new Error(result.error || "获取邮件失败");
        }

        if (result.data) {
          setEmail(result.data.email);
          setHasFetched(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取邮件失败");
      } finally {
        setIsLoading(false);
      }
    },
    [
      selectedEmail,
      setIsLoading,
      setError,
      setLastFetchType,
      setHasFetched,
      setEmail,
    ],
  );

  return { fetchEmails };
}
