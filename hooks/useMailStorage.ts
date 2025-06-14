import { useState, useEffect, useCallback } from "react";
import { StoredMail } from "@/cache/mailStorageDB";
import { MailStorageManager } from "@/utils/mailStorageUtils";

interface UseMailStorageProps {
  recipientEmail?: string;
  autoRefresh?: boolean; // 是否自动刷新邮件列表
}

export function useMailStorage({
  recipientEmail,
  autoRefresh = false,
}: UseMailStorageProps = {}) {
  const [mails, setMails] = useState<StoredMail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ totalMails: 0, recipientStats: {} });

  // 刷新邮件列表
  const refreshMails = useCallback(async () => {
    setIsLoading(true);
    try {
      const mailList = recipientEmail
        ? await MailStorageManager.getMailListByRecipient(recipientEmail)
        : [];
      setMails(mailList);

      // 更新统计信息
      const currentStats = await MailStorageManager.getStats();
      setStats(currentStats);
    } catch (error) {
      console.error("刷新邮件列表失败:", error);
    } finally {
      setIsLoading(false);
    }
  }, [recipientEmail]);

  // 获取指定数量的邮件
  const getMailsWithLimit = useCallback(
    async (limit: number) => {
      if (!recipientEmail) return [];
      return await MailStorageManager.getMailListByRecipient(
        recipientEmail,
        limit,
      );
    },
    [recipientEmail],
  );

  // 搜索邮件
  const searchMails = useCallback(
    async (query: string) => {
      return await MailStorageManager.searchMails(query, recipientEmail);
    },
    [recipientEmail],
  );

  // 根据收件人查询邮件
  const getMailsByRecipient = useCallback(
    async (targetRecipientEmail: string) => {
      return await MailStorageManager.getMailsByRecipient(targetRecipientEmail);
    },
    [],
  );

  // 获取最新邮件
  const getLatestMail = useCallback(async () => {
    if (!recipientEmail) return null;
    return await MailStorageManager.getLatestMailByRecipient(recipientEmail);
  }, [recipientEmail]);

  // 清理旧邮件
  const cleanupOldMails = useCallback(
    async (keepCount: number = 50) => {
      if (!recipientEmail) return;
      await MailStorageManager.cleanupOldMails(recipientEmail, keepCount);
      await refreshMails(); // 刷新列表
    },
    [recipientEmail, refreshMails],
  );

  // 清空收件人邮件
  const clearRecipientMails = useCallback(async () => {
    if (!recipientEmail) return;
    await MailStorageManager.clearRecipientMails(recipientEmail);
    await refreshMails(); // 刷新列表
  }, [recipientEmail, refreshMails]);

  // 导出邮件
  const exportMails = useCallback(async () => {
    return await MailStorageManager.exportMails(recipientEmail);
  }, [recipientEmail]);

  // 获取邮件数量
  const getMailCount = useCallback(async () => {
    return await MailStorageManager.getMailCount(recipientEmail);
  }, [recipientEmail]);

  // 删除指定邮件
  const removeMail = useCallback(
    async (mailId: string) => {
      await MailStorageManager.removeMail(mailId);
      await refreshMails(); // 刷新列表
    },
    [refreshMails],
  );

  // 获取指定邮件
  const getMailById = useCallback(async (mailId: string) => {
    return await MailStorageManager.getMailById(mailId);
  }, []);

  // 初始化和自动刷新
  useEffect(() => {
    refreshMails();

    if (autoRefresh) {
      const interval = setInterval(refreshMails, 5000); // 每 5 秒刷新一次
      return () => clearInterval(interval);
    }
  }, [refreshMails, autoRefresh]);

  // 组件卸载时关闭数据库连接
  useEffect(() => {
    return () => {
      // 注意：这里不直接关闭数据库，因为可能有其他组件在使用
      // 数据库连接会在页面刷新或关闭时自动关闭
    };
  }, []);

  return {
    // 状态
    mails,
    isLoading,
    stats,

    // 操作方法
    refreshMails,
    getMailsWithLimit,
    searchMails,
    getMailsByRecipient,
    getLatestMail,
    cleanupOldMails,
    clearRecipientMails,
    exportMails,
    getMailCount,
    removeMail,
    getMailById,
  };
}
