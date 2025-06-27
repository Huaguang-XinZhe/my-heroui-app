/**
 * API 配置
 * 集中管理所有 API 端点和配置
 */

// GoMailAPI 配置
export const GO_MAIL_API_CONFIG = {
  // 基础 URL，可以通过环境变量配置
  BASE_URL: process.env.GO_MAIL_API_URL || "http://54.151.255.10:8080",

  // API 路径前缀
  BASE_PREFIX: "/gomailapi2",

  // 端点配置
  ENDPOINTS: {
    // 邮件相关端点
    MAIL: {
      LATEST: "/mail/latest",
      FIND: "/mail/find",
      JUNK_LATEST: "/mail/junk/latest",
      SUBSCRIBE_SSE: "/subscribe-sse",
      DETECT_PROTOCOL: "/detect-protocol",
      BATCH_DETECT_PROTOCOL: "/batch/detect-protocol",
    },

    // Token 相关端点
    TOKEN: {
      REFRESH: "/token/refresh",
      BATCH_REFRESH: "/token/batch/refresh",
    },

    // Graph API 相关端点
    GRAPH: {
      WEBHOOK: "/graph/webhook",
    },

    // 健康检查端点
    HEALTH: "/health",
  },
} as const;

// Next.js API Routes 配置
export const NEXT_API_CONFIG = {
  // 基础路径
  BASE_PATH: "/api",

  // 端点配置
  ENDPOINTS: {
    // 邮件相关
    MAIL: {
      ACCOUNTS: "/mail/accounts",
      BATCH_ADD_ACCOUNT: "/mail/batch-add-account",
      REFRESH_TOKENS: "/mail/refresh-tokens",
      LATEST: "/mail/latest",
      LATEST_JUNK: "/mail/latest/junk",
      HEALTH: "/mail/health",
    },

    // 认证相关
    AUTH: {
      NEXTAUTH: "/auth/[...nextauth]",
    },

    // 管理员专用 API
    ADMIN: {
      MAIL: {
        BATCH_ADD: "/admin/mail/batch-add",
      },
    },

    // 其他 API
    DEBUG_SESSION: "/debug-session",
    DECRYPT_TOKEN: "/decrypt-token",

    // 卡密验证相关
    CARD: {
      BATCH_VERIFY: "/card/batch-verify",
      VERIFY_AND_CREATE_TRIAL: "/card/verify-and-create-trial",
      REUSABLE_LOGIN: "/card/reusable-login",
    },
  },
} as const;

// 外部服务配置
export const EXTERNAL_SERVICES = {
  SUPABASE: {
    URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },

  NEXTAUTH: {
    URL: process.env.NEXTAUTH_URL || "",
    SECRET: process.env.NEXTAUTH_SECRET || "",
  },
} as const;

// 请求配置
export const REQUEST_CONFIG = {
  // 默认超时时间 (毫秒)
  DEFAULT_TIMEOUT: 30000,

  // 重试配置
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000,
  },

  // 默认请求头
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },
} as const;

/**
 * 构建完整的 GoMailAPI URL
 */
export function buildGoMailApiUrl(endpoint: string): string {
  return `${GO_MAIL_API_CONFIG.BASE_URL}${GO_MAIL_API_CONFIG.BASE_PREFIX}${endpoint}`;
}

/**
 * 构建完整的 Next.js API URL
 */
export function buildNextApiUrl(endpoint: string): string {
  return `${NEXT_API_CONFIG.BASE_PATH}${endpoint}`;
}
