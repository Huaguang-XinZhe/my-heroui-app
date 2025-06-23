import { createClient } from "./client";
import {
  MailInfo,
  ProtocolType,
  BatchAddMailAccountResponse,
  FromOthersResult,
  ErrorResult,
  SuccessResult,
  MailAccount,
} from "@/types/email";

// ============================================
// 邮箱账户管理相关函数
// ============================================

/**
 * 添加邮箱账户到数据库
 */
export async function addMailAccount(
  mailInfo: MailInfo,
  userId: string,
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("mail_accounts").upsert({
      email: mailInfo.email,
      user_id: userId,
      refresh_token: mailInfo.refreshToken,
      client_id: mailInfo.clientId,
      service_provider: mailInfo.serviceProvider || "MICROSOFT",
      protocol_type: mailInfo.protocolType || "UNKNOWN",
      password: mailInfo.password,
      secondary_email: mailInfo.secondaryEmail,
      secondary_password: mailInfo.secondaryPassword,
      is_banned: false,
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
 * 批量添加邮箱账户（优化版，真正的批量插入）
 */
export async function batchAddMailAccounts(
  mailInfos: MailInfo[],
  userId: string,
): Promise<{
  fromOthers: FromOthersResult[];
  errors: ErrorResult[];
  successes: SuccessResult[];
}> {
  const fromOthers: FromOthersResult[] = [];
  const errors: ErrorResult[] = [];
  const successes: SuccessResult[] = [];

  if (mailInfos.length === 0) {
    return { fromOthers, errors, successes };
  }

  try {
    const supabase = createClient();

    // 1. 确保系统用户存在（如果是 SYSTEM_UNASSIGNED）
    if (userId === "SYSTEM_UNASSIGNED") {
      const { data: systemUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", "SYSTEM_UNASSIGNED")
        .single();

      if (!systemUser) {
        // 创建系统用户
        const { error: createUserError } = await supabase.from("users").insert({
          id: "SYSTEM_UNASSIGNED",
          nickname: "系统未分配",
          user_type: "system",
        });

        if (createUserError) {
          console.error("创建系统用户失败:", createUserError);
          // 如果创建失败，将所有邮箱标记为错误
          return {
            fromOthers: [],
            errors: mailInfos.map((mail) => ({
              email: mail.email,
              isBanned: false,
              error: "系统用户创建失败",
            })),
            successes: [],
          };
        }
      }
    }

    // 2. 批量检查已存在的邮箱
    const emails = mailInfos.map((info) => info.email);
    const { data: existingAccounts } = await supabase
      .from("mail_accounts")
      .select("email, is_banned, user_id")
      .in("email", emails);

    const existingEmailsMap = new Map(
      (existingAccounts || []).map((account) => [account.email, account]),
    );

    // 3. 分类邮箱：已存在的和新的
    const newMailInfos: MailInfo[] = [];

    for (const mailInfo of mailInfos) {
      const existing = existingEmailsMap.get(mailInfo.email);

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
      } else {
        newMailInfos.push(mailInfo);
      }
    }

    // 4. 批量插入新邮箱（真正的批量操作）
    if (newMailInfos.length > 0) {
      const insertData = newMailInfos.map((mailInfo) => ({
        email: mailInfo.email,
        user_id: userId,
        refresh_token: mailInfo.refreshToken,
        client_id: mailInfo.clientId,
        service_provider: mailInfo.serviceProvider || "MICROSOFT",
        protocol_type: mailInfo.protocolType || "UNKNOWN",
        password: mailInfo.password,
        secondary_email: mailInfo.secondaryEmail,
        secondary_password: mailInfo.secondaryPassword,
        is_banned: false,
      }));

      const { data: insertedData, error: insertError } = await supabase
        .from("mail_accounts")
        .insert(insertData)
        .select("email, refresh_token, protocol_type");

      if (insertError) {
        console.error("批量插入邮箱失败:", insertError);
        // 如果批量插入失败，将所有新邮箱标记为错误
        newMailInfos.forEach((mailInfo) => {
          errors.push({
            email: mailInfo.email,
            isBanned: false,
            error: insertError.message || "批量插入失败",
          });
        });
      } else {
        // 插入成功，添加到成功列表
        (insertedData || []).forEach((account) => {
          const originalInfo = newMailInfos.find(
            (info) => info.email === account.email,
          );
          if (originalInfo) {
            successes.push({
              email: account.email,
              refreshToken: originalInfo.refreshToken,
              protocolType:
                (account.protocol_type as ProtocolType) || "UNKNOWN",
            });
          }
        });

        console.log(`批量插入成功: ${insertedData?.length || 0} 个邮箱账户`);
      }
    }
  } catch (error) {
    console.error("批量添加邮箱账户时出错:", error);
    // 如果整个操作失败，将所有邮箱标记为错误
    mailInfos.forEach((mailInfo) => {
      if (
        !fromOthers.some((item) => item.email === mailInfo.email) &&
        !errors.some((item) => item.email === mailInfo.email) &&
        !successes.some((item) => item.email === mailInfo.email)
      ) {
        errors.push({
          email: mailInfo.email,
          isBanned: false,
          error: error instanceof Error ? error.message : "未知错误",
        });
      }
    });
  }

  return { fromOthers, errors, successes };
}

/**
 * 获取用户的邮箱账户
 */
export async function getUserMailAccounts(
  userId: string,
): Promise<MailAccount[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("mail_accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("is_banned", false);

    if (error) {
      console.error("获取用户邮箱账户失败:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("查询用户邮箱账户时出错:", error);
    return [];
  }
}

/**
 * 获取所有可用的邮箱账户
 */
export async function getAvailableMailAccounts(): Promise<MailInfo[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("mail_accounts")
      .select("*")
      .eq("is_banned", false);

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
        secondaryEmail: account.secondary_email,
        secondaryPassword: account.secondary_password,
        user_id: account.user_id,
      })) || []
    );
  } catch (error) {
    console.error("查询可用邮箱账户时出错:", error);
    return [];
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
      })
      .eq("email", email);
  } catch (error) {
    console.error(`标记邮箱为封禁失败 ${email}:`, error);
  }
}
