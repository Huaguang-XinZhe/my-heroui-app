"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { IconClose } from "./icons/icons";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useFormatGuide } from "@/contexts/FormatGuideContext";
import { motion, AnimatePresence } from "framer-motion";

export function EmailFormatGuide() {
  const { showFormatGuide, setShowFormatGuide } = useFormatGuide();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {showFormatGuide && (
        <motion.div
          className="fixed left-0 top-0 z-50 h-screen"
          initial={{ x: -400 }}
          animate={{ x: 0 }}
          exit={{ x: -400 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        >
          <Card className="h-full w-96 bg-dark-bg">
            <CardHeader className="border-b border-dark-border pb-3">
              <div className="flex w-full items-center justify-between">
                <h2 className="text-xl font-semibold text-indigo-400">
                  格式说明
                </h2>
                <Button
                  isIconOnly
                  variant="flat"
                  size="sm"
                  onPress={() => setShowFormatGuide(false)}
                  className="bg-dark-hover hover:bg-dark-border"
                >
                  <IconClose className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardBody className="flex-1 space-y-6 overflow-y-auto pt-6 text-xs">
              {/* 格式示例 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-fit rounded bg-primary/20 px-2 py-1 text-xs text-primary">
                    标准四件套
                  </span>
                  <span className="text-xs text-gray-400">
                    邮箱、密码、客户端 ID、刷新令牌
                  </span>
                </div>
                <code className="block break-all rounded bg-gray-800 p-2 font-mono text-xs leading-relaxed text-gray-300">
                  user@outlook.com----password123----client-id----M.C505_BAY.0.U.-CinaL...
                </code>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-fit rounded bg-primary/20 px-2 py-1 text-xs text-primary">
                    无密码四件套
                  </span>
                  <span className="text-xs text-gray-400">
                    邮箱、x (无密码)、客户端 ID、刷新令牌
                  </span>
                </div>
                <code className="block break-all rounded bg-gray-800 p-2 font-mono text-xs leading-relaxed text-gray-300">
                  user@outlook.com----x----client-id----M.C505_BAY.0.U.-CinaL...
                </code>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-fit rounded bg-primary/20 px-2 py-1 text-xs text-primary">
                    调换格式
                  </span>
                  <span className="text-xs text-gray-400">
                    邮箱、x、刷新令牌、客户端 ID
                  </span>
                </div>
                <code className="block break-all rounded bg-gray-800 p-2 font-mono text-xs leading-relaxed text-gray-300">
                  user@outlook.com----x----M.C505_BAY.0.U.-CinaL...----client-id
                </code>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-fit rounded bg-primary/20 px-2 py-1 text-xs text-primary">
                    六件套
                  </span>
                  <span className="text-xs text-gray-400">
                    包含辅助邮箱和密码
                  </span>
                </div>
                <code className="block break-all rounded bg-gray-800 p-2 font-mono text-xs leading-relaxed text-gray-300">
                  user@outlook.com----password----client-id----refresh-token----backup@email.com----backup-pass
                </code>
              </div>

              <div className="rounded-lg border border-blue-500/30 bg-blue-900/20 p-3">
                <p className="text-xs text-blue-300">
                  <strong>智能识别:</strong> 系统会自动检测 refreshToken
                  并根据其位置智能调整解析顺序。无密码时请使用 "x" 占位。
                </p>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
