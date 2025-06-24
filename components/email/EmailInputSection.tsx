"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { IconEye, IconFile, IconUpload } from "@/components/icons/icons";
import { ProtocolSelector } from "@/components/ui/ProtocolSelector";
import { ProtocolType } from "@/types/email";
import { countValidEmailLines } from "@/utils/emailParser";
import {
  showSuccessToast,
  showWarningToast,
  showErrorToast,
} from "@/utils/toast";

interface EmailInputSectionProps {
  emailInput: string;
  setEmailInput: (value: string) => void;
  protocolType: ProtocolType;
  setProtocolType: (protocol: ProtocolType) => void;
  showFormatGuide: boolean;
  toggleFormatGuide: () => void;
  isSubmitting?: boolean;
  showProtocolSelector?: boolean;
  showFormatGuideButton?: boolean;
  placeholder?: string;
  height?: string;
}

export function EmailInputSection({
  emailInput,
  setEmailInput,
  protocolType,
  setProtocolType,
  showFormatGuide,
  toggleFormatGuide,
  isSubmitting = false,
  showProtocolSelector = true,
  showFormatGuideButton = true,
  placeholder,
  height = "h-40",
}: EmailInputSectionProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const defaultPlaceholder = isDragOver
    ? "松开鼠标导入文件..."
    : "每行一条邮箱数据，一般为四件套或六件套，邮箱和刷新令牌必须，其余可选，以 ---- 分隔\n\n💡 提示：也可以直接拖拽 .txt 或 .csv 文件到此处";

  // 处理文件内容
  const handleFileContent = (content: string) => {
    // 如果当前已有内容，询问是否替换或追加
    if (emailInput.trim()) {
      const shouldReplace = confirm(
        "已有邮箱数据，是否替换当前内容？（取消将追加到末尾）",
      );
      if (shouldReplace) {
        setEmailInput(content);
      } else {
        setEmailInput(emailInput + "\n" + content);
      }
    } else {
      setEmailInput(content);
    }
  };

  // 处理拖拽事件
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 只有当鼠标真正离开容器时才重置状态
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const textFile = files.find(
      (file) =>
        file.type === "text/plain" ||
        file.name.endsWith(".txt") ||
        file.name.endsWith(".csv"),
    );

    if (!textFile) {
      showWarningToast("文件格式不支持", "请拖拽 .txt 或 .csv 文件");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleFileContent(content);
        showSuccessToast("文件读取成功", `已读取 ${textFile.name}`);
      }
    };
    reader.onerror = () => {
      showErrorToast("文件读取失败", "请检查文件是否损坏");
    };
    reader.readAsText(textFile);
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !file.type.includes("text") &&
      !file.name.endsWith(".txt") &&
      !file.name.endsWith(".csv")
    ) {
      showWarningToast("文件格式不支持", "请选择 .txt 或 .csv 文件");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleFileContent(content);
        showSuccessToast("文件读取成功", `已读取 ${file.name}`);
      }
    };
    reader.onerror = () => {
      showErrorToast("文件读取失败", "请检查文件是否损坏");
    };
    reader.readAsText(file);

    // 清空 input 值，允许重复选择同一文件
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      {showProtocolSelector && (
        <ProtocolSelector value={protocolType} onChange={setProtocolType} />
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">邮箱信息</label>
          <span className="text-xs text-gray-400">
            {countValidEmailLines(emailInput)} 条
          </span>
        </div>
        <div
          className={`relative ${isDragOver ? "bg-indigo-500/10 ring-2 ring-indigo-500" : ""} rounded-xl transition-all`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <textarea
            className={`${height} w-full resize-none rounded-xl border border-dark-border bg-dark-input px-4 py-3 text-gray-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            placeholder={placeholder || defaultPlaceholder}
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            disabled={isSubmitting}
          ></textarea>

          {/* 拖拽提示层 */}
          {isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-dashed border-indigo-400 bg-indigo-500/20 backdrop-blur-sm">
              <div className="text-center">
                <IconFile className="mx-auto mb-2 h-8 w-8 text-indigo-400" />
                <p className="text-sm font-medium text-indigo-300">
                  松开以导入文件
                </p>
                <p className="text-xs text-indigo-400">
                  支持 .txt 和 .csv 格式
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 操作按钮区域 */}
      <div className="flex justify-center gap-3">
        {showFormatGuideButton && (
          <Button
            variant="flat"
            size="sm"
            onPress={toggleFormatGuide}
            startContent={<IconEye className="h-4 w-4" />}
            className="bg-dark-hover hover:bg-dark-border"
          >
            {showFormatGuide ? "隐藏格式说明" : "查看格式说明"}
          </Button>
        )}

        <input
          type="file"
          accept=".txt,.csv,text/plain"
          onChange={handleFileSelect}
          className="hidden"
          id="email-file-input"
          disabled={isSubmitting}
        />
        <Button
          as="label"
          htmlFor="email-file-input"
          variant="flat"
          size="sm"
          startContent={<IconUpload className="h-4 w-4" />}
          className="cursor-pointer bg-dark-hover hover:bg-dark-border"
          isDisabled={isSubmitting}
        >
          选择文件导入
        </Button>
      </div>
    </div>
  );
}
