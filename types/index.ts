export type IconProps = {
  className?: string;
};

// 邮件数据模型
export interface Email {
  id: string;
  topic: string;
  sender: string;
  recipient: string;
  icon?: string;
  date: string;
  code?: string;
  html: string;
}
