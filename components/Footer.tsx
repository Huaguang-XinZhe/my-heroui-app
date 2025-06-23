"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function Footer() {
  return (
    <motion.footer
      className="flex flex-col items-center justify-center gap-2"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <p className="text-sm text-gray-400">© 2025 邮取星 - 版权所有</p>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/privacy"
          className="text-xs text-gray-500 transition-colors hover:text-gray-300"
        >
          隐私政策
        </Link>
        <span className="text-xs text-gray-600">|</span>
        <Link
          href="/terms"
          className="text-xs text-gray-500 transition-colors hover:text-gray-300"
        >
          服务条款
        </Link>
      </div>
    </motion.footer>
  );
}
