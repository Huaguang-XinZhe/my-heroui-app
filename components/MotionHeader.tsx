"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/Header";

export function MotionHeader() {
  return (
    <motion.div
      className="absolute top-0 left-0 w-full z-10"
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 0, y: -100 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Header />
    </motion.div>
  );
}
