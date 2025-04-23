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

interface AddEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddEmailModal({ isOpen, onClose }: AddEmailModalProps) {
  const [emailInput, setEmailInput] = useState("");

  const handleSubmit = () => {
    // 这里可以添加处理添加邮箱的逻辑
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      backdrop="blur"
      classNames={{
        base: "w-[90%] max-w-[600px] bg-dark-card",
        body: "px-6 py-4",
        closeButton: "top-5 end-4",
      }}
    >
      <ModalContent>
        {(onClose: () => void) => (
          <>
            <ModalHeader className="mt-2 flex items-center text-2xl font-semibold text-indigo-500">
              <IconPlusCircle className="mr-2 text-indigo-500" />
              添加新邮箱
            </ModalHeader>

            <ModalBody>
              <div className="mb-2">
                <textarea
                  className="h-40 w-full resize-none rounded-xl border border-dark-border bg-dark-input px-4 py-3 text-gray-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="每行一条四件套或 refreshToken"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                ></textarea>
              </div>

              <div className="mb-2 rounded-lg border-l-4 border-indigo-500 bg-indigo-900/20 p-4 text-sm text-gray-300">
                <p className="mb-2 font-medium text-indigo-400">格式说明：</p>
                <NumberedListItem number={1} className="mb-1">
                  完整四件套格式：邮箱、密码、clientId、refreshToken
                </NumberedListItem>
                <NumberedListItem number={2}>
                  简化格式：refreshToken（clientId 默认为雷鸟）
                </NumberedListItem>
              </div>
            </ModalBody>

            <ModalFooter className="space-x-2">
              <Button
                onPress={onClose}
                variant="flat"
                startContent={<IconClose />}
              >
                取消
              </Button>
              <Button
                onPress={handleSubmit}
                color="primary"
                startContent={<IconCheck />}
              >
                添加
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
