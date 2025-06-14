import { Email } from "@/types/email";
import { StoredMail, mailStorageDB } from "@/cache/mailStorageDB";

/**
 * 邮件存储管理工具类（IndexedDB 版本）
 */
export class MailStorageManager {
  /**
   * 缓存新邮件
   */
  static async cacheMail(mail: Email): Promise<void> {
    await mailStorageDB.addMail(mail);
  }

  /**
   * 获取指定收件人的最新邮件
   */
  static async getLatestMailByRecipient(
    recipientEmail: string,
  ): Promise<StoredMail | null> {
    const mails = await mailStorageDB.getMailsByRecipient(recipientEmail, 1);
    return mails.length > 0 ? mails[0] : null;
  }

  /**
   * 获取指定收件人的邮件列表（按接收时间倒序）
   */
  static async getMailListByRecipient(
    recipientEmail: string,
    limit?: number,
  ): Promise<StoredMail[]> {
    return await mailStorageDB.getMailsByRecipient(recipientEmail, limit);
  }

  /**
   * 根据收件人邮箱地址查询邮件
   */
  static async getMailsByRecipient(
    recipientEmail: string,
  ): Promise<StoredMail[]> {
    return await mailStorageDB.getMailsByRecipient(recipientEmail);
  }

  /**
   * 搜索邮件（根据主题、发件人、收件人等）
   */
  static async searchMails(
    query: string,
    recipientEmail?: string,
  ): Promise<StoredMail[]> {
    return await mailStorageDB.searchMails(query, recipientEmail);
  }

  /**
   * 获取邮件统计信息
   */
  static async getStats() {
    return await mailStorageDB.getStats();
  }

  /**
   * 清理旧邮件（保留最近的 N 封）
   */
  static async cleanupOldMails(
    recipientEmail: string,
    keepCount: number = 50,
  ): Promise<void> {
    await mailStorageDB.cleanupOldMails(recipientEmail, keepCount);
  }

  /**
   * 导出邮件数据（用于备份）
   */
  static async exportMails(recipientEmail?: string): Promise<StoredMail[]> {
    return await mailStorageDB.exportMails(recipientEmail);
  }

  /**
   * 检查邮件是否已存在
   */
  static async isMailExists(mailId: string): Promise<boolean> {
    const mail = await mailStorageDB.getMailById(mailId);
    return mail !== null;
  }

  /**
   * 获取邮件数量
   */
  static async getMailCount(recipientEmail?: string): Promise<number> {
    if (recipientEmail) {
      const mails = await mailStorageDB.getMailsByRecipient(recipientEmail);
      return mails.length;
    }
    const stats = await mailStorageDB.getStats();
    return stats.totalMails;
  }

  /**
   * 清空指定收件人的邮件
   */
  static async clearRecipientMails(recipientEmail: string): Promise<void> {
    await mailStorageDB.clearMailsByRecipient(recipientEmail);
  }

  /**
   * 获取指定邮件
   */
  static async getMailById(id: string): Promise<StoredMail | null> {
    return await mailStorageDB.getMailById(id);
  }

  /**
   * 删除指定邮件
   */
  static async removeMail(id: string): Promise<void> {
    await mailStorageDB.removeMail(id);
  }

  /**
   * 关闭数据库连接
   */
  static close(): void {
    mailStorageDB.close();
  }
}

/**
 * 格式化邮件接收时间
 */
export function formatMailReceivedTime(receivedAt: string): string {
  const date = new Date(receivedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "刚刚";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} 分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours} 小时前`;
  } else if (diffDays < 7) {
    return `${diffDays} 天前`;
  } else {
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

/**
 * 获取邮件摘要文本
 */
export function getMailSummary(
  mail: StoredMail,
  maxLength: number = 100,
): string {
  const text = mail.text || mail.html?.replace(/<[^>]*>/g, "") || "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}
