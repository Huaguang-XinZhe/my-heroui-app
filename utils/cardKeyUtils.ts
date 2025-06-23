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

// 私钥，实际使用中应该放在环境变量中
const PRIVATE_KEY = "MyCardKey2024Secret#Advanced!";

// 模拟数据库存储已使用的卡密（实际项目中应该用真实数据库）
let usedKeys: Set<string> = new Set();

/**
 * 简单的字符串加密（客户端兼容，性能优化版）
 */
function simpleEncrypt(text: string, key: string): string {
  const textLen = text.length;
  const keyLen = key.length;
  const result: string[] = new Array(textLen); // 预分配数组，避免字符串拼接

  for (let i = 0; i < textLen; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % keyLen);
    result[i] = String.fromCharCode(charCode);
  }

  return btoa(result.join("")); // base64编码
}

/**
 * 简单的字符串解密（客户端兼容，性能优化版）
 */
function simpleDecrypt(encrypted: string, key: string): string {
  try {
    const decoded = atob(encrypted); // base64解码
    const decodedLen = decoded.length;
    const keyLen = key.length;
    const result: string[] = new Array(decodedLen); // 预分配数组

    for (let i = 0; i < decodedLen; i++) {
      const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % keyLen);
      result[i] = String.fromCharCode(charCode);
    }

    return result.join("");
  } catch {
    throw new Error("解密失败");
  }
}

/**
 * 创建简单的校验和
 */
function createSimpleChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 转换为32位整数
  }
  return Math.abs(hash).toString(16).padStart(8, "0").substring(0, 4);
}

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

  // 序列化为紧凑的字符串
  const jsonData = JSON.stringify(compactData);

  // 使用简单加密
  const encrypted = simpleEncrypt(jsonData, PRIVATE_KEY);

  // 创建校验和
  const checksum = createSimpleChecksum(encrypted);

  // 生成最终卡密：sk- + 校验和 + 加密数据
  const cardKey = "sk-" + checksum + encrypted.replace(/[+/=]/g, ""); // 移除 base64 特殊字符

  return cardKey;
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
  try {
    // 移除前缀
    const withoutPrefix = cardKey.substring(3);

    // 提取校验和和数据
    const checksum = withoutPrefix.substring(0, 4);
    const encryptedData = withoutPrefix.substring(4);

    // 重新添加 base64 填充
    const paddedData = addBase64Padding(encryptedData);

    // 验证校验和
    const expectedChecksum = createSimpleChecksum(paddedData);
    if (checksum !== expectedChecksum) {
      return {
        isValid: false,
        error: "卡密校验失败",
      };
    }

    // 解密数据
    let jsonData: string;
    try {
      jsonData = simpleDecrypt(paddedData, PRIVATE_KEY);
    } catch {
      return {
        isValid: false,
        error: "卡密解密失败",
      };
    }

    // 解析 JSON 数据
    let compactData: any;
    try {
      compactData = JSON.parse(jsonData);
    } catch {
      return {
        isValid: false,
        error: "卡密数据格式错误",
      };
    }

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
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "解析卡密数据失败",
    };
  }
}

/**
 * 添加 base64 填充
 */
function addBase64Padding(str: string): string {
  const padLength = (4 - (str.length % 4)) % 4;
  return str + "=".repeat(padLength);
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
