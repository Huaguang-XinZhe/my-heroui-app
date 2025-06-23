import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

// ============================================
// 邮件系统模块化函数导出
// ============================================

// 用户管理
export {
  createUser,
  getUserById,
  updateUser,
  getUserMailStats,
  getUserByEmail,
} from "./users";

// 邮箱账户管理
export {
  addMailAccount,
  batchAddMailAccounts,
  getUserMailAccounts,
  getAvailableMailAccounts,
  markMailAccountAsBanned,
} from "./mailAccounts";

// 邮件存储管理
export {
  storeMail,
  getLatestMailByUser,
  getUserMails,
  getUserMailCount,
} from "./mails";
