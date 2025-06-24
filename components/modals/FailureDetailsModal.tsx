"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { IconClose, IconWarning, IconRefresh } from "@/components/icons/icons";
import { FromOthersResult, ErrorResult } from "@/types/email";

interface FailureDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromOthers: FromOthersResult[];
  errors: ErrorResult[];
  onRetry?: (unbannedEmails: string[]) => void;
}

export function FailureDetailsModal({
  isOpen,
  onClose,
  fromOthers,
  errors,
  onRetry,
}: FailureDetailsModalProps) {
  // 计算可重试的邮箱（未被封禁的错误邮箱）
  const retryableEmails = errors
    .filter((item) => !item.isBanned)
    .map((item) => item.email);
  const bannedErrorCount = errors.filter((item) => item.isBanned).length;
  const bannedFromOthersCount = fromOthers.filter(
    (item) => item.isBanned,
  ).length;

  const handleRetry = () => {
    if (onRetry && retryableEmails.length > 0) {
      onRetry(retryableEmails);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-dark-card",
        body: "px-6 py-4",
        closeButton: "top-5 end-4 hover:bg-dark-hover",
      }}
    >
      <ModalContent>
        <ModalHeader className="mt-2 flex items-center text-2xl font-semibold text-amber-500">
          <IconWarning className="mr-2 text-amber-500" />
          失败详情
        </ModalHeader>

        <ModalBody>
          {/* 来自别人账户的邮箱 */}
          {fromOthers.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-medium text-gray-200">
                💡 {fromOthers.length} 个来自别人账户（其中有{" "}
                {bannedFromOthersCount} 个被封禁）
              </h3>
              <div className="mb-3 rounded-lg border border-orange-600/30 bg-orange-900/20 p-3 text-sm text-orange-300">
                <p>这些邮箱已被其他用户添加使用，无法重复添加到你的账户中。</p>
              </div>
              <div className="space-y-2">
                {fromOthers.slice(0, 4).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-orange-600/30 bg-orange-900/20 p-3"
                  >
                    <span className="font-mono text-sm text-gray-300">
                      {item.email}
                    </span>
                    {item.isBanned && (
                      <Chip color="danger" size="sm" variant="flat">
                        已封禁
                      </Chip>
                    )}
                  </div>
                ))}
                {fromOthers.length > 4 && (
                  <p className="mt-2 text-xs text-gray-400">
                    …等 {fromOthers.length - 4} 个
                  </p>
                )}
              </div>
            </div>
          )}

          {/* API 调用错误部分 */}
          {errors.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-medium text-gray-200">
                💡 {errors.length} 个 API 调用错误（新发现 {bannedErrorCount}{" "}
                个被封禁）
              </h3>
              <div className="space-y-3">
                {errors.slice(0, 3).map((item, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-red-600/30 bg-red-900/20 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-sm text-gray-300">
                        {item.email}
                      </span>
                      {item.isBanned && (
                        <Chip color="danger" size="sm" variant="flat">
                          已封禁
                        </Chip>
                      )}
                    </div>
                    <div className="rounded bg-gray-800/50 p-2">
                      <p className="text-xs text-gray-400">{item.error}</p>
                    </div>
                  </div>
                ))}
                {errors.length > 3 && (
                  <p className="text-xs text-gray-400">
                    …等 {errors.length - 3} 个
                  </p>
                )}
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter className="space-x-2">
          <Button onPress={onClose} variant="flat" startContent={<IconClose />}>
            关闭
          </Button>

          {retryableEmails.length > 0 && (
            <Tooltip
              content={`重试 ${retryableEmails.length} 个未被封禁的邮箱`}
              placement="top"
              showArrow
            >
              <Button
                onPress={handleRetry}
                color="primary"
                variant="flat"
                startContent={<IconRefresh />}
              >
                重试
              </Button>
            </Tooltip>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
