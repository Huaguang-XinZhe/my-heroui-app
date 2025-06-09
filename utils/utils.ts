import { MailInfo } from "@/types/email";
import { getCachedEmails } from "./emailCache";

export function filterNewEmails(mailInfos: MailInfo[]): {
  newEmails: MailInfo[];
  existingEmails: MailInfo[];
} {
  const cachedEmails = getCachedEmails();
  const cachedTokens = new Set(cachedEmails.map((email) => email.refreshToken));

  const newEmails: MailInfo[] = [];
  const existingEmails: MailInfo[] = [];

  mailInfos.forEach((mailInfo) => {
    if (cachedTokens.has(mailInfo.refreshToken)) {
      existingEmails.push(mailInfo);
    } else {
      newEmails.push(mailInfo);
    }
  });

  return { newEmails, existingEmails };
}
