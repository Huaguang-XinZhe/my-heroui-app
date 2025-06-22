import { createClient } from "@/lib/supabase/client";

/**
 * 邮箱缓存管理器
 * 对应 Kotlin 中的 EmailCacheManager
 */
export class EmailCacheManager {
  private cachedEmails: Set<string> = new Set();
  private bannedEmails: Set<string> = new Set();
  private initialized = false;

  /**
   * 初始化缓存（从数据库加载已存在的邮箱）
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("mail_accounts")
        .select("email, is_banned");

      if (error) {
        console.error("初始化邮箱缓存失败:", error);
        return;
      }

      // 清空现有缓存
      this.cachedEmails.clear();
      this.bannedEmails.clear();

      // 重新构建缓存
      data?.forEach((account: { email: string; is_banned: boolean }) => {
        this.cachedEmails.add(account.email);
        if (account.is_banned) {
          this.bannedEmails.add(account.email);
        }
      });

      this.initialized = true;
      console.log(
        `邮箱缓存初始化完成: ${this.cachedEmails.size} 个邮箱，其中 ${this.bannedEmails.size} 个已封禁`,
      );
    } catch (error) {
      console.error("初始化邮箱缓存时出错:", error);
    }
  }

  /**
   * 过滤出已缓存和新的邮箱
   * 对应 Kotlin 中的 filterCachedEmails
   */
  async filterCachedEmails(emails: string[]): Promise<{
    cachedEmails: string[];
    newEmails: string[];
  }> {
    // 确保缓存已初始化
    await this.initialize();

    const cachedEmails: string[] = [];
    const newEmails: string[] = [];

    emails.forEach((email) => {
      if (this.cachedEmails.has(email)) {
        cachedEmails.push(email);
      } else {
        newEmails.push(email);
      }
    });

    return { cachedEmails, newEmails };
  }

  /**
   * 检查邮箱是否被封禁
   * 对应 Kotlin 中的 isEmailBanned
   */
  async isEmailBanned(email: string): Promise<boolean> {
    await this.initialize();
    return this.bannedEmails.has(email);
  }

  /**
   * 添加邮箱到缓存
   */
  addEmail(email: string, isBanned: boolean = false): void {
    this.cachedEmails.add(email);
    if (isBanned) {
      this.bannedEmails.add(email);
    }
  }

  /**
   * 批量添加邮箱到缓存（带状态）
   * 对应 Kotlin 中的 addEmailsWithStatus
   */
  addEmailsWithStatus(emailStatusMap: Record<string, boolean>): void {
    Object.entries(emailStatusMap).forEach(([email, isBanned]) => {
      this.addEmail(email, isBanned);
    });
  }

  /**
   * 标记邮箱为封禁状态
   */
  banEmail(email: string): void {
    this.cachedEmails.add(email);
    this.bannedEmails.add(email);
  }

  /**
   * 取消邮箱封禁状态
   */
  unbanEmail(email: string): void {
    this.bannedEmails.delete(email);
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    totalCached: number;
    totalBanned: number;
    activeCached: number;
  } {
    return {
      totalCached: this.cachedEmails.size,
      totalBanned: this.bannedEmails.size,
      activeCached: this.cachedEmails.size - this.bannedEmails.size,
    };
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cachedEmails.clear();
    this.bannedEmails.clear();
    this.initialized = false;
  }

  /**
   * 刷新缓存（重新从数据库加载）
   */
  async refresh(): Promise<void> {
    this.initialized = false;
    await this.initialize();
  }
}

// 导出单例实例
export const emailCacheManager = new EmailCacheManager();
