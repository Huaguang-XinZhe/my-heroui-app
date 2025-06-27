"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";

interface AccountInfo {
  email: string;
  service_provider: string;
  protocol_type: string;
  is_banned: boolean;
  refresh_token_updated_at: string | null;
}

interface BatchProgressInfo {
  totalAccounts: number;
  processedCount: number;
  successCount: number;
  failureCount: number;
  lastBatchTime: number;
  remainingEmails: string[];
}

interface StatusOverviewProps {
  unrefreshedAccounts: AccountInfo[];
  progressInfo: BatchProgressInfo | null;
  isInitializing: boolean;
  loading: boolean;
  onLoadUnrefreshedAccounts: () => void;
  onHandleBatchRefresh: () => void;
  onClearProgressInfo: () => void;
  getProgressColor: () => "success" | "primary" | "warning" | "danger";
}

export default function StatusOverview({
  unrefreshedAccounts,
  progressInfo,
  isInitializing,
  loading,
  onLoadUnrefreshedAccounts,
  onHandleBatchRefresh,
  onClearProgressInfo,
  getProgressColor,
}: StatusOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* 未刷新账户信息 */}
      <Card>
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold">未刷新账户</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">数据库中的账户</p>
              <p className="text-2xl font-medium">
                {unrefreshedAccounts.length}
              </p>
            </div>
            {unrefreshedAccounts.length > 0 && (
              <div>
                <p className="text-sm text-gray-600">服务商分布</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {Array.from(
                    new Set(
                      unrefreshedAccounts.map(
                        (acc: AccountInfo) => acc.service_provider,
                      ),
                    ),
                  ).map((provider: string) => (
                    <Chip key={provider} size="sm" variant="flat">
                      {provider}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
            <Button
              size="sm"
              variant="light"
              onPress={onLoadUnrefreshedAccounts}
              isLoading={isInitializing}
            >
              重新扫描
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* 进度状态 */}
      <Card>
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold">进度状态</h3>
        </CardHeader>
        <CardBody>
          {progressInfo ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">完成进度</p>
                <p className="text-2xl font-medium">
                  {progressInfo.processedCount}/{progressInfo.totalAccounts}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">成功率</p>
                <p className="font-medium">
                  {progressInfo.processedCount > 0
                    ? `${((progressInfo.successCount / progressInfo.processedCount) * 100).toFixed(1)}%`
                    : "0%"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">状态</p>
                <Chip color={getProgressColor()} size="sm">
                  {progressInfo.remainingEmails.length === 0
                    ? "已完成"
                    : "进行中"}
                </Chip>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">未开始</p>
          )}
        </CardBody>
      </Card>

      {/* 快速操作 */}
      <Card>
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold">快速操作</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {!progressInfo ? (
              <Button
                color="primary"
                className="w-full"
                onPress={onLoadUnrefreshedAccounts}
                isLoading={isInitializing}
              >
                🚀 开始扫描
              </Button>
            ) : (
              <>
                <Button
                  color="success"
                  className="w-full"
                  onPress={onHandleBatchRefresh}
                  isLoading={loading}
                  isDisabled={progressInfo.remainingEmails.length === 0}
                >
                  🔄 执行下一批
                </Button>
                <Button
                  color="warning"
                  variant="light"
                  className="w-full"
                  onPress={onClearProgressInfo}
                >
                  🗑️ 重置进度
                </Button>
              </>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
