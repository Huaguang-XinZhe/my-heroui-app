import { createClient } from "./client";
import {
  User,
  CreateUserRequest,
  UserType,
  UserMailStats,
} from "@/types/email";

// ============================================
// 用户管理相关函数
// ============================================

/**
 * 创建用户
 */
export async function createUser(
  userData: CreateUserRequest,
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("users").insert({
      id: userData.id,
      nickname: userData.nickname,
      avatar_url: userData.avatar_url,
      user_type: userData.user_type,
    });

    if (error) {
      console.error("创建用户失败:", error);
      return false;
    }

    console.log("成功创建用户:", userData.id);
    return true;
  } catch (error) {
    console.error("创建用户时出错:", error);
    return false;
  }
}

/**
 * 根据ID获取用户
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("获取用户失败:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("查询用户时出错:", error);
    return null;
  }
}

/**
 * 更新用户信息
 */
export async function updateUser(
  userId: string,
  updates: Partial<User>,
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId);

    if (error) {
      console.error("更新用户失败:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("更新用户时出错:", error);
    return false;
  }
}

/**
 * 获取用户邮件统计
 */
export async function getUserMailStats(
  userId: string,
): Promise<UserMailStats | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_mail_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("获取用户邮件统计失败:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("查询用户邮件统计时出错:", error);
    return null;
  }
}

/**
 * 根据邮箱地址获取用户信息
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_user_by_email", {
      email_address: email,
    });

    if (error || !data || data.length === 0) {
      return null;
    }

    const result = data[0];
    return {
      id: result.user_id,
      nickname: result.nickname,
      user_type: result.user_type as UserType,
      avatar_url: result.avatar_url,
    };
  } catch (error) {
    console.error(`根据邮箱获取用户失败 ${email}:`, error);
    return null;
  }
}
