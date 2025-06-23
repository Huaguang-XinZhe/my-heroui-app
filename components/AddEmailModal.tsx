"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import {
  IconPlusCircle,
  IconClose,
  IconCheck,
  IconEye,
  IconFile,
  IconUpload,
} from "./icons/icons";
import { ProtocolSelector } from "./ProtocolSelector";
import { ProtocolType, CachedEmailInfo } from "@/types/email";
import {
  parseEmailInput,
  parseEmailLine,
  countValidEmailLines,
} from "@/utils/emailParser";
import { batchAddAccounts } from "@/api/mailService";
import { addEmailsToCache } from "@/cache/emailCache";
import { filterNewEmails } from "@/utils/utils";
import {
  showSuccessToast,
  showWarningToast,
  showErrorToast,
} from "@/utils/toast";
import { FailureDetailsModal } from "./FailureDetailsModal";
import { FromOthersResult, ErrorResult } from "@/types/email";
import { useFormatGuide } from "@/contexts/FormatGuideContext";

interface AddEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (emails: CachedEmailInfo[]) => void;
}

export function AddEmailModal({
  isOpen,
  onClose,
  onSuccess,
}: AddEmailModalProps) {
  const { showFormatGuide, toggleFormatGuide, setShowFormatGuide } =
    useFormatGuide();
  const [emailInput, setEmailInput] = useState("");
  const [protocolType, setProtocolType] = useState<ProtocolType>("IMAP");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFailureDetails, setShowFailureDetails] = useState(false);
  const [failureData, setFailureData] = useState<{
    fromOthers: FromOthersResult[];
    errors: ErrorResult[];
  }>({ fromOthers: [], errors: [] });
  const [isDragOver, setIsDragOver] = useState(false);

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

  const handleSubmit = async () => {
    if (!emailInput.trim()) {
      showWarningToast("邮箱信息不能为空！", "请在文本框中输入邮箱数据");
      return;
    }

    setIsSubmitting(true);

    try {
      // 解析输入的邮箱数据为 MailInfo 列表
      const allEmails = parseEmailInput(emailInput, protocolType);

      if (allEmails.length === 0) {
        showWarningToast(
          "格式错误",
          "未能解析出有效的邮箱信息，请检查输入格式",
        );
        return;
      }

      // 过滤已缓存的邮箱
      const { newEmails, existingEmails } = filterNewEmails(allEmails);

      // 如果没有新邮箱，直接返回
      if (newEmails.length === 0) {
        showWarningToast("无新邮箱", "所有邮箱都已存在，无需重复添加");
        return;
      }

      // 如果有重复的邮箱，显示警告
      if (existingEmails.length > 0) {
        showWarningToast(
          `发现 ${existingEmails.length} 个重复邮箱`,
          `已跳过重复的邮箱，将只添加 ${newEmails.length} 个新邮箱`,
        );
      }

      // 发送批量添加请求
      const result = await batchAddAccounts({
        mailInfos: newEmails,
        refreshNeeded: false, // todo 暂时设为 false，免得触发风控，之后要调回来
      });

      if (result.success && result.data) {
        const { fromOthers, errors, successes } = result.data;

        // 将成功添加的邮箱缓存起来
        // todo 成功 Item 和缓存 Item 一致，可以优化
        const successfulEmails: CachedEmailInfo[] = successes.map((item) => ({
          email: item.email,
          refreshToken: item.refreshToken,
          protocolType: item.protocolType,
        }));

        if (successfulEmails.length > 0) {
          addEmailsToCache(successfulEmails);
        }

        // 处理结果显示
        // 失败个数
        const failureCount = fromOthers.length + errors.length;

        const viewButton = (
          <Button
            size="sm"
            variant="flat"
            onPress={() => {
              setFailureData({ fromOthers, errors });
              setShowFailureDetails(true);
            }}
          >
            view
          </Button>
        );

        if (failureCount === 0) {
          // 全部成功
          showSuccessToast(`全部成功`, `${successes.length} 个邮箱添加成功`);
        } else if (successes.length > 0) {
          // 部分成功
          showWarningToast(
            `${failureCount} 个失败，${successes.length} 个成功`,
            undefined,
            viewButton,
          );
        } else {
          // 全部失败
          showErrorToast(`全部失败`, undefined, viewButton);
        }

        // 清空输入并关闭模态框
        setEmailInput("");
        setProtocolType("UNKNOWN");
        // 成功后隐藏格式说明
        setShowFormatGuide(false);
        onSuccess?.(successfulEmails);
        onClose();
      } else {
        showErrorToast("添加失败", result.error || "未知错误");
      }
    } catch (error) {
      showErrorToast("提交失败", "请检查网络连接并稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = async (unbannedEmails: string[]) => {
    // 从原始输入中找到对应的邮箱信息行
    const originalLines = emailInput.split("\n");
    const retryLines = originalLines.filter((line) => {
      const parsedData = parseEmailLine(line.trim());
      return parsedData && unbannedEmails.includes(parsedData.email);
    });

    // 将未被封禁的邮箱重新填入输入框
    const emailsText = retryLines.join("\n");
    setEmailInput(emailsText);
    setShowFailureDetails(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setEmailInput("");
      setProtocolType("UNKNOWN");
      setIsDragOver(false);
      // 关闭弹窗时隐藏格式说明
      setShowFormatGuide(false);
      onClose();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        // backdrop="blur"
        classNames={{
          base: "w-[90%] max-w-[600px] bg-dark-card",
          body: "px-6 py-4",
          closeButton: "top-5 end-4 hover:bg-dark-hover",
        }}
      >
        <ModalContent>
          <ModalHeader className="mt-2 flex items-center text-2xl font-semibold text-indigo-500">
            <IconPlusCircle className="mr-2 text-indigo-500" />
            添加新邮箱
          </ModalHeader>

          <ModalBody>
            <ProtocolSelector value={protocolType} onChange={setProtocolType} />

            <div
              className={`relative mb-2 ${isDragOver ? "bg-indigo-500/10 ring-2 ring-indigo-500" : ""} rounded-xl transition-all`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  邮箱信息
                </label>
                <span className="text-xs text-gray-400">
                  {countValidEmailLines(emailInput)} 条
                </span>
              </div>
              <textarea
                className="h-40 w-full resize-none rounded-xl border border-dark-border bg-dark-input px-4 py-3 text-gray-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={
                  isDragOver
                    ? "松开鼠标导入文件..."
                    : "每行一条邮箱数据，一般为四件套或六件套，邮箱和刷新令牌必须，其余可选，以 ---- 分隔\n\n💡 提示：也可以直接拖拽 .txt 或 .csv 文件到此处"
                }
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

            {/* 操作按钮区域 */}
            <div className="mt-3 flex justify-center gap-3">
              <Button
                variant="flat"
                size="sm"
                onPress={toggleFormatGuide}
                startContent={<IconEye className="h-4 w-4" />}
                className="bg-dark-hover hover:bg-dark-border"
              >
                {showFormatGuide ? "隐藏格式说明" : "查看格式说明"}
              </Button>

              <input
                type="file"
                accept=".txt,.csv,text/plain"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
                disabled={isSubmitting}
              />
              <Button
                as="label"
                htmlFor="file-input"
                variant="flat"
                size="sm"
                startContent={<IconUpload className="h-4 w-4" />}
                className="cursor-pointer bg-dark-hover hover:bg-dark-border"
                isDisabled={isSubmitting}
              >
                选择文件导入
              </Button>
            </div>
          </ModalBody>

          <ModalFooter className="space-x-2">
            <Button
              onPress={handleClose}
              variant="flat"
              startContent={<IconClose />}
              isDisabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              onPress={handleSubmit}
              color="primary"
              startContent={isSubmitting ? null : <IconCheck />}
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
            >
              {isSubmitting ? "添加中..." : "添加"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 失败详情弹窗 */}
      <FailureDetailsModal
        isOpen={showFailureDetails}
        onClose={() => setShowFailureDetails(false)}
        fromOthers={failureData.fromOthers}
        errors={failureData.errors}
        onRetry={handleRetry}
      />
    </>
  );
}
