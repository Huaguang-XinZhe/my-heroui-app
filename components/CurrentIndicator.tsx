"use client";

interface CurrentIndicatorProps {
  isActive: boolean;
}

export function CurrentIndicator({ isActive }: CurrentIndicatorProps) {
  if (!isActive) return null;

  return (
    <div className="flex h-full items-center">
      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
    </div>
  );
}
