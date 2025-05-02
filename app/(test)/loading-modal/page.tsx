"use client";

import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";

export default function EmailModalLoading() {
  const router = useRouter();

  // 关闭模态框时返回上一页
  const onClose = () => {
    // router.back();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      scrollBehavior="inside"
      size="3xl"
      backdrop="blur"
      classNames={{
        base: "bg-dark-card",
        header: "flex flex-col gap-2",
        closeButton: "hover:bg-dark-hover top-3 end-3",
      }}
    >
      <ModalContent>
        <ModalHeader>
          <h1 className="text-2xl font-bold">加载中...</h1>
          <div className="h-5 w-full animate-pulse rounded bg-gray-700/30"></div>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-gray-400">正在加载邮件内容...</p>
          </div>
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
