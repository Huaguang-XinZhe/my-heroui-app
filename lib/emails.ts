import { Email } from "@/types";
import { getEmailTemplate } from "./actions";

// 示例邮件数据
export const emails: Email[] = [
  {
    id: "amazon-1",
    topic: "Amazon 注册成功",
    sender: "service@amazon.com",
    recipient: "user@example.com",
    icon: "https://www.amazon.com/favicon.ico",
    date: "2023-06-10 14:30",
    code: "842913",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1024px-Amazon_logo.svg.png" alt="Amazon" style="width: 120px;">
        </div>
        <h2 style="color: #232f3e;">您的 Amazon 验证码</h2>
        <p>尊敬的用户，</p>
        <p>感谢您注册 Amazon 账户。请使用以下验证码完成注册流程：</p>
        <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          842913
        </div>
        <p>此验证码将在 10 分钟内有效。</p>
        <p>如果您没有尝试注册 Amazon 账户，请忽略此邮件。</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
          <p>© 2023 Amazon.com, Inc. 或其附属公司。保留所有权利。</p>
          <p>Amazon、Amazon.com 和 Amazon.com 徽标是 Amazon.com, Inc. 或其附属公司的商标。</p>
        </div>
      </div>
    `,
  },
  {
    id: "google-1",
    topic: "Google 安全验证",
    sender: "no-reply@google.com",
    recipient: "user@example.com",
    icon: "https://www.google.com/favicon.ico",
    date: "2023-06-15 09:45",
    code: "195824",
    html: `
      <div style="font-family: 'Google Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #202124;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png" alt="Google" style="width: 120px;">
        </div>
        <h2 style="color: #202124; font-weight: 500;">Google 验证码</h2>
        <p>您好，</p>
        <p>我们收到了您的 Google 账号验证请求。请使用以下验证码：</p>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 8px;">
          195824
        </div>
        <p>此验证码将在 10 分钟内有效。</p>
        <p>如果您没有请求此验证码，可能是有人误输入了您的电子邮件地址。您可以安全地忽略此邮件。</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f3f4; font-size: 12px; color: #5f6368;">
          <p>此电子邮件是发送给您的，因为您请求了 Google 账号验证码。</p>
          <p>© 2023 Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA</p>
        </div>
      </div>
    `,
  },
  {
    id: "github-1",
    topic: "GitHub 双重认证",
    sender: "noreply@github.com",
    recipient: "developer@example.com",
    icon: "https://github.com/favicon.ico",
    date: "2023-06-20 16:15",
    code: "721038",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #24292e;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Logo.png" alt="GitHub" style="width: 120px;">
        </div>
        <h2 style="color: #24292e;">GitHub 双重认证码</h2>
        <p>您好，</p>
        <p>您的 GitHub 登录验证码是：</p>
        <div style="background-color: #f6f8fa; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 6px; border: 1px solid #e1e4e8;">
          721038
        </div>
        <p>此验证码将在 10 分钟内有效。</p>
        <p>如果您没有尝试登录，请立即更改您的密码并启用双重认证以保护您的账户。</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e4e8; font-size: 12px; color: #6a737d;">
          <p>GitHub, Inc. ・88 Colin P Kelly Jr Street ・San Francisco, CA 94107</p>
          <p>如果您对此有任何疑问，请联系 <a href="mailto:support@github.com" style="color: #0366d6;">support@github.com</a>。</p>
        </div>
      </div>
    `,
  },
  {
    id: "trae",
    topic: "Trae 注册成功",
    sender: "service@trae.com",
    recipient: "user@example.com",
    icon: "https://www.trae.com/favicon.ico",
    date: "2023-06-25 10:30",
    code: "123456",
    html: `
      <div>
        <h1>Trae 注册成功</h1>
        <p>感谢您注册 Trae 账户。请使用以下验证码完成注册流程：</p>
        <div>123456</div>
      </div>
    `,
  },
  {
    id: "fengzi",
    topic: "Fengzi 注册成功",
    sender: "service@fengzi.com",
    recipient: "user@example.com",
    icon: "https://www.fengzi.com/favicon.ico",
    date: "2023-06-25 10:30",
    code: "123456",
    html: `
      <div>
        <h1>Fengzi 注册成功</h1>
        <p>感谢您注册 Fengzi 账户。请使用以下验证码完成注册流程：</p>
        <div>123456</div>
      </div>`,
  },
  {
    id: "binance",
    topic: "Binance 注册成功",
    sender: "service@binance.com",
    recipient: "user@example.com",
    icon: "https://www.binance.com/favicon.ico",
    date: "2023-06-25 10:30",
    code: "123456",
    html: `
      <div>
        <h1>Binance 注册成功</h1>
        <p>感谢您注册 Binance 账户。请使用以下验证码完成注册流程：</p>
        <div>123456</div>
      </div>
    `,
  },
  {
    id: "slack",
    topic: "Slack 注册成功",
    sender: "service@slack.com",
    recipient: "user@example.com",
    icon: "https://www.slack.com/favicon.ico",
    date: "2023-06-25 10:30",
    code: "123456",
    html: `
      <div>
        <h1>Slack 注册成功</h1>
        <p>感谢您注册 Slack 账户。请使用以下验证码完成注册流程：</p>
        <div>123456</div>
      </div>
    `,
  },
];

// 根据 ID 获取邮件
export function getEmailById(id: string): Email | null {
  return emails.find((email) => email.id === id) || null;
}

// 获取邮件（包含从文件加载的 HTML）
export async function getEmailWithHtml(id: string): Promise<Email | null> {
  const email = getEmailById(id);
  if (!email) return null;

  const html = await getEmailTemplate(id);
  return {
    ...email,
    html: html || email.html, // 如果文件加载失败，使用默认的 HTML
  };
}
