"use client";

import { motion } from "framer-motion";
import { IconCircle, IconWarning, IconStop } from "./icons/icons";

interface StatusBadgeProps {
  text: string;
  color?: "success" | "warning" | "danger" | "default";
  size?: "sm" | "md";
  className?: string;
  [key: string]: any;
}

export function StatusBadge({
  text,
  color = "success",
  size = "sm",
  className = "",
  ...props
}: StatusBadgeProps) {
  // 根据不同颜色设置样式
  const colorStyles = {
    success: {
      border: "border-emerald-700/30",
      bg: "bg-emerald-950/60",
      dot: "bg-[#2b8a3e]",
      text: "text-success",
    },
    warning: {
      border: "border-amber-700/30",
      bg: "bg-amber-950/60",
      dot: "text-amber-400",
      text: "text-amber-300",
    },
    danger: {
      border: "border-red-700/30",
      bg: "bg-red-950/60",
      dot: "text-red-400",
      text: "text-red-300",
    },
    default: {
      border: "border-gray-700/30",
      bg: "bg-gray-800/60",
      dot: "text-gray-400",
      text: "text-gray-300",
    },
  };

  const styles = colorStyles[color];
  const dotSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  const padding = size === "sm" ? "px-2 py-1" : "px-2.5 py-1";

  // 根据状态渲染不同的指示器
  const renderIndicator = () => {
    switch (color) {
      case "success":
        return (
          <motion.div
            className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
            initial={{ scale: 0.65 }}
            animate={{ scale: 1.15 }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 1,
            }}
          />
        );
      case "warning":
        return <IconWarning className={`${dotSize} ${styles.dot}`} />;
      case "danger":
        return <IconStop className={`${dotSize} ${styles.dot}`} />;
      default:
        return <IconCircle className={`${dotSize} ${styles.dot}`} />;
    }
  };

  return (
    <div
      className={`flex shrink-0 select-none items-center gap-1.5 rounded-full focus:outline-none ${styles.border} ${styles.bg} ${padding} ${className}`}
      {...props}
    >
      {renderIndicator()}
      <span className={`text-xs font-medium ${styles.text}`}>{text}</span>
    </div>
  );
}
