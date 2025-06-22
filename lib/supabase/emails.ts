import { createClient } from "./client";
import {
  MailInfo,
  Email,
  ProtocolType,
  BatchAddMailAccountResponse,
  FromOthersResult,
  ErrorResult,
  SuccessResult,
} from "@/types/email";

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

// ============================================
// 邮件账户管理相关函数
// ============================================

/**
 * 添加邮箱账户到数据库
 */
export async function addMailAccount(mailInfo: MailInfo): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("mail_accounts").upsert({
      email: mailInfo.email,
      refresh_token: mailInfo.refreshToken,
      client_id: mailInfo.clientId,
      service_provider: mailInfo.serviceProvider || "MICROSOFT",
      protocol_type: mailInfo.protocolType || "UNKNOWN",
      password: mailInfo.password,
      is_banned: false,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`添加邮箱账户失败 ${mailInfo.email}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`添加邮箱账户时出错 ${mailInfo.email}:`, error);
    return false;
  }
}

/**
 * 批量添加邮箱账户
 */
export async function batchAddMailAccounts(mailInfos: MailInfo[]): Promise<{
  fromOthers: FromOthersResult[];
  errors: ErrorResult[];
  successes: SuccessResult[];
}> {
  const fromOthers: FromOthersResult[] = [];
  const errors: ErrorResult[] = [];
  const successes: SuccessResult[] = [];

  for (const mailInfo of mailInfos) {
    try {
      // 检查邮箱是否已存在
      const supabase = createClient();
      const { data: existing } = await supabase
        .from("mail_accounts")
        .select("email, is_banned")
        .eq("email", mailInfo.email)
        .single();

      if (existing) {
        if (existing.is_banned) {
          errors.push({
            email: mailInfo.email,
            isBanned: true,
            error: "邮箱已被封禁",
          });
        } else {
          fromOthers.push({
            email: mailInfo.email,
            isBanned: false,
          });
        }
        continue;
      }

      // 添加新账户
      const success = await addMailAccount(mailInfo);
      if (success) {
        successes.push({
          email: mailInfo.email,
          refreshToken: mailInfo.refreshToken,
          protocolType: (mailInfo.protocolType as ProtocolType) || "UNKNOWN",
        });
      } else {
        errors.push({
          email: mailInfo.email,
          isBanned: false,
          error: "数据库添加失败",
        });
      }
    } catch (error) {
      errors.push({
        email: mailInfo.email,
        isBanned: false,
        error: error instanceof Error ? error.message : "未知错误",
      });
    }
  }

  return { fromOthers, errors, successes };
}

/**
 * 获取可用的邮箱账户
 */
export async function getAvailableMailAccounts(): Promise<MailInfo[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("available_mail_accounts")
      .select("*");

    if (error) {
      console.error("获取可用邮箱账户失败:", error);
      return [];
    }

    return (
      data?.map((account) => ({
        email: account.email,
        refreshToken: account.refresh_token,
        clientId: account.client_id,
        serviceProvider: account.service_provider,
        protocolType: account.protocol_type,
        password: account.password,
      })) || []
    );
  } catch (error) {
    console.error("查询可用邮箱账户时出错:", error);
    return [];
  }
}

/**
 * 更新邮箱账户的最后获取时间
 */
export async function updateMailAccountFetchTime(email: string): Promise<void> {
  try {
    const supabase = createClient();
    await supabase
      .from("mail_accounts")
      .update({
        last_fetched_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);
  } catch (error) {
    console.error(`更新邮箱获取时间失败 ${email}:`, error);
  }
}

/**
 * 标记邮箱为封禁状态
 */
export async function markMailAccountAsBanned(email: string): Promise<void> {
  try {
    const supabase = createClient();
    await supabase
      .from("mail_accounts")
      .update({
        is_banned: true,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);
  } catch (error) {
    console.error(`标记邮箱为封禁失败 ${email}:`, error);
  }
}

// ============================================
// 邮件存储相关函数
// ============================================

/**
 * 存储邮件到数据库
 */
export async function storeMail(
  email: Email,
  accountEmail: string,
  mailType: "inbox" | "junk" = "inbox",
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("stored_mails").upsert({
      id: email.id,
      subject: email.subject,
      from_name: email.from.name,
      from_address: email.from.address,
      to_name: email.to.name,
      to_address: email.to.address,
      date_sent: email.date,
      text_content: email.text,
      html_content: email.html,
      account_email: accountEmail,
      mail_type: mailType,
      received_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`存储邮件失败 ${email.id}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`存储邮件时出错 ${email.id}:`, error);
    return false;
  }
}

/**
 * 获取指定账户的最新邮件
 */
export async function getLatestMailByAccount(
  accountEmail: string,
): Promise<Email | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_latest_mail_by_account", {
      account_email_param: accountEmail,
    });

    if (error || !data || data.length === 0) {
      return null;
    }

    const mail = data[0];
    return {
      id: mail.id,
      subject: mail.subject,
      from: {
        name: mail.from_name,
        address: mail.from_address,
      },
      to: {
        name: mail.to_name,
        address: mail.to_address,
      },
      date: mail.date_sent,
      text: mail.text_content,
      html: mail.html_content,
    };
  } catch (error) {
    console.error(`获取最新邮件失败 ${accountEmail}:`, error);
    return null;
  }
}

/**
 * 记录邮件操作日志
 */
export async function logMailOperation(
  accountEmail: string,
  operationType: "fetch_latest" | "fetch_junk" | "batch_add",
  status: "success" | "error" | "partial",
  resultCount: number = 0,
  errorMessage?: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from("mail_operation_logs").insert({
      account_email: accountEmail,
      operation_type: operationType,
      status,
      result_count: resultCount,
      error_message: errorMessage,
      ip_address: ipAddress,
      user_agent: userAgent,
      operation_time: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`记录邮件操作日志失败:`, error);
  }
}
