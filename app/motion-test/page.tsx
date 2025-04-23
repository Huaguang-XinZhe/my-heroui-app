"use client";

import { motion } from "framer-motion";

const boxVariants = {
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0 },
};

export default function MotionTest() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        Spring Animation
      </motion.div>
    </div>
  );
}
