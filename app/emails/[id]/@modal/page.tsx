"use client";

import { getEmailById } from "@/lib/emails";
import { RawEmailView } from "@/components/RawEmailView";
import { Modal, ModalContent, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";

export default function EmailModal({ params }: { params: { id: string } }) {
  const router = useRouter();
  const email = getEmailById(params.id);
  
  if (!email) {
    return null;
  }

  // 关闭模态框时返回上一页
  const onClose = () => {
    router.back();
  };

  return (
    <Modal isOpen onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalBody className="p-6">
          <RawEmailView
            topic={email.topic}
            sender={email.sender}
            date={email.date}
            html={email.html}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
