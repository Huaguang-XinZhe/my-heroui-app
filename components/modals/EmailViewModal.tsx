"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Email } from "@/types/email";
import { getFaviconUrl, formatEmailDate } from "@/utils/utils";
import { EmailSnippet } from "@/components/email/EmailSnippet";

interface EmailViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: Email | null;
}

export function EmailViewModal({
  isOpen,
  onClose,
  email,
}: EmailViewModalProps) {
  if (!email) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-dark-card",
        header: "border-b border-dark-border",
        body: "p-0",
        footer: "border-t border-dark-border",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2 p-4">
          {/* 邮件标题和品牌图标 */}
          <div className="flex items-center gap-3">
            <Image
              alt={email.subject}
              src={getFaviconUrl(email.from.address)}
              className="h-8 w-8 flex-shrink-0 rounded"
              width={32}
            />
            <h2 className="flex-1 text-lg font-bold text-gray-100">
              {email.subject}
            </h2>
          </div>

          {/* 邮件信息 */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-12 text-xs font-medium text-gray-500">
                发件人:
              </span>
              <EmailSnippet email={email.from.address} className="flex-1" />
              {email.from.name && (
                <span className="text-xs text-gray-400">
                  （{email.from.name}）
                </span>
              )}
            </div>

            {/* 收件人信息 */}
            <div className="flex items-center gap-2">
              <span className="w-12 text-xs font-medium text-gray-500">
                收件人:
              </span>
              <EmailSnippet email={email.to.address} className="flex-1" />
              {email.to.name && (
                <span className="text-xs text-gray-400">
                  （{email.to.name}）
                </span>
              )}
            </div>

            {/* 时间信息 */}
            <div className="flex items-center gap-2">
              <span className="w-12 text-xs font-medium text-gray-500">
                时间:
              </span>
              <span className="text-xs text-gray-300">
                {formatEmailDate(email.date)}
              </span>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          <ScrollShadow hideScrollBar size={20}>
            <div className="p-4">
              {/* 邮件内容容器 - 提升对比度 */}
              <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
                {email.html ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: email.html }}
                    style={{
                      // 确保邮件内容正确显示
                      background: "white",
                      color: "#111827", // 更深的文字颜色，提升对比度
                    }}
                  />
                ) : email.text ? (
                  <pre className="whitespace-pre-wrap text-gray-900">
                    {email.text}
                  </pre>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    暂无邮件内容
                  </div>
                )}
              </div>
            </div>
          </ScrollShadow>
        </ModalBody>

        <ModalFooter className="p-4">
          <Button
            color="primary"
            variant="flat"
            onPress={onClose}
            className="ml-auto"
          >
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
