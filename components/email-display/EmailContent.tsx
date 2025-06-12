import { Email } from "@/types/email";
import { extractCodeFromEmail } from "@/utils/codeExtractor";
import { EmailContentVerification } from "./EmailContentVerification";
import { EmailContentText } from "./EmailContentText";

interface EmailContentProps {
  email: Email;
}

export function EmailContent({ email }: EmailContentProps) {
  const codeInfo = extractCodeFromEmail(email.text, email.html);

  // 如果有验证码，显示验证码视图
  if (codeInfo.code) {
    return (
      <EmailContentVerification
        code={codeInfo.code}
        expiryMinutes={codeInfo.expiryMinutes}
      />
    );
  }

  // 否则显示文本/HTML 内容
  return <EmailContentText text={email.text} html={email.html} />;
}
