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
import { IconPlusCircle, IconClose, IconCheck } from "./icons/icons";
import { NumberedListItem } from "./NumberedListItem";
import { ProtocolSelector } from "./ProtocolSelector";
import { ProtocolType, CachedEmailInfo } from "@/types/email";
import {
  parseEmailInput,
  parseEmailLine,
  countValidEmailLines,
} from "@/utils/emailParser";
import { batchAddAccounts } from "@/api/mailService";
import { addEmailsToCache } from "@/utils/emailCache";
import { filterNewEmails } from "@/utils/utils";
import {
  showSuccessToast,
  showWarningToast,
  showErrorToast,
} from "@/utils/toast";
import { FailureDetailsModal } from "./FailureDetailsModal";
import { FromOthersResult, ErrorResult } from "@/types/email";

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
  const [emailInput, setEmailInput] = useState("");
  const [protocolType, setProtocolType] = useState<ProtocolType>("UNKNOWN");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFailureDetails, setShowFailureDetails] = useState(false);
  const [failureData, setFailureData] = useState<{
    fromOthers: FromOthersResult[];
    errors: ErrorResult[];
  }>({ fromOthers: [], errors: [] });

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

            <div className="mb-2">
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
                placeholder="每行一条四件套或 refreshToken"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                disabled={isSubmitting}
              ></textarea>
            </div>

            <div className="mb-2 rounded-lg border-l-4 border-indigo-500 bg-indigo-900/20 p-4 text-sm text-gray-300">
              <p className="mb-2 font-medium text-indigo-400">格式说明：</p>
              <NumberedListItem number={1} className="mb-1">
                完整四件套格式：邮箱----密码----clientId----refreshToken
              </NumberedListItem>
              <NumberedListItem number={2}>
                简化格式：邮箱----refreshToken（clientId 默认为雷鸟）
              </NumberedListItem>
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
