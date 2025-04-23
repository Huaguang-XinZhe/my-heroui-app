"use client";

import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer
      className="flex items-center justify-center"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <p className="mb-6 text-sm text-gray-400">© 2025 邮取星 - 版权所有</p>
    </motion.footer>
  );
}
