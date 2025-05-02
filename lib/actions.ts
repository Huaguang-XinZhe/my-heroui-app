"use server";

import fs from "fs/promises";
import path from "path";
import { getEmailById } from "./emails";

/**
 * 从文件系统读取邮件 HTML 模板
 */
export async function getEmailTemplate(id: string): Promise<string | null> {
  try {
    // 先检查邮件是否存在
    const email = getEmailById(id);
    if (!email) {
      console.error(`Email with ID ${id} not found`);
      return null;
    }

    try {
      // 尝试从文件系统读取 HTML 模板
      const filePath = path.join(
        process.cwd(),
        "public",
        "emails",
        `${id}.html`,
      );
      const content = await fs.readFile(filePath, "utf-8");
      return content;
    } catch (fileError) {
      // 如果文件不存在，返回邮件对象中的 HTML
      console.log(`HTML file for email ${id} not found, using default HTML`);
      return email.html;
    }
  } catch (error) {
    console.error("Error loading email template:", error);
    return null;
  }
}

export async function getHtmlById(id: string): Promise<string | null> {
  const filePath = path.join(process.cwd(), "public", "emails", `${id}.html`);
  const content = await fs.readFile(filePath, "utf-8");
  return content;
}
