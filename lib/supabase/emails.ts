import { createClient } from "./client";

// 模拟邮箱数据作为后备
const mockEmails = {
  short_term: [
    "temp001@10minutemail.com",
    "temp002@guerrillamail.com",
    "temp003@mailinator.com",
    "temp004@throwaway.email",
    "temp005@yopmail.com",
    "temp006@temp-mail.com",
    "temp007@10minutemail.com",
    "temp008@guerrillamail.com",
    "temp009@mailinator.com",
    "temp010@throwaway.email",
  ],
  long_term: [
    "long001@protonmail.com",
    "long002@tutanota.com",
    "long003@outlook.com",
    "long004@yahoo.com",
    "long005@gmail.com",
    "long006@126.com",
    "long007@163.com",
    "long008@qq.com",
    "long009@sina.com",
    "long010@foxmail.com",
  ],
};

/**
 * 获取指定类型的邮箱
 */
export async function getEmailsByType(
  type: "short_term" | "long_term",
  limit: number,
): Promise<string[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("emails")
      .select("email")
      .eq("type", type)
      .eq("status", "active")
      .limit(limit);

    if (error) {
      console.error(`获取 ${type} 邮箱失败:`, error);
      // 发生错误时回退到模拟数据
      console.log(`回退到模拟 ${type} 邮箱数据`);
      const emails = mockEmails[type];
      return emails.slice(0, Math.min(limit, emails.length));
    }

    return data?.map((item: { email: string }) => item.email) || [];
  } catch (error) {
    console.error(`查询 ${type} 邮箱时出错:`, error);
    // 发生错误时回退到模拟数据
    console.log(`回退到模拟 ${type} 邮箱数据`);
    const emails = mockEmails[type];
    return emails.slice(0, Math.min(limit, emails.length));
  }
}

/**
 * 记录卡密验证日志
 */
export async function logCardVerification(
  entries: {
    card_key: string;
    user_id: string;
    verified_at: string;
    email_count: number;
    duration: string;
    source: string;
    custom_source?: string;
  }[],
) {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("card_verification_logs")
      .insert(entries);

    if (error) {
      console.error("记录验证日志失败:", error);
      console.log("模拟记录验证日志:", entries.length, "条记录");
      return false;
    }

    console.log("成功记录验证日志:", entries.length, "条记录");
    return true;
  } catch (error) {
    console.error("记录验证日志时出错:", error);
    console.log("模拟记录验证日志:", entries.length, "条记录");
    return false;
  }
}
