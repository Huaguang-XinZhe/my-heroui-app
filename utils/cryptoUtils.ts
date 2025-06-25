// 通用加密解密工具
// 抽象出卡密和邀请链接的共有加密逻辑

import { getCryptoPrivateKey } from "./cryptoConfig";

// 延迟获取私钥，避免在客户端执行
function getPrivateKey(): string {
  return getCryptoPrivateKey();
}

/**
 * 简单的字符串加密（客户端兼容，性能优化版）
 */
export function simpleEncrypt(text: string, key?: string): string {
  const privateKey = key || getPrivateKey();
  const textLen = text.length;
  const keyLen = privateKey.length;
  const result: string[] = new Array(textLen); // 预分配数组，避免字符串拼接

  for (let i = 0; i < textLen; i++) {
    const charCode = text.charCodeAt(i) ^ privateKey.charCodeAt(i % keyLen);
    result[i] = String.fromCharCode(charCode);
  }

  return btoa(result.join("")); // base64编码
}

/**
 * 简单的字符串解密（客户端兼容，性能优化版）
 */
export function simpleDecrypt(encrypted: string, key?: string): string {
  const privateKey = key || getPrivateKey();
  try {
    const decoded = atob(encrypted); // base64解码
    const decodedLen = decoded.length;
    const keyLen = privateKey.length;
    const result: string[] = new Array(decodedLen); // 预分配数组

    for (let i = 0; i < decodedLen; i++) {
      const charCode =
        decoded.charCodeAt(i) ^ privateKey.charCodeAt(i % keyLen);
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
export function createSimpleChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 转换为32位整数
  }
  return Math.abs(hash).toString(16).padStart(8, "0").substring(0, 4);
}

/**
 * 添加 base64 填充
 */
export function addBase64Padding(str: string): string {
  const padLength = (4 - (str.length % 4)) % 4;
  return str + "=".repeat(padLength);
}

/**
 * 简单的字符串压缩（基于重复字符压缩）
 */
function simpleCompress(str: string): string {
  if (!str) return str;

  let compressed = "";
  let i = 0;

  while (i < str.length) {
    let char = str[i];
    let count = 1;

    // 计算连续相同字符的数量
    while (i + count < str.length && str[i + count] === char && count < 99) {
      count++;
    }

    // 如果连续字符超过3个，进行压缩
    if (count > 3) {
      compressed += char + count.toString().padStart(2, "0");
    } else {
      // 否则直接添加字符
      compressed += char.repeat(count);
    }

    i += count;
  }

  return compressed;
}

/**
 * 简单的字符串解压缩
 */
function simpleDecompress(str: string): string {
  if (!str) return str;

  let decompressed = "";
  let i = 0;

  while (i < str.length) {
    let char = str[i];

    // 检查是否是压缩格式（字符+两位数字）
    if (i + 2 < str.length && /\d/.test(str[i + 1]) && /\d/.test(str[i + 2])) {
      let count = parseInt(str.substr(i + 1, 2));
      if (count > 3) {
        decompressed += char.repeat(count);
        i += 3;
        continue;
      }
    }

    decompressed += char;
    i++;
  }

  return decompressed;
}

/**
 * 生成带前缀的加密令牌
 */
export function generateToken(data: any, prefix: string, key?: string): string {
  const privateKey = key || getPrivateKey();
  // 序列化为紧凑的字符串
  const jsonData = JSON.stringify(data);

  // 压缩数据
  const compressedData = simpleCompress(jsonData);

  // 使用简单加密
  const encrypted = simpleEncrypt(compressedData, privateKey);

  // 先移除 base64 特殊字符
  const cleanEncrypted = encrypted.replace(/[+/=]/g, "");

  // 计算校验和（基于清理后的数据）
  const checksum = createSimpleChecksum(cleanEncrypted);

  // 生成最终令牌：prefix + 校验和 + 清理后的加密数据
  const token = prefix + checksum + cleanEncrypted;

  return token;
}

/**
 * 解析带前缀的加密令牌
 */
export function parseToken<T>(
  token: string,
  prefix: string,
  key?: string,
): {
  isValid: boolean;
  data?: T;
  error?: string;
} {
  const privateKey = key || getPrivateKey();

  try {
    if (!token) {
      return {
        isValid: false,
        error: "令牌为空",
      };
    }

    if (prefix && !token.startsWith(prefix)) {
      return {
        isValid: false,
        error: "令牌前缀不匹配",
      };
    }

    if (token.length < prefix.length + 20) {
      return {
        isValid: false,
        error: "令牌长度不足",
      };
    }

    // 移除前缀
    const withoutPrefix = token.substring(prefix.length);

    // 提取校验和和数据
    const checksum = withoutPrefix.substring(0, 4);
    const encryptedData = withoutPrefix.substring(4);

    // 验证校验和（基于清理后的数据，不重新添加填充）
    const expectedChecksum = createSimpleChecksum(encryptedData);

    // 重新添加 base64 填充用于解密
    const paddedData = addBase64Padding(encryptedData);
    if (checksum !== expectedChecksum) {
      return {
        isValid: false,
        error: "令牌校验失败",
      };
    }

    // 解密数据
    let decryptedData: string;
    try {
      console.log(
        "parseToken - 开始解密，填充后的数据长度:",
        paddedData.length,
      );
      decryptedData = simpleDecrypt(paddedData, privateKey);
      console.log(
        "parseToken - 解密成功，解密后数据长度:",
        decryptedData.length,
      );
    } catch (decryptError) {
      console.error("parseToken - 解密失败:", decryptError);
      return {
        isValid: false,
        error: "令牌解密失败",
      };
    }

    // 尝试解析 JSON（向后兼容：先尝试直接解析，如果失败再尝试解压缩）
    let data: T;
    console.log(
      "parseToken - 解密后的原始数据:",
      decryptedData.substring(0, 100) + "...",
    );

    try {
      // 先尝试直接解析（旧格式）
      console.log("parseToken - 尝试直接 JSON 解析");
      data = JSON.parse(decryptedData);
      console.log("parseToken - 直接解析成功");
    } catch (directParseError) {
      console.log("parseToken - 直接解析失败，尝试解压缩:", directParseError);
      try {
        // 如果直接解析失败，尝试解压缩后再解析（新格式）
        const decompressedData = simpleDecompress(decryptedData);
        console.log(
          "parseToken - 解压缩后的数据:",
          decompressedData.substring(0, 100) + "...",
        );
        data = JSON.parse(decompressedData);
        console.log("parseToken - 解压缩后解析成功");
      } catch (decompressError) {
        console.error("parseToken - 解压缩后解析也失败:", decompressError);
        return {
          isValid: false,
          error: "令牌数据格式错误",
        };
      }
    }

    return {
      isValid: true,
      data,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "解析令牌失败",
    };
  }
}
