"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";

export function MotionHeader() {
  return (
    <motion.div
      className="absolute left-0 top-0 z-10 w-full"
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 0, y: -100 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Header />
    </motion.div>
  );
}
