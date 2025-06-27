"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";

interface BatchProgressInfo {
  totalAccounts: number;
  processedCount: number;
  successCount: number;
  failureCount: number;
  lastBatchTime: number;
  remainingEmails: string[];
}

interface ProgressOverviewProps {
  progressInfo: BatchProgressInfo;
  getProgressPercentage: () => number;
  getProgressColor: () => "success" | "primary" | "warning" | "danger";
}

export default function ProgressOverview({
  progressInfo,
  getProgressPercentage,
  getProgressColor,
}: ProgressOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">刷新进度</h2>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {progressInfo.totalAccounts}
              </p>
              <p className="text-sm text-gray-600">总邮箱数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {progressInfo.successCount}
              </p>
              <p className="text-sm text-gray-600">成功刷新</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {progressInfo.failureCount}
              </p>
              <p className="text-sm text-gray-600">刷新失败</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {progressInfo.remainingEmails.length}
              </p>
              <p className="text-sm text-gray-600">剩余待处理</p>
            </div>
          </div>

          <Progress
            value={getProgressPercentage()}
            color={getProgressColor()}
            size="lg"
            label={`总进度 ${progressInfo.processedCount}/${progressInfo.totalAccounts}`}
            showValueLabel={true}
          />

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              上次刷新:{" "}
              {new Date(progressInfo.lastBatchTime).toLocaleString("zh-CN")}
            </span>
            <Chip color={getProgressColor()} size="sm">
              {getProgressPercentage().toFixed(1)}% 完成
            </Chip>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
