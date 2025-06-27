"use client";

import { useRefreshTokensManager } from "@/hooks/useRefreshTokensManager";
import StatusOverview from "@/components/admin/refresh-tokens/StatusOverview";
import ProgressOverview from "@/components/admin/refresh-tokens/ProgressOverview";
import OperationPanel from "@/components/admin/refresh-tokens/OperationPanel";
import SingleRefreshResult from "@/components/admin/refresh-tokens/SingleRefreshResult";
import ExecutionResult from "@/components/admin/refresh-tokens/ExecutionResult";

export default function AdminRefreshTokensPage() {
  const {
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
  } = useRefreshTokensManager();

  return (
    <>
      {/* 状态概览 */}
      <StatusOverview
        unrefreshedAccounts={unrefreshedAccounts}
        progressInfo={progressInfo}
        isInitializing={isInitializing}
        loading={loading}
        onLoadUnrefreshedAccounts={loadUnrefreshedAccounts}
        onHandleBatchRefresh={handleBatchRefresh}
        onClearProgressInfo={clearProgressInfo}
        getProgressColor={getProgressColor}
      />

      {/* 进度概览 */}
      {progressInfo && (
        <ProgressOverview
          progressInfo={progressInfo}
          getProgressPercentage={getProgressPercentage}
          getProgressColor={getProgressColor}
        />
      )}

      {/* 操作面板 */}
      <OperationPanel
        progressInfo={progressInfo}
        batchSize={batchSize}
        loading={loading}
        isInitializing={isInitializing}
        setBatchSize={setBatchSize}
        onLoadUnrefreshedAccounts={loadUnrefreshedAccounts}
        onHandleBatchRefresh={handleBatchRefresh}
        singleEmail={singleEmail}
        singleRefreshLoading={singleRefreshLoading}
        setSingleEmail={setSingleEmail}
        onHandleSingleRefresh={handleSingleRefresh}
      />

      {/* 单个邮箱刷新结果 */}
      {singleRefreshResult && (
        <SingleRefreshResult result={singleRefreshResult} />
      )}

      {/* 执行结果 */}
      <ExecutionResult result={result} />
    </>
  );
}
