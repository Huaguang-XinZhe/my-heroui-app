"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";

interface VerifyResult {
  key: string;
  isValid: boolean;
  data?: any;
  error?: string;
}

interface BatchVerifyResponse {
  success: boolean;
  results?: VerifyResult[];
  emailData?: {
    shortTerm: string[];
    longTerm: string[];
  };
  summary?: {
    totalVerified: number;
    validCount: number;
    invalidCount: number;
    totalEmailsRequested: number;
    totalEmailsProvided: number;
  };
  error?: string;
}

export default function BatchCardVerifyPage() {
  const [cardKeys, setCardKeys] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResults, setVerifyResults] = useState<VerifyResult[]>([]);
  const [emailData, setEmailData] = useState<{
    shortTerm: string[];
    longTerm: string[];
  } | null>(null);
  const [summary, setSummary] = useState<any>(null);

  const handleBatchVerify = async () => {
    const keyList = cardKeys
      .split("\n")
      .map((key) => key.trim())
      .filter((key) => key.length > 0);

    if (keyList.length === 0) {
      alert("请输入至少一个卡密");
      return;
    }

    if (keyList.length > 100) {
      alert("单次最多验证 100 个卡密");
      return;
    }

    setIsVerifying(true);
    setVerifyResults([]);
    setEmailData(null);
    setSummary(null);

    try {
      const response = await fetch("/api/card/batch-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardKeys: keyList,
          userId: "测试用户",
        }),
      });

      if (!response.ok) {
        throw new Error(`验证失败: ${response.status}`);
      }

      const data: BatchVerifyResponse = await response.json();

      if (data.success && data.results) {
        setVerifyResults(data.results);
        if (data.emailData) {
          setEmailData(data.emailData);
        }
        if (data.summary) {
          setSummary(data.summary);
        }
      } else {
        throw new Error(data.error || "验证失败");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "验证失败");
    } finally {
      setIsVerifying(false);
    }
  };

  const clearResults = () => {
    setVerifyResults([]);
    setEmailData(null);
    setSummary(null);
  };

  const copyValidKeys = () => {
    const validKeys = verifyResults
      .filter((result) => result.isValid)
      .map((result) => result.key)
      .join("\n");
    navigator.clipboard.writeText(validKeys);
  };

  const copyEmails = (emails: string[]) => {
    navigator.clipboard.writeText(emails.join("\n"));
  };

  const validCount = verifyResults.filter((result) => result.isValid).length;
  const invalidCount = verifyResults.length - validCount;

  return (
    <div className="h-screen overflow-y-auto bg-background">
      <div className="container mx-auto max-w-6xl space-y-6 p-6">
        <h1 className="mb-8 text-center text-3xl font-bold">
          批量卡密验证系统
        </h1>

        {/* 输入区域 */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">批量验证卡密</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Textarea
              label="卡密列表"
              placeholder="请输入卡密，每行一个（最多 100 个）"
              value={cardKeys}
              onValueChange={setCardKeys}
              minRows={6}
              maxRows={12}
              description="每行输入一个卡密，支持验证多个卡密"
              className="font-mono"
            />

            <div className="flex gap-3">
              <Button
                onPress={handleBatchVerify}
                color="primary"
                size="lg"
                isLoading={isVerifying}
                disabled={!cardKeys.trim()}
                className="flex-1"
              >
                {isVerifying ? "验证中..." : "开始批量验证"}
              </Button>

              {verifyResults.length > 0 && (
                <Button onPress={clearResults} color="danger" variant="light">
                  清空结果
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                as="a"
                href="/card-key-generator"
                color="secondary"
                variant="flat"
                size="sm"
                className="flex-1"
              >
                ← 返回卡密生成
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* 邮箱数据 - 优先展示 */}
        {emailData &&
          (emailData.shortTerm.length > 0 || emailData.longTerm.length > 0) && (
            <Card>
              <CardHeader className="flex flex-col items-start gap-2">
                <div className="flex w-full items-center justify-between">
                  <h2 className="text-xl font-semibold">🎯 批量提取的邮箱</h2>
                  <Chip color="success" variant="flat" size="sm">
                    {emailData.shortTerm.length + emailData.longTerm.length}{" "}
                    个邮箱
                  </Chip>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  根据有效卡密自动提取的邮箱账号，可直接使用
                </p>
              </CardHeader>
              <CardBody className="space-y-4">
                {emailData.shortTerm.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        短效邮箱 ({emailData.shortTerm.length} 个)
                      </h3>
                      <Button
                        size="sm"
                        color="secondary"
                        variant="flat"
                        onPress={() => copyEmails(emailData.shortTerm)}
                      >
                        复制短效邮箱
                      </Button>
                    </div>
                    <div className="max-h-48 overflow-y-auto rounded border bg-gray-50 p-3 dark:bg-gray-900">
                      {emailData.shortTerm.map((email, index) => (
                        <div key={index} className="font-mono text-sm">
                          {email}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {emailData.longTerm.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        长效邮箱 ({emailData.longTerm.length} 个)
                      </h3>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => copyEmails(emailData.longTerm)}
                      >
                        复制长效邮箱
                      </Button>
                    </div>
                    <div className="max-h-48 overflow-y-auto rounded border bg-gray-50 p-3 dark:bg-gray-900">
                      {emailData.longTerm.map((email, index) => (
                        <div key={index} className="font-mono text-sm">
                          {email}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

        {/* 验证结果统计 */}
        {verifyResults.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-semibold">验证结果统计</h2>
              <div className="flex gap-2">
                <Chip color="success" variant="flat">
                  有效: {validCount}
                </Chip>
                <Chip color="danger" variant="flat">
                  无效: {invalidCount}
                </Chip>
                <Chip color="default" variant="flat">
                  总计: {verifyResults.length}
                </Chip>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              {summary && (
                <div className="grid grid-cols-2 gap-4 rounded-lg border bg-gray-50 p-4 text-sm dark:bg-gray-900 md:grid-cols-4">
                  <div>
                    <div className="font-medium text-gray-600 dark:text-gray-400">
                      请求邮箱数量
                    </div>
                    <div className="text-lg font-semibold">
                      {summary.totalEmailsRequested}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600 dark:text-gray-400">
                      提供邮箱数量
                    </div>
                    <div className="text-lg font-semibold">
                      {summary.totalEmailsProvided}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600 dark:text-gray-400">
                      短效邮箱
                    </div>
                    <div className="text-lg font-semibold">
                      {summary.shortTermProvided || 0}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600 dark:text-gray-400">
                      长效邮箱
                    </div>
                    <div className="text-lg font-semibold">
                      {summary.longTermProvided || 0}
                    </div>
                  </div>
                </div>
              )}

              {validCount > 0 && (
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  onPress={copyValidKeys}
                >
                  复制所有有效卡密
                </Button>
              )}
            </CardBody>
          </Card>
        )}

        {/* 详细验证结果 */}
        {verifyResults.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">详细验证结果</h2>
            </CardHeader>
            <CardBody>
              <div className="max-h-96 space-y-3 overflow-y-auto">
                {verifyResults.map((result, index) => (
                  <div
                    key={index}
                    className={`space-y-2 rounded-lg border p-4 ${
                      result.isValid
                        ? "border-success-200 bg-success-50 dark:border-success-800 dark:bg-success-900/20"
                        : "border-danger-200 bg-danger-50 dark:border-danger-800 dark:bg-danger-900/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        卡密 #{index + 1}
                      </span>
                      <Chip
                        size="sm"
                        color={result.isValid ? "success" : "danger"}
                        variant="flat"
                      >
                        {result.isValid ? "有效" : "无效"}
                      </Chip>
                    </div>

                    <div className="break-all rounded bg-white p-2 font-mono text-sm dark:bg-gray-800">
                      {result.key}
                    </div>

                    {result.isValid && result.data && (
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>来源：</strong>
                          {result.data.source === "自定义" &&
                          result.data.customSource
                            ? `自定义(${result.data.customSource})`
                            : result.data.source}
                        </p>
                        <p>
                          <strong>邮箱数量：</strong>
                          {result.data.emailCount}
                        </p>
                        <p>
                          <strong>有效期：</strong>
                          {result.data.duration}
                        </p>
                        <p>
                          <strong>生成时间：</strong>
                          {new Date(result.data.timestamp).toLocaleString()}
                        </p>
                      </div>
                    )}

                    {result.error && (
                      <div className="rounded bg-danger-100 p-2 text-sm text-danger-700 dark:bg-danger-900/30 dark:text-danger-300">
                        {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
