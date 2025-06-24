"use client";

import { IconHistory } from "./icons/icons";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { HistorySection } from "./HistorySection";
import { SearchInput } from "./SearchInput";
import { useState } from "react";

// 定义历史数据集合
const historySections = [
  {
    title: "今天",
    items: [
      {
        id: "1",
        title: "GitHub 验证码",
        content: "2FA: 145879",
        time: "14:30",
      },
      { id: "2", title: "Apple ID", content: "验证码: 894562", time: "10:25" },
    ],
  },
  {
    title: "昨天",
    items: [
      {
        id: "3",
        title: "微软账号",
        content: "安全代码: 235781",
        time: "23:15",
      },
      { id: "4", title: "Amazon", content: "订单确认: #78945", time: "18:40" },
    ],
  },
  {
    title: "本周",
    items: [
      { id: "5", title: "PayPal", content: "付款确认: $45.99", time: "周二" },
      { id: "6", title: "LinkedIn", content: "新消息通知", time: "周一" },
    ],
  },
  {
    title: "更早",
    items: [
      { id: "7", title: "腾讯云", content: "服务器到期提醒", time: "06-05" },
      { id: "8", title: "Dropbox", content: "存储空间更新", time: "06-01" },
    ],
  },
];

export function HistorySidebar() {
  const [searchQuery, setSearchQuery] = useState("");

  // 过滤历史数据
  const filteredSections = historySections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        Object.values(item).some((field) =>
          String(field).toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside className="hidden overflow-hidden rounded-xl border border-dark-border bg-dark-card p-4 shadow-lg xl:flex xl:flex-col">
      <h2 className="mb-4 flex items-center text-lg font-semibold text-indigo-500">
        <IconHistory className="mr-2" />
        历史邮件
      </h2>

      {/* 搜索框 */}
      <SearchInput
        placeholder="搜索历史邮件..."
        value={searchQuery}
        onChange={setSearchQuery}
        onClear={() => setSearchQuery("")}
      />

      {/* 这里只定义 scrollbar-track 没用，得同时定义 scrollbar-thumb 才能使 track 生效❗ */}
      {/* <div className="scrollbar-thin scrollbar-track-dark-card scrollbar-thumb-gray-700/80 flex-1 overflow-y-auto"> */}
      <ScrollShadow hideScrollBar size={100} className="flex-1">
        <div className="p-2">
          {/* 遍历历史数据集合 */}
          {filteredSections.map((section, index) => (
            <HistorySection
              key={index}
              title={section.title}
              items={section.items}
            />
          ))}
        </div>
      </ScrollShadow>
    </aside>
  );
}
