// 渲染 HTML 视图组件，使用 iframe 隔离样式
import { useRef, useEffect } from "react";

export function EmailRenderView({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const iframeDoc = iframeRef.current.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                /* 自定义滚动条样式 */
                ::-webkit-scrollbar {
                  width: 6px;
                  height: 6px;
                }
                
                ::-webkit-scrollbar-track {
                  background: transparent;
                }
                
                ::-webkit-scrollbar-thumb {
                  background: #374151;
                  border-radius: 3px;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                  background: #4B5563;
                }
              </style>
            </head>
            <body>${html}</body>
          </html>
        `);
        iframeDoc.close();

        // 添加点击事件监听器到 iframe 文档
        iframeDoc.addEventListener("click", (e) => {
          const target = e.target as HTMLElement;
          // 检查点击的是否是链接或链接的子元素
          const linkElement =
            target.tagName === "A" ? target : target.closest("a");

          if (linkElement) {
            e.preventDefault(); // 阻止默认行为
            const href = (linkElement as HTMLAnchorElement).getAttribute(
              "href",
            );
            if (href) {
              // 在父窗口中打开链接
              window.open(href, "_blank", "noopener,noreferrer");
            }
          }
        });
      }
    }
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      // 不要加这个，可能会有边框闪烁的问题❗
      //   className="w-full border-none bg-white"
      title="邮件内容"
      // 允许链接在新窗口/标签页中打开❗
      sandbox="allow-same-origin allow-popups allow-scripts"
      className={`rounded-md ${className}`}
      // 如果没有高度限制，就会使用一个很矮的默认高度❗
      //   style={{ height: "500px" }} // 可根据需要调整高度或使用动态高度
    />
  );
}
