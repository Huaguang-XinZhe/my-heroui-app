import { Button } from "@heroui/button";

interface EmailDisplayErrorProps {
  error: string;
  onRetry: () => void;
}

export function EmailDisplayError({ error, onRetry }: EmailDisplayErrorProps) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center text-red-400">
        <p className="text-lg">获取邮件失败</p>
        <p className="mt-2 text-sm">{error}</p>
        <Button
          color="primary"
          variant="flat"
          className="mt-4"
          onPress={onRetry}
        >
          重试
        </Button>
      </div>
    </div>
  );
}
