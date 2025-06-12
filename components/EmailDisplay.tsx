"use client";

import { Card } from "@heroui/card";
import { useEmailDisplay } from "@/hooks/useEmailDisplay";
import {
  EmailDisplayHeader,
  EmailDisplayLoading,
  EmailDisplayError,
  EmailDisplayNoData,
  EmailInfoHeader,
  EmailContent,
  EmailSubscriptionStatus,
} from "./email-display";

interface EmailDisplayProps {
  selectedEmail?: string; // 选中的邮箱
}

export function EmailDisplay({ selectedEmail }: EmailDisplayProps) {
  const {
    email,
    isLoading,
    error,
    lastFetchType,
    hasFetched,
    fetchEmails,
    subscriptionState,
    handleSubscribe,
    handleUnsubscribe,
  } = useEmailDisplay({ selectedEmail });

  return (
    <Card className="flex flex-1 shrink-0 flex-col overflow-hidden border border-dark-border bg-dark-card p-4 sm:p-6">
      {/* 头部区域 */}
      <EmailDisplayHeader
        isLoading={isLoading}
        lastFetchType={lastFetchType}
        onFetchEmails={fetchEmails}
        subscriptionStatus={subscriptionState.status}
        onSubscribe={handleSubscribe}
        onUnsubscribe={handleUnsubscribe}
        showActions={!!selectedEmail} // 只有选中邮箱时才显示操作按钮
      />

      {/* 内容区域 */}
      <div className="mt-2 flex flex-1 flex-col px-2 pt-3 sm:mt-0 sm:px-6 sm:pt-6">
        {/* 如果没有选中邮箱，显示空状态 */}
        {!selectedEmail ? (
          <EmailDisplayNoData
            hasFetched={false}
            lastFetchType={null}
            isEmpty={true}
          />
        ) : /* 如果正在订阅中，显示订阅状态；否则显示正常内容 */
        subscriptionState.status === "connecting" ||
          subscriptionState.status === "connected" ? (
          <EmailSubscriptionStatus subscriptionState={subscriptionState} />
        ) : (
          <>
            {/* 加载状态 */}
            {isLoading && <EmailDisplayLoading lastFetchType={lastFetchType} />}

            {/* 错误状态 */}
            {error && !isLoading && (
              <EmailDisplayError
                error={error}
                onRetry={() => fetchEmails("inbox")}
              />
            )}

            {/* 空状态 */}
            {!email && !isLoading && !error && (
              <EmailDisplayNoData
                hasFetched={hasFetched}
                lastFetchType={lastFetchType}
              />
            )}

            {/* 邮件内容 */}
            {email && !isLoading && !error && (
              <>
                {/* 邮件信息头部 */}
                <EmailInfoHeader email={email} />

                {/* 邮件内容显示 */}
                <div className="mt-4">
                  <EmailContent email={email} />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
