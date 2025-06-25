export interface CardKeyData {
  source: "淘宝" | "闲鱼" | "内部" | "自定义";
  customSource?: string; // 自定义来源的英文简写
  emailCount: number;
  duration: "短效" | "长效";
  timestamp: number;
  id: string;
  reusable?: boolean; // 是否可重复使用
}

export interface UsedCardKey {
  key: string;
  usedAt: number;
  usedBy?: string;
}

import { generateToken, parseToken } from "./cryptoUtils";

// 模拟数据库存储已使用的卡密（实际项目中应该用真实数据库）
let usedKeys: Set<string> = new Set();

/**
 * 获取来源简化标识
 */
function getSourceCode(source: string, customSource?: string): string {
  switch (source) {
    case "淘宝":
      return "T";
    case "闲鱼":
      return "X";
    case "内部":
      return "I";
    case "自定义":
      return customSource?.substring(0, 3).toUpperCase() || "C";
    default:
      return "U"; // Unknown
  }
}

/**
 * 还原来源信息
 */
function restoreSource(code: string): {
  source: CardKeyData["source"];
  customSource?: string;
} {
  switch (code) {
    case "T":
      return { source: "淘宝" };
    case "X":
      return { source: "闲鱼" };
    case "I":
      return { source: "内部" };
    default:
      return { source: "自定义", customSource: code };
  }
}

/**
 * 生成短小且安全的卡密
 */
export function generateCardKey(data: CardKeyData): string {
  // 创建简化的数据包
  const compactData = {
    s: getSourceCode(data.source, data.customSource), // 来源简化
    e: data.emailCount, // 邮箱数量
    d: data.duration === "短效" ? "S" : "L", // 有效期简化
    t: Math.floor(data.timestamp / 1000), // 时间戳（秒级，节省空间）
    i: data.id.substring(0, 6), // ID 取前6位
    r: data.reusable ? 1 : 0, // 是否可重复使用
  };

  return generateToken(compactData, "sk-");
}

/**
 * 验证卡密（包含一次性使用检查）
 */
export function verifyCardKey(
  cardKey: string,
  userId?: string,
): {
  isValid: boolean;
  data?: CardKeyData;
  error?: string;
} {
  try {
    if (!cardKey || !cardKey.startsWith("sk-") || cardKey.length < 20) {
      return {
        isValid: false,
        error: "卡密格式错误",
      };
    }

    // 解析卡密数据
    const parseResult = parseCardKeyData(cardKey);
    if (!parseResult.isValid) {
      return parseResult;
    }

    const data = parseResult.data!;

    // 检查是否可重复使用
    if (!data.reusable && usedKeys.has(cardKey)) {
      return {
        isValid: false,
        error: "卡密已被使用",
      };
    }

    // 标记为已使用（仅对一次性卡密）
    if (!data.reusable) {
      markKeyAsUsed(cardKey, userId);
    }

    return {
      isValid: true,
      data,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "验证过程中发生未知错误",
    };
  }
}

/**
 * 解析卡密数据（提取公共逻辑）
 */
function parseCardKeyData(cardKey: string): {
  isValid: boolean;
  data?: CardKeyData;
  error?: string;
} {
  const parseResult = parseToken<any>(cardKey, "sk-");

  if (!parseResult.isValid) {
    return parseResult;
  }

  const compactData = parseResult.data!;

  // 验证数据结构
  if (
    !compactData.s ||
    compactData.e === undefined ||
    !compactData.d ||
    !compactData.t ||
    !compactData.i ||
    compactData.r === undefined
  ) {
    return {
      isValid: false,
      error: "卡密数据不完整",
    };
  }

  // 还原完整数据
  const sourceInfo = restoreSource(compactData.s);
  const data: CardKeyData = {
    source: sourceInfo.source,
    customSource: sourceInfo.customSource,
    emailCount: compactData.e,
    duration: compactData.d === "S" ? "短效" : "长效",
    timestamp: compactData.t * 1000, // 转回毫秒
    id: compactData.i,
    reusable: compactData.r === 1,
  };

  return {
    isValid: true,
    data,
  };
}

/**
 * 标记卡密为已使用
 */
function markKeyAsUsed(cardKey: string, userId?: string): void {
  usedKeys.add(cardKey);

  // 实际项目中，这里应该写入数据库
  console.log(`卡密 ${cardKey} 已被使用`, userId ? `by ${userId}` : "");
}

/**
 * 检查卡密是否已被使用
 */
export function isKeyUsed(cardKey: string): boolean {
  return usedKeys.has(cardKey);
}

/**
 * 获取已使用的卡密列表（用于管理）
 */
export function getUsedKeys(): string[] {
  return Array.from(usedKeys);
}

/**
 * 清空已使用的卡密列表（用于测试）
 */
export function clearUsedKeys(): void {
  usedKeys.clear();
}
