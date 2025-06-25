"use client";

import {
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";
import { use } from "react";
import { EmailContent } from "@/components/email/EmailContentMain";
import { EmailHeader } from "@/components/email/EmailHeader";
import { EmailRenderView } from "@/components/email/EmailRenderView";

export default function EmailModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);

  // 关闭模态框时返回上一页
  const onClose = () => {
    router.back();
  };

  // 查看源代码
  const handleViewSource = () => {
    // 使用 window.location 强制导航，绕过 Next.js 路由系统
    window.location.href = `/emails/${resolvedParams.id}`;
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      scrollBehavior="inside"
      size="2xl"
      // isDismissable={false}
      backdrop="blur"
      classNames={{
        base: "bg-dark-card",
        header: "flex flex-col gap-2",
        closeButton: "hover:bg-dark-hover top-3 end-3",
      }}
    >
      <ModalContent>
        {/* 在 HeroUI 的 Modal 的 ModalContent 中，不能再套一个 div 包裹 Header、Body、Footer，否则样式会出现异常❗ */}
        {/* 这个 EmailContent 在 className 为空的情况下，直接返回 children❗ */}
        <EmailContent id={resolvedParams.id}>
          {(email) => (
            <>
              <ModalHeader>
                <EmailHeader
                  topic={email.topic}
                  sender={email.sender}
                  recipient={email.recipient}
                  date={email.date}
                />
              </ModalHeader>
              <ModalBody>
                <EmailRenderView html={email.html} className="h-[500px]" />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  关闭
                </Button>
                <Button color="primary" onPress={handleViewSource}>
                  查看源代码
                </Button>
              </ModalFooter>
            </>
          )}
        </EmailContent>
      </ModalContent>
    </Modal>
  );
}
