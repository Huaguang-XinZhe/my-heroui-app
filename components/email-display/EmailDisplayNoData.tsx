interface EmailDisplayNoDataProps {
  hasFetched: boolean;
  lastFetchType: "inbox" | "junk" | null;
  isEmpty?: boolean;
}

export function EmailDisplayNoData({
  hasFetched,
  lastFetchType,
  isEmpty = false,
}: EmailDisplayNoDataProps) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center text-gray-400">
        {isEmpty ? (
          <>
            <p className="text-lg">请先选择一个邮箱</p>
            <p className="mt-2 text-sm">从右侧 "我的邮箱" 中选择要查看的邮箱</p>
          </>
        ) : hasFetched ? (
          <>
            <p className="text-lg">该邮箱暂无邮件</p>
            <p className="mt-2 text-sm">
              {lastFetchType === "junk" ? "垃圾箱" : "收件箱"}
              中没有找到邮件
            </p>
          </>
        ) : (
          <>
            <p className="text-lg">暂无邮件</p>
            <p className="mt-2 text-sm">点击刷新按钮获取最新邮件</p>
          </>
        )}
      </div>
    </div>
  );
}
