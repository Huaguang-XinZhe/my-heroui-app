"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { SingleRefreshResult as ISingleRefreshResult } from "@/utils/refreshTokenUtils";

interface SingleRefreshResultProps {
  result: ISingleRefreshResult;
}

export default function SingleRefreshResult({
  result,
}: SingleRefreshResultProps) {
  // 格式化 refresh_token 显示（只显示前后几位）
  const formatToken = (token: string | null) => {
    if (!token) return "无";
    if (token.length <= 20) return token;
    return `${token.slice(0, 10)}...${token.slice(-10)}`;
  };

  // 格式化时间显示
  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) return "从未更新";
    return new Date(dateTime).toLocaleString("zh-CN");
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">
          单个邮箱刷新结果 - {result.email}
        </h2>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="space-y-6">
          {/* 刷新状态 */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">刷新状态</h3>
            </div>
            <div className="flex items-center gap-2">
              {result.success ? (
                <Chip color="success" size="lg">
                  ✅ 刷新成功
                </Chip>
              ) : (
                <Chip color="danger" size="lg">
                  ❌ 刷新失败
                </Chip>
              )}
              {result.tokenChanged && (
                <Chip color="primary" size="lg">
                  🔄 令牌已变化
                </Chip>
              )}
            </div>
          </div>

          {/* 错误信息 */}
          {result.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="font-medium text-red-800">错误信息：</p>
              <p className="mt-1 text-red-600">{result.error}</p>
            </div>
          )}

          {/* 令牌变化对比 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 刷新前 */}
            <Card className="border-2 border-orange-200">
              <CardHeader className="bg-orange-50">
                <h4 className="text-lg font-medium text-orange-800">
                  刷新前状态
                </h4>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Refresh Token:
                    </p>
                    <p className="break-all font-mono text-sm">
                      {formatToken(result.beforeRefresh.refresh_token)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      更新时间:
                    </p>
                    <p className="text-sm">
                      {formatDateTime(
                        result.beforeRefresh.refresh_token_updated_at,
                      )}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* 刷新后 */}
            <Card className="border-2 border-green-200">
              <CardHeader className="bg-green-50">
                <h4 className="text-lg font-medium text-green-800">
                  刷新后状态
                </h4>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Refresh Token:
                    </p>
                    <p className="break-all font-mono text-sm">
                      {formatToken(result.afterRefresh.refresh_token)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      更新时间:
                    </p>
                    <p className="text-sm">
                      {formatDateTime(
                        result.afterRefresh.refresh_token_updated_at,
                      )}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* 变化总结 */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-2 font-medium text-blue-800">变化总结</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <p>• 令牌变化：{result.tokenChanged ? "是" : "否"}</p>
              <p>
                • 更新时间变化：
                {result.beforeRefresh.refresh_token_updated_at !==
                result.afterRefresh.refresh_token_updated_at
                  ? "是"
                  : "否"}
              </p>
              {result.tokenChanged && (
                <p className="font-medium text-green-700">
                  ✨ refresh_token 已成功更新为新值！
                </p>
              )}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
