"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";

interface BatchProgressInfo {
  totalAccounts: number;
  processedCount: number;
  successCount: number;
  failureCount: number;
  lastBatchTime: number;
  remainingEmails: string[];
}

interface OperationPanelProps {
  // 分批刷新相关
  progressInfo: BatchProgressInfo | null;
  batchSize: string;
  loading: boolean;
  isInitializing: boolean;
  setBatchSize: (value: string) => void;
  onLoadUnrefreshedAccounts: () => void;
  onHandleBatchRefresh: () => void;

  // 单个邮箱测试相关
  singleEmail: string;
  singleRefreshLoading: boolean;
  setSingleEmail: (value: string) => void;
  onHandleSingleRefresh: () => void;
}

export default function OperationPanel({
  progressInfo,
  batchSize,
  loading,
  isInitializing,
  setBatchSize,
  onLoadUnrefreshedAccounts,
  onHandleBatchRefresh,
  singleEmail,
  singleRefreshLoading,
  setSingleEmail,
  onHandleSingleRefresh,
}: OperationPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* 分批刷新操作 */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">分批刷新操作</h2>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          {!progressInfo ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                开始前需要扫描数据库，获取所有 refresh_token_updated_at 为 null
                的邮箱账户
              </p>
              <Button
                color="primary"
                className="w-full"
                onPress={onLoadUnrefreshedAccounts}
                isLoading={isInitializing}
                size="lg"
              >
                🚀 扫描未刷新账户
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-end gap-3">
                <Input
                  label="批次大小"
                  placeholder="20"
                  value={batchSize}
                  onValueChange={setBatchSize}
                  type="number"
                  min="1"
                  max="100"
                  className="flex-1"
                  description="每次刷新的邮箱数量"
                />
                <Button
                  color="success"
                  onPress={onHandleBatchRefresh}
                  isLoading={loading}
                  isDisabled={progressInfo.remainingEmails.length === 0}
                  size="lg"
                >
                  🔄 执行本批次
                </Button>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  • 本次将刷新{" "}
                  {Math.min(
                    parseInt(batchSize) || 20,
                    progressInfo.remainingEmails.length,
                  )}{" "}
                  个邮箱的 refresh_token
                </p>
                <p>• 剩余 {progressInfo.remainingEmails.length} 个邮箱待处理</p>
              </div>

              {progressInfo.remainingEmails.length === 0 && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="font-medium text-green-800">
                    🎉 所有邮箱的 refresh_token 已完成刷新！
                  </p>
                  <p className="mt-1 text-sm text-green-600">
                    总计处理 {progressInfo.totalAccounts} 个邮箱， 成功{" "}
                    {progressInfo.successCount} 个， 失败{" "}
                    {progressInfo.failureCount} 个
                  </p>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* 单个邮箱刷新 */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">单个邮箱测试</h2>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-end gap-3">
              <Input
                label="邮箱地址"
                placeholder="test@example.com"
                value={singleEmail}
                onValueChange={setSingleEmail}
                className="flex-1"
                description="输入要测试的邮箱地址"
              />
              <Button
                color="primary"
                onPress={onHandleSingleRefresh}
                isLoading={singleRefreshLoading}
                size="lg"
              >
                🔬 测试刷新
              </Button>
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <p>• 可以测试任意邮箱的 refresh_token 刷新</p>
              <p>• 会显示刷新前后的令牌变化对比</p>
              <p>• 用于验证刷新功能是否正常工作</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">使用说明</h2>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <p className="mb-1 font-medium text-gray-800">🔍 刷新对象：</p>
              <p>• 数据库中 refresh_token_updated_at 为 null 的邮箱</p>
              <p>• 排除已被封禁 (is_banned = true) 的账户</p>
            </div>

            <div>
              <p className="mb-1 font-medium text-gray-800">📝 操作步骤：</p>
              <p>1. 点击"扫描未刷新账户"获取邮箱列表</p>
              <p>2. 设置每批次要刷新的数量 (建议 10-50)</p>
              <p>3. 点击"执行本批次"开始刷新</p>
              <p>4. 重复步骤 3 直到全部完成</p>
            </div>

            <div>
              <p className="mb-1 font-medium text-gray-800">⚠️ 注意事项：</p>
              <p>• 进度会自动保存到本地存储</p>
              <p>• 可随时中断和继续操作</p>
              <p>• 建议分批执行避免触发风控</p>
              <p>• 刷新成功后 refresh_token_updated_at 会更新</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
