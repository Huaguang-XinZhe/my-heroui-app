import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { IconEnvelope, IconRefresh, IconTrash } from "@/components/icons/icons";
import { EmailSubscriptionButton } from "./EmailSubscriptionButton";
import { SubscriptionStatus } from "@/types/subscription";

interface EmailDisplayHeaderProps {
  isLoading: boolean;
  lastFetchType: "inbox" | "junk" | null;
  onFetchEmails: (type: "inbox" | "junk") => void;
  // 订阅相关props
  subscriptionStatus: SubscriptionStatus;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
  showActions?: boolean;
}

export function EmailDisplayHeader({
  isLoading,
  lastFetchType,
  onFetchEmails,
  subscriptionStatus,
  onSubscribe,
  onUnsubscribe,
  showActions = true,
}: EmailDisplayHeaderProps) {
  return (
    <h2 className="flex items-center justify-between border-b border-dark-border pb-3 text-lg font-semibold text-indigo-500">
      <div className="flex items-center">
        <IconEnvelope className="mr-2" />
        收件箱
      </div>

      {/* 操作按钮组 - 只在 showActions 为 true 时显示 */}
      {showActions && (
        <div className="flex items-center gap-2">
          {/* 订阅按钮 */}
          <EmailSubscriptionButton
            status={subscriptionStatus}
            onSubscribe={onSubscribe}
            onUnsubscribe={onUnsubscribe}
            disabled={isLoading}
          />

          <Tooltip content="获取最新一封收件箱邮件" showArrow>
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              isLoading={isLoading && lastFetchType === "inbox"}
              onPress={() => onFetchEmails("inbox")}
              className="text-gray-400 hover:text-gray-200"
            >
              <IconRefresh className="text-sm" />
            </Button>
          </Tooltip>
          <Tooltip content="获取最新一封垃圾邮件" showArrow>
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              isLoading={isLoading && lastFetchType === "junk"}
              onPress={() => onFetchEmails("junk")}
              className="text-gray-400 hover:text-gray-200"
            >
              <IconTrash className="text-sm" />
            </Button>
          </Tooltip>
        </div>
      )}
    </h2>
  );
}
