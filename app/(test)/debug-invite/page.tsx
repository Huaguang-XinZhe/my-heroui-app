"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";

export default function DebugInvitePage() {
  const [results, setResults] = useState<any[]>([]);

  const testServerInviteGeneration = async (type: "quick" | "custom") => {
    try {
      const requestBody =
        type === "quick"
          ? { type: "quick", createdBy: "debug-test" }
          : {
              type: "custom",
              imapEmailCount: 1,
              graphEmailCount: 1,
              maxRegistrations: 1,
              validDays: 7,
              registrationMethods: {
                linuxdo: false,
                google: false,
                cardKey: false,
                others: false,
              },
              allowBatchAddEmails: true,
              autoCreateTrialAccount: true,
              createdBy: "debug-test",
            };

      console.log("测试服务器端邀请生成，类型:", type);
      console.log("请求数据:", requestBody);

      const response = await fetch("/api/admin/invite/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log("服务器端生成结果:", result);

      // 如果生成成功，测试令牌验证
      let verificationResult = null;
      if (result.success) {
        console.log("测试令牌验证...");
        const verifyResponse = await fetch("/api/card/create-trial-account", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inviteToken: result.data.token,
            imapEmailCount: 1,
            graphEmailCount: 1,
            allowBatchAddEmails: true,
          }),
        });

        verificationResult = {
          success: verifyResponse.ok,
          status: verifyResponse.status,
          data: await verifyResponse.json(),
        };
        console.log("令牌验证结果:", verificationResult);
      }

      return {
        type,
        success: result.success,
        generationResult: result,
        verificationResult,
        timestamp: new Date().toLocaleTimeString(),
      };
    } catch (error) {
      console.error("测试过程中发生错误:", error);
      return {
        type,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toLocaleTimeString(),
      };
    }
  };

  const handleTestQuick = async () => {
    const result = await testServerInviteGeneration("quick");
    setResults((prev) => [result, ...prev]);
  };

  const handleTestCustom = async () => {
    const result = await testServerInviteGeneration("custom");
    setResults((prev) => [result, ...prev]);
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <h1 className="text-2xl font-bold">邀请令牌调试工具 (服务器端版本)</h1>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">测试服务器端令牌生成和验证</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex gap-4">
            <Button onPress={handleTestQuick} color="warning">
              测试快捷邀请生成
            </Button>
            <Button onPress={handleTestCustom} color="primary">
              测试自定义邀请生成
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            所有加密逻辑都在服务器端执行，客户端不再处理私钥。
          </p>
        </CardBody>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">测试结果</h2>
          </CardHeader>
          <CardBody>
            <div className="max-h-96 space-y-4 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-800"
                >
                  <div className="mb-2 text-sm text-gray-500">
                    {result.timestamp} - {result.type} 邀请
                  </div>

                  {result.error ? (
                    <div className="text-red-500">错误: {result.error}</div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <div>
                        <strong>生成状态:</strong>{" "}
                        {result.success ? "✅ 成功" : "❌ 失败"}
                      </div>

                      {result.generationResult?.data && (
                        <>
                          <div>
                            <strong>令牌长度:</strong>{" "}
                            {result.generationResult.data.tokenLength}
                          </div>
                          <div className="mt-2">
                            <strong>生成的 URL:</strong>
                            <code className="block break-all rounded bg-gray-100 p-2 text-xs dark:bg-gray-700">
                              {result.generationResult.data.url}
                            </code>
                          </div>
                        </>
                      )}

                      {result.verificationResult && (
                        <div>
                          <strong>令牌验证:</strong>{" "}
                          {result.verificationResult.success
                            ? "✅ 成功"
                            : "❌ 失败"}
                          {!result.verificationResult.success && (
                            <span className="ml-2 text-red-500">
                              ({result.verificationResult.status} -{" "}
                              {result.verificationResult.data?.error})
                            </span>
                          )}
                        </div>
                      )}

                      {result.generationResult?.data?.inviteData && (
                        <div className="mt-2">
                          <strong>邀请数据:</strong>
                          <pre className="overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-700">
                            {JSON.stringify(
                              result.generationResult.data.inviteData,
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
