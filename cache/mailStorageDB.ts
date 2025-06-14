import { Email } from "@/types/email";

const DB_NAME = "MailStorageDB";
const DB_VERSION = 2; // 增加版本号，因为结构变化了
const STORE_NAME = "mails";

/**
 * 存储的邮件信息
 */
export interface StoredMail extends Email {
  receivedAt: string; // 接收时间
}

/**
 * IndexedDB 邮件存储管理器
 */
export class MailStorageDB {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  /**
   * 初始化数据库连接
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error("IndexedDB 打开失败:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 删除旧的对象存储（如果存在）
        if (db.objectStoreNames.contains(STORE_NAME)) {
          db.deleteObjectStore(STORE_NAME);
        }

        // 创建对象存储，使用邮件 ID 作为主键
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });

        // 创建索引
        store.createIndex("toAddress", "to.address", { unique: false }); // 收件人邮箱索引
        store.createIndex("receivedAt", "receivedAt", { unique: false }); // 时间索引
      };
    });

    return this.dbPromise;
  }

  /**
   * 添加邮件到存储
   */
  async addMail(mail: Email): Promise<void> {
    const db = await this.initDB();

    const storedMail: StoredMail = {
      ...mail,
      receivedAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      const request = store.put(storedMail); // 使用 put 而不是 add，支持更新

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error("添加邮件失败:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 根据收件人邮箱获取邮件列表
   */
  async getMailsByRecipient(
    recipientEmail: string,
    limit?: number,
  ): Promise<StoredMail[]> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("toAddress");

      const request = index.getAll(recipientEmail);

      request.onsuccess = () => {
        const results = request.result || [];
        // 按接收时间倒序排列
        results.sort(
          (a: StoredMail, b: StoredMail) =>
            new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
        );

        // 如果有限制，只返回指定数量
        const finalResults = limit ? results.slice(0, limit) : results;
        resolve(finalResults);
      };

      request.onerror = () => {
        console.error("按收件人查询邮件失败:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 搜索邮件
   */
  async searchMails(
    query: string,
    recipientEmail?: string,
  ): Promise<StoredMail[]> {
    const db = await this.initDB();
    const lowerQuery = query.toLowerCase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);

      let request: IDBRequest;
      if (recipientEmail) {
        // 如果指定了收件人，使用收件人索引
        const index = store.index("toAddress");
        request = index.getAll(recipientEmail);
      } else {
        // 否则获取所有邮件
        request = store.getAll();
      }

      request.onsuccess = () => {
        const allMails = request.result || [];
        const filteredMails = allMails.filter(
          (mail: StoredMail) =>
            mail.subject.toLowerCase().includes(lowerQuery) ||
            mail.from.address.toLowerCase().includes(lowerQuery) ||
            mail.from.name?.toLowerCase().includes(lowerQuery) ||
            mail.to.address.toLowerCase().includes(lowerQuery) ||
            mail.text?.toLowerCase().includes(lowerQuery),
        );

        // 按接收时间倒序排列
        filteredMails.sort(
          (a: StoredMail, b: StoredMail) =>
            new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
        );
        resolve(filteredMails);
      };

      request.onerror = () => {
        console.error("搜索邮件失败:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 获取指定邮件
   */
  async getMailById(id: string): Promise<StoredMail | null> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);

      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error("获取邮件失败:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 删除指定邮件
   */
  async removeMail(id: string): Promise<void> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error("删除邮件失败:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 清空指定收件人的所有邮件
   */
  async clearMailsByRecipient(recipientEmail: string): Promise<void> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("toAddress");

      const request = index.openCursor(recipientEmail);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => {
        console.error("清空收件人邮件失败:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 获取存储统计信息
   */
  async getStats(): Promise<{
    totalMails: number;
    recipientStats: Record<string, number>;
  }> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);

      const request = store.getAll();

      request.onsuccess = () => {
        const allMails = request.result || [];
        const recipientStats: Record<string, number> = {};

        allMails.forEach((mail: StoredMail) => {
          recipientStats[mail.to.address] =
            (recipientStats[mail.to.address] || 0) + 1;
        });

        resolve({
          totalMails: allMails.length,
          recipientStats,
        });
      };

      request.onerror = () => {
        console.error("获取统计信息失败:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 清理旧邮件（保留最近的 N 封）
   */
  async cleanupOldMails(
    recipientEmail: string,
    keepCount: number,
  ): Promise<void> {
    const mails = await this.getMailsByRecipient(recipientEmail);
    if (mails.length <= keepCount) return;

    const mailsToRemove = mails.slice(keepCount);
    const promises = mailsToRemove.map((mail) => this.removeMail(mail.id));

    await Promise.all(promises);
  }

  /**
   * 导出邮件数据
   */
  async exportMails(recipientEmail?: string): Promise<StoredMail[]> {
    if (recipientEmail) {
      return this.getMailsByRecipient(recipientEmail);
    }

    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);

      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error("导出邮件失败:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.dbPromise = null;
    }
  }
}

// 创建单例实例
export const mailStorageDB = new MailStorageDB();
