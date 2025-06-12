import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { SubscriptionState } from "@/types/subscription";

interface EmailSubscriptionStatusProps {
  subscriptionState: SubscriptionState;
}

export function EmailSubscriptionStatus({
  subscriptionState,
}: EmailSubscriptionStatusProps) {
  const { status, message, error, lastHeartbeat } = subscriptionState;

  // 根据状态返回不同的 UI
  switch (status) {
    case "idle":
      return null;

    case "connecting":
      return (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" color="primary" />
            <p className="mt-3 text-sm text-gray-400">
              {message || "正在建立订阅连接..."}
            </p>
          </div>
        </div>
      );

    case "connected":
      return (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <Chip color="success" variant="dot" size="lg" className="mb-4">
              正在监听新邮件
            </Chip>
            <p className="text-sm text-gray-400">
              {message || "等待新邮件到达..."}
            </p>
            {lastHeartbeat && (
              <p className="mt-2 text-xs text-gray-500">
                最后心跳：{lastHeartbeat.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      );

    case "error":
      return (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center text-red-400">
            <Chip color="danger" variant="dot" size="lg" className="mb-4">
              订阅出错
            </Chip>
            <p className="text-sm">{error || "未知错误"}</p>
          </div>
        </div>
      );

    case "disconnected":
      return (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center text-gray-400">
            <Chip color="warning" variant="dot" size="lg" className="mb-4">
              连接已断开
            </Chip>
            <p className="text-sm">{message || "订阅已停止"}</p>
          </div>
        </div>
      );

    default:
      return null;
  }
}
