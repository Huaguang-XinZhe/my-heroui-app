"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { FailureDetailsModal } from "@/components/FailureDetailsModal";
import { FromOthersResult, ErrorResult } from "@/types/email";

export default function TestFailureModalPage() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    scenario: string;
    fromOthers: FromOthersResult[];
    errors: ErrorResult[];
  }>({
    isOpen: false,
    scenario: "",
    fromOthers: [],
    errors: [],
  });

  // 测试数据
  const scenarios = {
    // 场景1：只有来自别人账户的邮箱，没有被封禁的
    onlyFromOthersNoBanned: {
      title: "只有来自别人账户的邮箱（无封禁）",
      fromOthers: [
        { email: "user1@example.com", isBanned: false },
        { email: "user2@gmail.com", isBanned: false },
        { email: "user3@outlook.com", isBanned: false },
      ],
      errors: [],
    },

    // 场景2：只有来自别人账户的邮箱，有部分被封禁
    onlyFromOthersWithBanned: {
      title: "来自别人账户的邮箱（部分封禁）",
      fromOthers: [
        { email: "banned1@example.com", isBanned: true },
        { email: "normal1@gmail.com", isBanned: false },
        { email: "banned2@outlook.com", isBanned: true },
        { email: "normal2@yahoo.com", isBanned: false },
      ],
      errors: [],
    },

    // 场景3：只有 API 错误，没有被封禁的
    onlyErrorsNoBanned: {
      title: "只有 API 错误（无封禁）",
      fromOthers: [],
      errors: [
        {
          email: "error1@example.com",
          error: "网络连接超时，请检查网络状态后重试",
          isBanned: false,
        },
        {
          email: "error2@gmail.com",
          error: "API 限流，请稍后重试",
          isBanned: false,
        },
      ],
    },

    // 场景4：只有 API 错误，有部分被封禁
    onlyErrorsWithBanned: {
      title: "API 错误（部分封禁）",
      fromOthers: [],
      errors: [
        {
          email: "banned@example.com",
          error: "该邮箱已被系统封禁，无法继续使用",
          isBanned: true,
        },
        {
          email: "retry@gmail.com",
          error: "临时错误，可以重试",
          isBanned: false,
        },
        {
          email: "banned2@outlook.com",
          error: "检测到异常行为，账户已被封禁",
          isBanned: true,
        },
      ],
    },

    // 场景5：混合情况，包含各种状态
    mixedScenario: {
      title: "混合情况（全部类型）",
      fromOthers: [
        { email: "others1@example.com", isBanned: false },
        { email: "others2@gmail.com", isBanned: true },
        { email: "others3@outlook.com", isBanned: false },
        { email: "others4@yahoo.com", isBanned: true },
        { email: "others5@hotmail.com", isBanned: false },
      ],
      errors: [
        {
          email: "error1@example.com",
          error: "网络连接失败，请检查网络后重试",
          isBanned: false,
        },
        {
          email: "banned1@gmail.com",
          error: "该邮箱涉嫌违规操作，已被永久封禁",
          isBanned: true,
        },
        {
          email: "error2@outlook.com",
          error: "服务器内部错误，建议稍后重试",
          isBanned: false,
        },
        {
          email: "banned2@yahoo.com",
          error: "检测到恶意行为，账户状态异常",
          isBanned: true,
        },
      ],
    },

    // 场景6：大量数据
    largeDataSet: {
      title: "大量数据测试",
      fromOthers: Array.from({ length: 10 }, (_, i) => ({
        email: `fromothers${i + 1}@example.com`,
        isBanned: i % 3 === 0,
      })),
      errors: Array.from({ length: 8 }, (_, i) => ({
        email: `error${i + 1}@test.com`,
        error: `测试错误消息 ${i + 1}：这是一个比较长的错误描述，用来测试在错误消息较长时的显示效果。`,
        isBanned: i % 4 === 0,
      })),
    },

    // 场景7：空状态
    emptyState: {
      title: "空状态",
      fromOthers: [],
      errors: [],
    },
  };

  const openModal = (scenarioKey: keyof typeof scenarios) => {
    const scenario = scenarios[scenarioKey];
    setModalState({
      isOpen: true,
      scenario: scenario.title,
      fromOthers: scenario.fromOthers,
      errors: scenario.errors,
    });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleRetry = (unbannedEmails: string[]) => {
    console.log("重试邮箱:", unbannedEmails);
    alert(
      `准备重试 ${unbannedEmails.length} 个邮箱:\n${unbannedEmails.join("\n")}`,
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-center text-3xl font-bold text-white">
          FailureDetailsModal 组件测试
        </h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(scenarios).map(([key, scenario]) => (
            <Card key={key} className="bg-dark-card">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-200">
                  {scenario.title}
                </h3>
              </CardHeader>
              <CardBody>
                <div className="mb-4 space-y-2 text-sm text-gray-400">
                  <p>来自别人: {scenario.fromOthers.length} 个</p>
                  <p>
                    其中封禁:{" "}
                    {scenario.fromOthers.filter((item) => item.isBanned).length}{" "}
                    个
                  </p>
                  <p>API 错误: {scenario.errors.length} 个</p>
                  <p>
                    其中封禁:{" "}
                    {scenario.errors.filter((item) => item.isBanned).length} 个
                  </p>
                  <p>
                    可重试:{" "}
                    {scenario.errors.filter((item) => !item.isBanned).length} 个
                  </p>
                </div>
                <Button
                  onPress={() => openModal(key as keyof typeof scenarios)}
                  color="primary"
                  variant="flat"
                  className="w-full"
                >
                  打开弹窗
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card className="mt-8 bg-dark-card">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-200">使用说明</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm text-gray-300">
              <p>• 点击任意卡片的"打开弹窗"按钮来查看对应场景下的弹窗样式</p>
              <p>• 弹窗中的"重试"按钮会在控制台输出可重试的邮箱列表</p>
              <p>• 每个场景都包含不同的数据组合，用于测试各种边界情况</p>
              <p>• 观察封禁邮箱的标识、错误信息的显示以及重试按钮的状态</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <FailureDetailsModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        fromOthers={modalState.fromOthers}
        errors={modalState.errors}
        onRetry={handleRetry}
      />
    </div>
  );
}
