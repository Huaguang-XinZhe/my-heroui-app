"use client";

import { useState, useEffect } from "react";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "@/utils/toast";
import {
  batchRefreshTokens,
  getUnrefreshedAccounts,
  refreshSingleToken,
  type SingleRefreshResult,
} from "@/utils/refreshTokenUtils";

// 本地存储的键名
const BATCH_REFRESH_PROGRESS_KEY = "admin_batch_refresh_progress";

interface BatchProgressInfo {
  totalAccounts: number;
  processedCount: number;
  successCount: number;
  failureCount: number;
  lastBatchTime: number;
  remainingEmails: string[];
}

interface AccountInfo {
  email: string;
  service_provider: string;
  protocol_type: string;
  is_banned: boolean;
  refresh_token_updated_at: string | null;
}

export function useRefreshTokensManager() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [batchSize, setBatchSize] = useState<string>("20");
  const [progressInfo, setProgressInfo] = useState<BatchProgressInfo | null>(
    null,
  );
  const [unrefreshedAccounts, setUnrefreshedAccounts] = useState<AccountInfo[]>(
    [],
  );
  const [isInitializing, setIsInitializing] = useState(false);

  // 单个邮箱刷新相关状态
  const [singleEmail, setSingleEmail] = useState<string>("");
  const [singleRefreshLoading, setSingleRefreshLoading] = useState(false);
  const [singleRefreshResult, setSingleRefreshResult] =
    useState<SingleRefreshResult | null>(null);

  // 页面加载时恢复进度信息
  useEffect(() => {
    loadProgressInfo();
  }, []);

  const loadProgressInfo = () => {
    try {
      const stored = localStorage.getItem(BATCH_REFRESH_PROGRESS_KEY);
      if (stored) {
        const info: BatchProgressInfo = JSON.parse(stored);
        setProgressInfo(info);
      }
    } catch (error) {
      console.error("加载进度信息失败:", error);
    }
  };

  const saveProgressInfo = (info: BatchProgressInfo) => {
    try {
      localStorage.setItem(BATCH_REFRESH_PROGRESS_KEY, JSON.stringify(info));
      setProgressInfo(info);
    } catch (error) {
      console.error("保存进度信息失败:", error);
    }
  };

  const clearProgressInfo = () => {
    try {
      localStorage.removeItem(BATCH_REFRESH_PROGRESS_KEY);
      setProgressInfo(null);
    } catch (error) {
      console.error("清除进度信息失败:", error);
    }
  };

  // 获取所有未刷新 refresh_token 的邮箱账户
  const loadUnrefreshedAccounts = async () => {
    setIsInitializing(true);
    try {
      const response = await getUnrefreshedAccounts();

      if (!response.success || !response.data) {
        throw new Error(response.error || "获取未刷新账户失败");
      }

      const accounts = response.data.accounts;
      setUnrefreshedAccounts(
        accounts.map((acc) => ({
          email: acc.email,
          service_provider: acc.serviceProvider,
          protocol_type: acc.protocolType,
          is_banned: false,
          refresh_token_updated_at: null,
        })),
      );

      if (accounts.length === 0) {
        showWarningToast(
          "无需刷新",
          "没有找到需要刷新 refresh_token 的邮箱账户",
        );
        setResult("没有找到需要刷新 refresh_token 的邮箱账户");
        return;
      }

      const emails = accounts.map((acc) => acc.email);

      // 初始化进度信息
      const newProgressInfo: BatchProgressInfo = {
        totalAccounts: emails.length,
        processedCount: 0,
        successCount: 0,
        failureCount: 0,
        lastBatchTime: Date.now(),
        remainingEmails: [...emails],
      };

      saveProgressInfo(newProgressInfo);

      showSuccessToast(
        "初始化完成",
        `找到 ${emails.length} 个需要刷新 refresh_token 的邮箱账户`,
      );
      setResult(
        `初始化完成，找到 ${emails.length} 个需要刷新 refresh_token 的邮箱账户，准备分批刷新\n\n详细账户信息:\n${accounts.map((acc) => `${acc.email} (${acc.serviceProvider})`).join("\n")}`,
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "未知错误";
      showErrorToast("初始化失败", errorMsg);
      setResult(`初始化失败: ${errorMsg}`);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleBatchRefresh = async () => {
    if (!progressInfo || progressInfo.remainingEmails.length === 0) {
      showWarningToast("无法刷新", "没有剩余的邮箱需要刷新");
      return;
    }

    const batchSizeNum = parseInt(batchSize);
    if (isNaN(batchSizeNum) || batchSizeNum <= 0) {
      showErrorToast("参数错误", "批次大小必须是正整数");
      return;
    }

    setLoading(true);
    try {
      // 取出当前批次的邮箱
      const currentBatch = progressInfo.remainingEmails.slice(0, batchSizeNum);

      if (currentBatch.length === 0) {
        showWarningToast("刷新完成", "所有邮箱都已处理完毕");
        return;
      }

      showWarningToast(
        `开始刷新`,
        `正在刷新 ${currentBatch.length} 个邮箱的 refresh_token...`,
      );

      // 调用 API 刷新指定邮箱
      const response = await batchRefreshTokens({
        specificEmails: currentBatch,
      });

      if (response.success && response.data) {
        const data = response.data;

        // 更新进度信息
        const newProgressInfo: BatchProgressInfo = {
          ...progressInfo,
          processedCount: progressInfo.processedCount + currentBatch.length,
          successCount: progressInfo.successCount + data.successCount,
          failureCount:
            progressInfo.failureCount +
            (currentBatch.length - data.successCount),
          lastBatchTime: Date.now(),
          remainingEmails: progressInfo.remainingEmails.slice(batchSizeNum),
        };

        saveProgressInfo(newProgressInfo);

        const resultText = `
本次批次结果:
- 处理邮箱: ${currentBatch.length} 个
- 成功刷新: ${data.successCount} 个
- 失败: ${currentBatch.length - data.successCount} 个

总体进度:
- 总邮箱数: ${newProgressInfo.totalAccounts}
- 已处理: ${newProgressInfo.processedCount}
- 剩余: ${newProgressInfo.remainingEmails.length}
- 总成功: ${newProgressInfo.successCount}
- 总失败: ${newProgressInfo.failureCount}

详细结果:
${JSON.stringify(data, null, 2)}
        `;

        setResult(resultText);

        showSuccessToast(
          `批次完成`,
          `成功 ${data.successCount}/${currentBatch.length}，剩余 ${newProgressInfo.remainingEmails.length} 个`,
        );
      } else {
        throw new Error(response.error || "刷新失败");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "未知错误";
      setResult(`错误: ${errorMsg}`);
      showErrorToast("刷新失败", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    if (!progressInfo) return 0;
    return (progressInfo.processedCount / progressInfo.totalAccounts) * 100;
  };

  const getProgressColor = (): "success" | "primary" | "warning" | "danger" => {
    const percentage = getProgressPercentage();
    if (percentage === 100) return "success";
    if (percentage >= 80) return "primary";
    if (percentage >= 50) return "warning";
    return "danger";
  };

  // 处理单个邮箱刷新
  const handleSingleRefresh = async () => {
    if (!singleEmail.trim()) {
      showErrorToast("参数错误", "请输入邮箱地址");
      return;
    }

    setSingleRefreshLoading(true);
    setSingleRefreshResult(null);

    try {
      showWarningToast(
        "开始刷新",
        `正在刷新 ${singleEmail} 的 refresh_token...`,
      );

      const response = await refreshSingleToken(singleEmail.trim());

      if (response.success && response.data) {
        setSingleRefreshResult(response.data);

        if (response.data.tokenChanged) {
          showSuccessToast(
            "刷新成功",
            `${singleEmail} 的 refresh_token 已更新`,
          );
        } else {
          showWarningToast(
            "刷新完成",
            `${singleEmail} 的 refresh_token 未发生变化（可能本身就是最新的）`,
          );
        }
      } else {
        throw new Error(response.error || "刷新失败");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "未知错误";
      showErrorToast("刷新失败", errorMsg);
      setSingleRefreshResult({
        success: false,
        email: singleEmail,
        beforeRefresh: { refresh_token: null, refresh_token_updated_at: null },
        afterRefresh: { refresh_token: null, refresh_token_updated_at: null },
        tokenChanged: false,
        error: errorMsg,
      });
    } finally {
      setSingleRefreshLoading(false);
    }
  };

  return {
    // 状态
    loading,
    result,
    batchSize,
    progressInfo,
    unrefreshedAccounts,
    isInitializing,
    singleEmail,
    singleRefreshLoading,
    singleRefreshResult,

    // 设置函数
    setBatchSize,
    setSingleEmail,

    // 操作函数
    loadUnrefreshedAccounts,
    handleBatchRefresh,
    clearProgressInfo,
    handleSingleRefresh,
    getProgressPercentage,
    getProgressColor,
  };
}
