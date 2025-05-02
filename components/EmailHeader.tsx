import React from "react";

interface EmailHeaderProps {
  topic: string;
  sender: string;
  recipient: string;
  date: string;
}

export const EmailHeader: React.FC<EmailHeaderProps> = ({
  topic,
  sender,
  recipient,
  date,
}) => {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold">{topic}</h1>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">
          {sender} → {recipient}
        </span>
        <span className="mr-2 text-sm text-gray-500">{date}</span>
      </div>
    </div>
  );
};
