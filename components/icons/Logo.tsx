import { motion } from "framer-motion";
import { IconProps } from "@/types";
import { FaRegStarHalfStroke } from "react-icons/fa6";
import { useMemo } from "react";

export const Logo: React.FC<IconProps> = ({ className }) => {
  // 从 className 中解析大小
  const iconClassName = useMemo(() => {
    // 匹配常见的大小类名格式：w-4, h-8, size-12 等
    const sizeMatch = className?.match(/(?:w-|h-|size-)(\d+)/);
    if (sizeMatch && sizeMatch[1]) {
      const size = parseInt(sizeMatch[1]);
      const halfSize = Math.max(Math.floor(size / 2), 1); // 确保至少为 1
      // 别用 size，奇数时可能不会生效❗
      return `w-${halfSize} h-${halfSize}`; // 使用一半大小的 Tailwind 类名
    }
    return "w-4 h-4"; // 默认大小
  }, [className]);

  return (
    <motion.div
      className={`bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 ${className}`}
      animate={{
        y: [0, -4, 0],
        opacity: [0.8, 1, 0.8],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <FaRegStarHalfStroke
        className={`${iconClassName} filter drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]`}
      />
    </motion.div>
  );
};
