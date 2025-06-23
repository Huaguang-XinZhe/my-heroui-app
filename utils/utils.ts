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
