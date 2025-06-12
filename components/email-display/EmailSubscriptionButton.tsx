import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { SubscriptionStatus } from "@/types/subscription";
import { IconSubscribe, IconUnsubscribe } from "@/components/icons/icons";

interface EmailSubscriptionButtonProps {
  status: SubscriptionStatus;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
  disabled?: boolean;
}

export function EmailSubscriptionButton({
  status,
  onSubscribe,
  onUnsubscribe,
  disabled = false,
}: EmailSubscriptionButtonProps) {
  // 根据状态决定按钮行为
  const isSubscribing = status === "connecting" || status === "connected";
  const isLoading = status === "connecting";

  const handleClick = () => {
    if (isSubscribing) {
      onUnsubscribe();
    } else {
      onSubscribe();
    }
  };

  const getTooltipText = () => {
    if (isSubscribing) {
      return "停止订阅";
    } else {
      return "订阅新邮件";
    }
  };

  const getIcon = () => {
    if (isSubscribing) {
      return <IconUnsubscribe className="text-sm" />;
    } else {
      return <IconSubscribe className="text-sm" />;
    }
  };

  return (
    <Tooltip content={getTooltipText()} showArrow>
      <Button
        isIconOnly
        variant="flat"
        size="sm"
        isLoading={isLoading}
        isDisabled={disabled}
        onPress={handleClick}
        className="text-gray-400 hover:text-gray-200"
      >
        {!isLoading && getIcon()}
      </Button>
    </Tooltip>
  );
}
