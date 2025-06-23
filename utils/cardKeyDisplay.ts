/**
 * 格式化卡密显示
 * @param cardKey 完整卡密
 * @param showLength 显示的字符数，默认显示后6位
 * @returns 格式化后的显示文本
 */
export function formatCardKeyDisplay(
  cardKey: string,
  showLength: number = 6,
): string {
  if (!cardKey) return "未知";

  const preview =
    cardKey.length > showLength
      ? cardKey.substring(0, showLength) + "..."
      : cardKey;

  return preview;
}

/**
 * 复制卡密到剪贴板并显示提示
 * @param cardKey 要复制的卡密
 * @param showToast 显示 toast 的函数
 * @param previewLength 提示中显示的卡密长度，默认30个字符
 */
export function copyCardKeyWithToast(
  cardKey: string,
  showToast: (title: string, description?: string) => void,
  showLength: number = 30,
): void {
  if (!cardKey) {
    showToast("复制失败", "卡密为空");
    return;
  }

  navigator.clipboard.writeText(cardKey);

  const preview = formatCardKeyDisplay(cardKey, showLength);

  showToast("卡密已复制", preview);
}

/**
 * 获取卡密的显示标识（用于用户头像等）
 * @param cardKey 完整卡密
 * @returns 简短的显示标识
 */
export function getCardKeyIdentifier(cardKey: string): string {
  if (!cardKey) return "未知";

  // 取卡密的前2位和后4位，中间用*代替
  if (cardKey.length <= 6) {
    return cardKey;
  }

  const prefix = cardKey.substring(0, 2);
  const suffix = cardKey.slice(-4);
  return `${prefix}***${suffix}`;
}
