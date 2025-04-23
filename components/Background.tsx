import React from "react";

/**
 * 背景组件，包含渐变背景和光效元素
 * 响应式设计：
 * - 小屏：只保留左下主要光效
 * - 中屏：保留左下和右上光效
 * - 大屏：显示所有光效
 */
export const Background: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-br from-[#030712] via-[#0F172A] to-[#1E293B]">
      {/* 光效元素 - 右上角（中屏以上显示） */}
      <div className="pointer-events-none absolute right-[5%] top-[10%] z-10 hidden h-[300px] w-[300px] rounded-full bg-indigo-500/10 blur-[100px] md:block"></div>

      {/* 光效元素 - 左下角（主要光效，所有屏幕都显示） */}
      <div className="pointer-events-none absolute bottom-[10%] left-[5%] z-10 h-[250px] w-[250px] rounded-full bg-purple-500/10 blur-[80px]"></div>

      {/* 光效元素 - 左中部（仅大屏显示） */}
      <div className="pointer-events-none absolute left-[10%] top-[40%] z-10 hidden h-[150px] w-[150px] rounded-full bg-blue-600/5 blur-[60px] lg:block"></div>

      {/* 光效元素 - 中下部（仅大大屏显示） */}
      {/* <div className="pointer-events-none absolute bottom-[12%] left-[48%] z-10 hidden h-[200px] w-[350px] -translate-x-1/3 rounded-full bg-cyan-500/10 blur-[90px] xl:block"></div> */}

      <div className="relative z-0">{children}</div>
    </div>
  );
};

export default Background;
