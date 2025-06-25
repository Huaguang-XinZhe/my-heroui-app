// ============================================
// 重新导出所有工具函数 - 保持向后兼容性
// ============================================

// 邮箱相关工具函数
export {
  filterNewEmails,
  getFaviconUrl,
  parseEmail,
  truncateEmail,
  isEmailTruncated,
} from "./emailUtils";

// 日期时间相关工具函数
export { getTimeDisplay, formatEmailDate } from "./dateUtils";

// 文本处理相关工具函数
export { cleanText } from "./textUtils";

// 存储和数据清理相关工具函数
export {
  clearAllCookies,
  clearAllStorage,
  clearAllCache,
  clearAllUserData,
} from "./storageUtils";

// 卡密显示相关工具函数
export {
  formatCardKeyDisplay,
  copyCardKeyWithToast,
  getCardKeyIdentifier,
} from "./cardKeyDisplay";

// 邀请链接工具函数（仅客户端安全函数）
export {
  getInviteUsageStats,
  clearInviteUsages,
  formatInviteDisplay,
} from "./inviteUtils";

// 注意：所有加密相关函数（generateInviteToken, parseInviteToken, verifyInviteToken,
// useInviteToken, createQuickInvite, generateInviteUrl）已移除客户端访问，
// 必须通过服务端 API 调用

// 注意：所有加密工具函数（simpleEncrypt, simpleDecrypt, createSimpleChecksum,
// addBase64Padding, generateToken, parseToken）已移除客户端访问，
// 因为它们依赖服务端私钥
