"use client";

import { ReactNode } from "react";

interface NumberedListItemProps {
  number: number;
  children: ReactNode;
  className?: string;
}

export function NumberedListItem({ number, children, className = "" }: NumberedListItemProps) {
  return (
    <p className={`flex items-center ${className}`}>
      <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-900/50 text-xs text-indigo-300">
        {number}
      </span>
      {children}
    </p>
  );
}
