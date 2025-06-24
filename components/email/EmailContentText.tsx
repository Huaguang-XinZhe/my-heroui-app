import { cleanText } from "@/utils/utils";

interface EmailContentTextProps {
  text?: string;
  html?: string;
}

export function EmailContentText({ text, html }: EmailContentTextProps) {
  const rawContent = text || html || "暂无内容";
  const contentToShow = cleanText(rawContent);
  const isHtmlContent = !text && html;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-auto rounded-lg bg-dark-hover p-4">
        {isHtmlContent ? (
          <div
            className="text-sm text-gray-300"
            dangerouslySetInnerHTML={{ __html: contentToShow }}
          />
        ) : (
          <pre className="whitespace-pre-wrap text-sm text-gray-300">
            {contentToShow}
          </pre>
        )}
      </div>
    </div>
  );
}
