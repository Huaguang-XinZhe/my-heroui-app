"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  generateCardKey,
  CardKeyData,
  clearUsedKeys,
  isKeyUsed,
} from "@/utils/cardKeyUtils";

type Source = "淘宝" | "闲鱼" | "内部" | "自定义";
type Duration = "短效" | "长效";

interface GeneratedKey {
  key: string;
  data: CardKeyData;
}

export default function CardKeyGeneratorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [source, setSource] = useState<Source>("淘宝");
  const [customSource, setCustomSource] = useState("");
  const [emailCount, setEmailCount] = useState("100");
  const [duration, setDuration] = useState<Duration>("长效");
  const [generateCount, setGenerateCount] = useState("1");
  const [isReusable, setIsReusable] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<GeneratedKey[]>([]);
  const [usedKeys, setUsedKeys] = useState<string[]>([]);

  // 检查登录状态和管理员权限
  useEffect(() => {
    if (status === "loading") return; // 仍在加载中

    if (!session) {
      // 未登录，重定向到登录页面
      router.push("/auth/signin");
      return;
    }

    if (!session.user?.isAdmin) {
      // 非管理员，重定向到未授权页面
      router.push("/unauthorized");
      return;
    }
  }, [session, status, router]);

  // 如果正在加载或非管理员，显示加载状态
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  // 如果未登录或非管理员，不渲染页面内容
  if (!session || !session.user?.isAdmin) {
    return null;
  }

  const handleGenerate = () => {
    const count = parseInt(generateCount);
    if (count <= 0 || count > 100) {
      alert("生成数量必须在 1-100 之间");
      return;
    }

    const emailCountNum = parseInt(emailCount);
    if (emailCountNum <= 0) {
      alert("邮箱数量必须大于 0");
      return;
    }

    // 验证自定义来源
    if (source === "自定义" && !customSource.trim()) {
      alert("请输入自定义来源名称（英文简写）");
      return;
    }

    if (source === "自定义" && !/^[a-zA-Z]+$/.test(customSource.trim())) {
      alert("自定义来源只能包含英文字母");
      return;
    }

    const newKeys: GeneratedKey[] = [];
    for (let i = 0; i < count; i++) {
      const data: CardKeyData = {
        source,
        customSource: source === "自定义" ? customSource.trim() : undefined,
        emailCount: isReusable ? 1 : emailCountNum, // 体验账户卡密固定为 1 个邮箱
        duration,
        timestamp: Date.now(),
        id: Math.random().toString(36).substring(2, 15),
        reusable: isReusable,
      };

      const key = generateCardKey(data);
      newKeys.push({ key, data });
    }

    setGeneratedKeys(newKeys);
  };

  const handleClearUsedKeys = () => {
    clearUsedKeys();
    setUsedKeys([]);
    alert("已清空所有已使用的卡密");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyAllKeys = () => {
    const allKeys = generatedKeys.map((item) => item.key).join("\n");
    navigator.clipboard.writeText(allKeys);
  };

  const checkKeyStatus = (key: string) => {
    return isKeyUsed(key) ? "已使用" : "未使用";
  };

  const getDisplaySource = (data: CardKeyData) => {
    return data.source === "自定义" && data.customSource
      ? `自定义(${data.customSource})`
      : data.source;
  };

  return (
    <div className="h-screen overflow-y-auto bg-background">
      <div className="container mx-auto max-w-7xl space-y-6 p-6">
        <h1 className="mb-8 text-center text-3xl font-bold">
          卡密生成与验证系统
        </h1>

        {/* 生成卡密 */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">生成卡密</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select
                label="来源"
                selectedKeys={[source]}
                onSelectionChange={(keys) =>
                  setSource(Array.from(keys)[0] as Source)
                }
              >
                <SelectItem key="淘宝">淘宝</SelectItem>
                <SelectItem key="闲鱼">闲鱼</SelectItem>
                <SelectItem key="内部">内部</SelectItem>
                <SelectItem key="自定义">自定义</SelectItem>
              </Select>

              <Input
                type="number"
                label="邮箱数量"
                value={emailCount}
                onValueChange={setEmailCount}
                min="1"
              />

              <Select
                label="有效期"
                selectedKeys={[duration]}
                onSelectionChange={(keys) =>
                  setDuration(Array.from(keys)[0] as Duration)
                }
              >
                <SelectItem key="短效">短效 (三两个小时)</SelectItem>
                <SelectItem key="长效">长效 (30天或更久)</SelectItem>
              </Select>

              <Input
                type="number"
                label="生成数量"
                value={generateCount}
                onValueChange={setGenerateCount}
                min="1"
                max="100"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="reusable"
                checked={isReusable}
                onChange={(e) => setIsReusable(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="reusable" className="text-sm font-medium">
                可重复使用（适用于体验账户登录）
              </label>
            </div>

            {/* 自定义来源输入框 */}
            {source === "自定义" && (
              <Input
                label="自定义来源"
                placeholder="请输入英文简写，如：Alice、Bob、Team1"
                value={customSource}
                onValueChange={setCustomSource}
                description="只能包含英文字母，最多取前3位作为标识"
              />
            )}

            <Button
              onPress={handleGenerate}
              color="primary"
              size="lg"
              className="w-full"
            >
              生成卡密
            </Button>

            <div className="flex gap-3">
              <Button
                as="a"
                href="/batch-card-verify"
                color="secondary"
                variant="flat"
                size="sm"
                className="flex-1"
              >
                批量验证卡密 →
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* 生成结果 */}
        {generatedKeys.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-semibold">
                生成的卡密 ({generatedKeys.length} 个)
              </h2>
              <Button
                size="sm"
                onPress={copyAllKeys}
                color="primary"
                variant="flat"
              >
                复制全部
              </Button>
            </CardHeader>
            <CardBody>
              <div className="max-h-96 space-y-4 overflow-y-auto">
                {generatedKeys.map((item, index) => (
                  <div
                    key={index}
                    className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        卡密 #{index + 1}
                      </span>
                      <div className="flex gap-2">
                        <Chip
                          size="sm"
                          color={
                            checkKeyStatus(item.key) === "已使用"
                              ? "danger"
                              : "success"
                          }
                          variant="flat"
                        >
                          {checkKeyStatus(item.key)}
                        </Chip>
                        <Button
                          size="sm"
                          variant="light"
                          color="primary"
                          onPress={() => copyToClipboard(item.key)}
                        >
                          复制
                        </Button>
                      </div>
                    </div>

                    <div className="select-all break-all rounded border bg-white p-3 font-mono text-sm dark:bg-gray-800">
                      {item.key}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Chip size="sm" variant="flat" color="default">
                        {getDisplaySource(item.data)}
                      </Chip>
                      <Chip size="sm" variant="flat" color="primary">
                        {item.data.emailCount} 邮箱
                      </Chip>
                      <Chip size="sm" variant="flat" color="secondary">
                        {item.data.duration}
                      </Chip>
                      <Chip size="sm" variant="flat" color="warning">
                        长度: {item.key.length}
                      </Chip>
                    </div>
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
