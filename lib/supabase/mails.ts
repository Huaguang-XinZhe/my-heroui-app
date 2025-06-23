import { createClient } from "./client";
import { Email, StoredMail } from "@/types/email";

// ============================================
// 邮件存储相关函数
// ============================================

/**
 * 存储邮件到数据库
 */
export async function storeMail(
  email: Email,
  userId: string,
  fromJunk: boolean = false,
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("stored_mails").upsert({
      id: email.id,
      user_id: userId,
      subject: email.subject,
      from_name: email.from.name,
      from_address: email.from.address,
      to_name: email.to.name,
      to_address: email.to.address,
      text_content: email.text,
      html_content: email.html,
      from_junk: fromJunk,
      received_at: email.date, // 假设email.date已经是北京时间
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
 * 获取用户的最新邮件
 */
export async function getLatestMailByUser(
  userId: string,
): Promise<Email | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_latest_mail_by_user", {
      user_id_param: userId,
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
      date: mail.received_at,
      text: mail.text_content,
      html: mail.html_content,
    };
  } catch (error) {
    console.error(`获取用户最新邮件失败 ${userId}:`, error);
    return null;
  }
}

/**
 * 获取用户的邮件列表
 */
export async function getUserMails(
  userId: string,
  options: {
    fromJunk?: boolean;
    limit?: number;
    offset?: number;
  } = {},
): Promise<Email[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from("stored_mails")
      .select("*")
      .eq("user_id", userId)
      .order("received_at", { ascending: false });

    if (options.fromJunk !== undefined) {
      query = query.eq("from_junk", options.fromJunk);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 10) - 1,
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("获取用户邮件失败:", error);
      return [];
    }

    return (
      data?.map((mail) => ({
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
        date: mail.received_at,
        text: mail.text_content,
        html: mail.html_content,
      })) || []
    );
  } catch (error) {
    console.error("查询用户邮件时出错:", error);
    return [];
  }
}

/**
 * 获取用户邮件数量统计
 */
export async function getUserMailCount(userId: string): Promise<{
  total_count: number;
  inbox_count: number;
  junk_count: number;
}> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_user_mail_count", {
      user_id_param: userId,
    });

    if (error || !data || data.length === 0) {
      return {
        total_count: 0,
        inbox_count: 0,
        junk_count: 0,
      };
    }

    const result = data[0];
    return {
      total_count: Number(result.total_count),
      inbox_count: Number(result.inbox_count),
      junk_count: Number(result.junk_count),
    };
  } catch (error) {
    console.error(`获取用户邮件统计失败 ${userId}:`, error);
    return {
      total_count: 0,
      inbox_count: 0,
      junk_count: 0,
    };
  }
}
