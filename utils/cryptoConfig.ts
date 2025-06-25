// 统一的加密配置
// 私钥仅在服务器端使用，客户端不再直接处理加密

// 默认私钥 - 仅在服务器端使用（开发环境）
const DEFAULT_PRIVATE_KEY = "R9>0E=i!.,Qg";

// 获取私钥的函数 - 仅在服务器端调用
export function getCryptoPrivateKey(): string {
  // 在客户端返回占位符，避免实际加密操作
  if (typeof window !== "undefined") {
    console.warn("客户端无法访问私钥，请使用服务器端 API 进行加密操作");
    return "CLIENT_PLACEHOLDER_KEY"; // 返回占位符而不是抛出错误
  }

  // 优先使用环境变量
  if (process.env?.CRYPTO_PRIVATE_KEY) {
    const key = process.env.CRYPTO_PRIVATE_KEY;
    if (key.length < 16) {
      console.warn("CRYPTO_PRIVATE_KEY 长度过短，建议使用至少 16 个字符的密钥");
    }
    return key;
  }

  // 在生产环境中，如果没有设置环境变量，输出警告
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "生产环境未设置 CRYPTO_PRIVATE_KEY 环境变量，使用默认密钥（不安全）",
    );
  }

  // 使用默认私钥
  return DEFAULT_PRIVATE_KEY;
}
