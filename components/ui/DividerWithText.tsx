"use client";

import { FC, ReactNode } from "react";
import clsx from "clsx";

export interface DividerWithTextProps {
  children: ReactNode;
  className?: string;
  textClassName?: string;
}

export const DividerWithText: FC<DividerWithTextProps> = ({
  children,
  className,
  textClassName,
}) => {
  return (
    <div className={clsx("relative", className)}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-[40%] h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-gray-300 dark:via-gray-800 dark:to-gray-800"></div>
        <div className="flex-grow"></div>
        <div className="w-[40%] h-[1px] bg-gradient-to-l from-transparent via-gray-300 to-gray-300 dark:via-gray-800 dark:to-gray-800"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span
          className={clsx(
            "px-4 dark:text-gray-400 text-gray-500 font-medium",
            "dark:bg-[#0A0F1A] bg-white",
            textClassName
          )}
        >
          {children}
        </span>
      </div>
    </div>
  );
};
