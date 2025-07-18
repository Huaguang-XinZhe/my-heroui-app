"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { IconPlusCircle, IconClose, IconCheck } from "@/components/icons/icons";
import { EmailInputSection } from "@/components/email/EmailInputSection";
import { ProtocolType, CachedEmailInfo, TrialAccount } from "@/types/email";
import { parseEmailInput, parseEmailLine } from "@/utils/emailParser";
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
import { useSession } from "next-auth/react";
import { getOAuthUser } from "@/utils/oauthUserStorage";

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
  const [protocolType, setProtocolType] = useState<ProtocolType>("UNKNOWN");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFailureDetails, setShowFailureDetails] = useState(false);
  const [failureData, setFailureData] = useState<{
    fromOthers: FromOthersResult[];
    errors: ErrorResult[];
  }>({ fromOthers: [], errors: [] });

  const { data: session } = useSession();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 获取当前用户 ID
  useEffect(() => {
    let userId: string | null = null;

    // 1. 检查是否是体验账户
    const trialAccountData = localStorage.getItem("trialAccount");
    if (trialAccountData) {
      try {
        const trialAccount: TrialAccount = JSON.parse(trialAccountData);
        // 体验账户使用卡密作为用户 ID
        userId = trialAccount.cardData?.originalCardKey || null;
      } catch (error) {
        console.error("解析体验账户数据失败:", error);
      }
    }

    // 2. 检查是否是 OAuth 登录
    if (!userId && session?.user) {
      const sessionUser = session.user as any;
      if (sessionUser.userId) {
        userId = sessionUser.userId;
      }
    }

    // 3. 从本地存储获取 OAuth 用户信息
    if (!userId) {
      const oauthUser = getOAuthUser();
      if (oauthUser) {
        userId = oauthUser.id;
      }
    }

    setCurrentUserId(userId);
  }, [session]);

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

      // 检查是否有用户 ID
      if (!currentUserId) {
        showErrorToast("用户身份验证失败", "请重新登录后再试");
        return;
      }

      // 发送批量添加请求
      const result = await batchAddAccounts({
        mailInfos: newEmails,
        refreshNeeded: false, // 首次添加时暂不刷新 refresh_token
        user_id: currentUserId, // 传递用户 ID
      });

      if (result.success && result.data) {
        const { fromOthers, errors, successes } = result.data;

        // 将成功添加的邮箱缓存起来，包含密码和服务提供商信息
        const successfulEmails: CachedEmailInfo[] = successes.map((item) => {
          // 从原始输入中找到对应的完整邮箱信息
          const originalMailInfo = newEmails.find(
            (email) => email.email === item.email,
          );

          return {
            email: item.email,
            refreshToken: item.refreshToken,
            protocolType: item.protocolType,
            password: originalMailInfo?.password,
            serviceProvider: originalMailInfo?.serviceProvider || "MICROSOFT",
            user_id: currentUserId,
          };
        });

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
            <EmailInputSection
              emailInput={emailInput}
              setEmailInput={setEmailInput}
              protocolType={protocolType}
              setProtocolType={setProtocolType}
              showFormatGuide={showFormatGuide}
              toggleFormatGuide={toggleFormatGuide}
              isSubmitting={isSubmitting}
            />
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
