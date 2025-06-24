import { Spinner } from "@heroui/spinner";

interface EmailDisplayLoadingProps {
  lastFetchType: "inbox" | "junk" | null;
}

export function EmailDisplayLoading({
  lastFetchType,
}: EmailDisplayLoadingProps) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" color="primary" />
        <p className="mt-3 text-sm text-gray-400">
          正在获取{lastFetchType === "junk" ? "垃圾箱" : "收件箱"}邮件...
        </p>
      </div>
    </div>
  );
}
