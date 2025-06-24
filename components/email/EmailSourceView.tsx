"use client";

import Editor, { Monaco } from "@monaco-editor/react";
import { nordDeepTheme } from "@/lib/themes/nord-deep";
import {
  htmlTagSnippets,
  htmlAttributeSnippets,
} from "@/lib/monaco/html-snippets";
import { useBackground } from "@/contexts/BackgroundContext";
import { useEffect, useRef } from "react";

export function EmailSourceView({ html }: { html: string }) {
  const { toggleTopRightEffect } = useBackground();

  // 在组件挂载时隐藏右上角光效，卸载时恢复
  useEffect(() => {
    toggleTopRightEffect();

    // 组件卸载时恢复右上角光效
    return () => {
      toggleTopRightEffect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 在编辑器实例准备好后格式化 HTML
  const handleEditorDidMount = (editor: any) => {
    // 让编辑器获取焦点
    editor.focus();

    // 短暂延迟后模拟快捷键 Shift+Alt+F 格式化文档
    setTimeout(() => {
      // 模拟键盘事件，触发格式化快捷键
      editor.trigger("keyboard", "editor.action.formatDocument", null);
    }, 100); // 延迟为 0 有时候也可以❗
  };

  // 初始化编辑器时应用主题并配置语言服务
  function handleEditorWillMount(monaco: Monaco) {
    // 定义 Nord Deep 主题
    monaco.editor.defineTheme("nordDeep", nordDeepTheme);

    // 启用 HTML 语言服务 (Monaco 已内置对 HTML 的支持)
    // 注意：由于类型定义限制，我们这里不配置 HTMLFormatConfiguration
    // 改用编辑器实例选项来控制格式化行为

    // 可以添加自定义片段到内置的语言服务中
    monaco.languages.registerCompletionItemProvider("html", {
      // 提供我们自定义的代码片段
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        // 提供所有的 HTML 标签片段
        const snippets = htmlTagSnippets.map((tag) => ({
          label: tag.label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: tag.insertText,
          range: range,
          detail: tag.label.startsWith("email:")
            ? `邮件模板: ${tag.label}`
            : `HTML 标签: ${tag.label}`,
          documentation: {
            value:
              tag.documentation ||
              (tag.label.startsWith("email:")
                ? `添加 ${tag.label} 邮件模板元素`
                : `添加 <${tag.label}> 标签`),
          },
        }));

        return {
          suggestions: snippets,
        };
      },
    });

    // 添加属性补全
    monaco.languages.registerCompletionItemProvider("html", {
      triggerCharacters: [" ", "=", '"', "'", "<"],
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        // 如果在标签内部，提供属性补全
        if (/<[^>]*$/.test(textUntilPosition)) {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          const attributeSuggestions = htmlAttributeSnippets.map((attr) => ({
            label: attr.label,
            kind: monaco.languages.CompletionItemKind.Property,
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            insertText: attr.insertText,
            range: range,
            detail: `HTML 属性: ${attr.label}`,
            documentation: {
              value: attr.documentation || `添加 ${attr.label} 属性`,
            },
          }));

          return {
            suggestions: attributeSuggestions,
          };
        }

        return { suggestions: [] };
      },
    });
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage="html"
        value={html}
        theme="nordDeep"
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        options={{
          // 外观配置
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: "on",
          wordWrap: "on",
          automaticLayout: true,
          guides: { indentation: true },
          fontFamily: "JetBrains Mono, Menlo, Monaco, 'Courier New', monospace",
          // fontLigatures: true, // 连字显示
          padding: { top: 20, bottom: 20 },

          // 光标和选择配置
          cursorStyle: "line",
          cursorWidth: 3,
          cursorBlinking: "expand",
          renderLineHighlightOnlyWhenFocus: false, // 即使失去焦点也显示当前行高亮
          smoothScrolling: true, // 平滑滚动效果

          // 代码折叠和导航
          folding: true,
          foldingStrategy: "auto",
          foldingHighlight: true,
          links: true, // 自动识别链接

          // 编辑器基础设置
          tabSize: 2,
          quickSuggestions: true, // 启用快速建议
          // renderWhitespace: "boundary", // 仅在边界处显示空白符
          renderControlCharacters: true,
          colorDecorators: true, // 颜色装饰器

          // 智能补全设置
          suggest: {
            snippetsPreventQuickSuggestions: false, // 允许在片段内触发建议
            showIcons: true,
            preview: true,
            filterGraceful: true,
            localityBonus: true,
          },

          // HTML 专属配置
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          autoIndent: "full",
          formatOnPaste: true,
          formatOnType: true,
        }}
        onChange={(value) => {
          // 如果需要编辑功能，可以在这里处理变更
        }}
        className="source-view-editor"
      />
    </div>
  );
}
