import { useCallback } from "react";
import { getCachedEmails, updateEmailFetchTime } from "@/cache/emailCache";
import { getLatestMail, getJunkMail } from "@/api/mailService";
import { MailStorageManager } from "@/utils/mailStorageUtils";
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

        if (result.data && result.data.email) {
          // 将获取到的邮件存储到 IndexedDB
          try {
            await MailStorageManager.cacheMail(result.data.email);
            console.log(
              `邮件已存储到 IndexedDB: ${result.data.email.subject} (收件人: ${result.data.email.to.address}, 类型: ${type})`,
            );
          } catch (storageError) {
            console.error("存储邮件失败:", storageError);
            // 存储失败不影响邮件显示，继续执行
          }

          // 更新邮箱的最后获取时间
          updateEmailFetchTime(selectedEmail);

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
