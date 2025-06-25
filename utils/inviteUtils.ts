import { generateToken, parseToken } from "./cryptoUtils";

// 邀请链接数据接口
export interface InviteData {
  // 邮箱配额
  imapEmailCount: number;
  graphEmailCount: number;

  // 注册限制
  maxRegistrations: number;

  // 有效期（时间戳）
  expiresAt: number;

  // 开放的注册方式
  registrationMethods: {
    linuxdo: boolean;
    google: boolean;
    cardKey: boolean; // 通过卡密注册
    others: boolean;
  };

  // 特殊功能
  autoCreateTrialAccount: boolean; // 直接生成体验卡密账户

  // 权限设置
  allowBatchAddEmails: boolean;

  // 元数据
  id: string;
  createdAt: number;
  createdBy?: string;
}

// 邀请链接使用记录
export interface InviteUsage {
  inviteId: string;
  usedAt: number;
  usedBy?: string;
  registrationMethod: string;
}

// 模拟已使用的邀请记录（实际项目中应该用真实数据库）
let usedInvites: Map<string, InviteUsage[]> = new Map();

/**
 * 生成邀请链接令牌
 */
export function generateInviteToken(data: InviteData): string {
  // 创建超简化的数据包
  const compactData = {
    i: data.imapEmailCount,
    g: data.graphEmailCount,
    m: data.maxRegistrations,
    e: Math.floor(data.expiresAt / 1000), // 时间戳（秒级）
    r:
      (data.registrationMethods.linuxdo ? 8 : 0) +
      (data.registrationMethods.google ? 4 : 0) +
      (data.registrationMethods.cardKey ? 2 : 0) +
      (data.registrationMethods.others ? 1 : 0), // 合并为单个数字
    b: data.allowBatchAddEmails ? 1 : 0,
    a: data.autoCreateTrialAccount ? 1 : 0,
    id: data.id.substring(0, 6), // ID 缩短到前6位
    t: Math.floor(data.createdAt / 86400) % 65536, // 转换为天数并取余，节省空间
    c: data.createdBy, // 创建者ID（完整保留）
  };

  return generateToken(compactData, ""); // 移除前缀
}

/**
 * 解析邀请链接令牌
 */
export function parseInviteToken(token: string): {
  isValid: boolean;
  data?: InviteData;
  error?: string;
} {
  console.log("parseInviteToken - 输入令牌:", token?.substring(0, 50) + "...");

  const parseResult = parseToken<any>(token, ""); // 移除前缀
  console.log(
    "parseInviteToken - parseToken 结果:",
    parseResult.isValid ? "成功" : `失败: ${parseResult.error}`,
  );

  if (!parseResult.isValid) {
    return parseResult;
  }

  const compactData = parseResult.data!;

  // 验证数据结构
  if (
    compactData.i === undefined ||
    compactData.g === undefined ||
    compactData.m === undefined ||
    compactData.e === undefined ||
    compactData.r === undefined ||
    compactData.b === undefined ||
    compactData.a === undefined ||
    !compactData.id ||
    compactData.t === undefined
  ) {
    return {
      isValid: false,
      error: "邀请令牌数据不完整",
    };
  }

  // 还原完整数据
  const data: InviteData = {
    imapEmailCount: compactData.i,
    graphEmailCount: compactData.g,
    maxRegistrations: compactData.m,
    expiresAt: compactData.e * 1000, // 转回毫秒
    registrationMethods: {
      linuxdo: (compactData.r & 8) === 8,
      google: (compactData.r & 4) === 4,
      cardKey: (compactData.r & 2) === 2,
      others: (compactData.r & 1) === 1,
    },
    allowBatchAddEmails: compactData.b === 1,
    autoCreateTrialAccount: compactData.a === 1,
    id: compactData.id,
    createdAt: compactData.t * 86400 * 1000, // 从天数转回毫秒
    createdBy: compactData.c, // 创建者ID
  };

  return {
    isValid: true,
    data,
  };
}

/**
 * 验证邀请链接（包含有效期和使用次数检查）
 */
export function verifyInviteToken(
  token: string,
  userId?: string,
): {
  isValid: boolean;
  data?: InviteData;
  canUse: boolean;
  error?: string;
  remainingUses?: number;
} {
  try {
    console.log(
      "verifyInviteToken - 输入令牌:",
      token?.substring(0, 50) + "...",
    );

    // 解析令牌
    const parseResult = parseInviteToken(token);
    console.log(
      "verifyInviteToken - 解析结果:",
      parseResult.isValid ? "成功" : `失败: ${parseResult.error}`,
    );

    if (!parseResult.isValid) {
      return {
        isValid: false,
        canUse: false,
        error: parseResult.error,
      };
    }

    const data = parseResult.data!;

    // 检查是否过期
    console.log("verifyInviteToken - 过期检查:", {
      currentTime: Date.now(),
      expiresAt: data.expiresAt,
      isExpired: Date.now() > data.expiresAt,
    });

    if (Date.now() > data.expiresAt) {
      return {
        isValid: true,
        data,
        canUse: false,
        error: "邀请链接已过期",
      };
    }

    // 检查使用次数
    const currentUsages = usedInvites.get(data.id) || [];
    const remainingUses = Math.max(
      0,
      data.maxRegistrations - currentUsages.length,
    );

    console.log("verifyInviteToken - 使用次数检查:", {
      inviteId: data.id,
      maxRegistrations: data.maxRegistrations,
      currentUsagesCount: currentUsages.length,
      remainingUses,
      currentUsages,
    });

    if (remainingUses <= 0) {
      return {
        isValid: true,
        data,
        canUse: false,
        error: "邀请链接使用次数已用完",
        remainingUses: 0,
      };
    }

    return {
      isValid: true,
      data,
      canUse: true,
      remainingUses,
    };
  } catch (error) {
    return {
      isValid: false,
      canUse: false,
      error: error instanceof Error ? error.message : "验证过程中发生未知错误",
    };
  }
}

/**
 * 使用邀请链接（记录使用）
 */
export function useInviteToken(
  token: string,
  userId?: string,
  registrationMethod: string = "unknown",
): {
  success: boolean;
  data?: InviteData;
  error?: string;
} {
  const verifyResult = verifyInviteToken(token, userId);

  if (!verifyResult.isValid || !verifyResult.canUse) {
    return {
      success: false,
      error: verifyResult.error,
    };
  }

  const data = verifyResult.data!;

  // 记录使用
  const usage: InviteUsage = {
    inviteId: data.id,
    usedAt: Date.now(),
    usedBy: userId,
    registrationMethod,
  };

  const currentUsages = usedInvites.get(data.id) || [];
  currentUsages.push(usage);
  usedInvites.set(data.id, currentUsages);

  return {
    success: true,
    data,
  };
}

/**
 * 创建快捷邀请链接（默认配置）
 */
export function createQuickInvite(createdBy?: string): string {
  const data: InviteData = {
    imapEmailCount: 1,
    graphEmailCount: 1,
    maxRegistrations: 1,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7天后过期
    registrationMethods: {
      linuxdo: false,
      google: false,
      cardKey: false, // 不开放任何注册方式
      others: false,
    },
    allowBatchAddEmails: true,
    autoCreateTrialAccount: true, // 直接创建体验卡密账户
    id: Math.random().toString(36).substring(2, 15),
    createdAt: Date.now(),
    createdBy,
  };

  return generateInviteToken(data);
}

/**
 * 获取邀请链接的使用统计
 */
export function getInviteUsageStats(inviteId: string): {
  totalUses: number;
  usages: InviteUsage[];
} {
  const usages = usedInvites.get(inviteId) || [];
  return {
    totalUses: usages.length,
    usages,
  };
}

/**
 * 清空邀请使用记录（用于测试）
 */
export function clearInviteUsages(): void {
  usedInvites.clear();
}

/**
 * 格式化邀请链接显示
 */
export function formatInviteDisplay(
  token: string,
  showLength: number = 8,
): string {
  if (!token) return "未知";

  const preview =
    token.length > showLength ? token.substring(0, showLength) + "..." : token;

  return preview;
}

/**
 * 生成完整的邀请 URL
 */
export function generateInviteUrl(token: string, baseUrl?: string): string {
  const base =
    baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
  // 对压缩后的 token 进行 URL 编码
  const encodedToken = encodeURIComponent(token);
  return `${base}/invite/${encodedToken}`;
}
