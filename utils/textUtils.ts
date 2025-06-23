/**
 * 清理文本两端的不可见字符，包括那些 trim() 无法清除的字符
 * 同时合并多个连续的空行为一个空行
 */
export function cleanText(text: string): string {
  // 定义要清理的字符（按重要性排序）
  const chars = [
    "\\s", // 标准空白字符（空格、换行、制表符等）
    "\\u00A0", // 不间断空格（网页中常见）
    "\\u200B", // 零宽空格（复制粘贴时常带入）
    "\\uFEFF", // 字节顺序标记 BOM
    "\\u00AD", // 软连字符
    "\\u200C", // 零宽不连字符
    "\\u200D", // 零宽连字符
  ].join("");

  // 构造正则：匹配开头或结尾的这些字符
  const trimPattern = new RegExp(`^[${chars}]+|[${chars}]+$`, "g");

  // 先清理两端的不可见字符
  let cleaned = text.replace(trimPattern, "");

  // 合并多个连续的空行为一个空行
  // 匹配多个连续的换行符（包括 \r\n、\n、\r）和空白字符
  cleaned = cleaned.replace(/(?:\r?\n\s*){2,}/g, "\n\n");

  return cleaned;
}
