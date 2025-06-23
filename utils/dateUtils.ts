/**
 * 格式化时间显示，返回显示信息和位置
 */
export function getTimeDisplay(timestamp?: number) {
  if (!timestamp) return null;

  const now = new Date();
  const fetchTime = new Date(timestamp);

  // 检查是否是今天
  const isToday =
    now.getFullYear() === fetchTime.getFullYear() &&
    now.getMonth() === fetchTime.getMonth() &&
    now.getDate() === fetchTime.getDate();

  if (isToday) {
    // 今天：只显示时间
    return {
      display: fetchTime.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      showBelow: false,
    };
  }

  // 计算是否在本周内
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  if (fetchTime >= startOfWeek && fetchTime <= endOfWeek) {
    // 本周内：显示周几
    const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return {
      display: weekdays[fetchTime.getDay()],
      showBelow: false,
    };
  }

  // 其他情况：根据是否是当年决定显示格式
  const isCurrentYear = now.getFullYear() === fetchTime.getFullYear();

  if (isCurrentYear) {
    // 当年：显示月-日
    const display = fetchTime.toLocaleDateString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
    });
    return {
      display,
      showBelow: false,
    };
  } else {
    // 非当年：显示完整日期，放在下方
    const display = fetchTime.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return {
      display,
      showBelow: true,
    };
  }
}

/**
 * 格式化邮件日期显示
 */
export function formatEmailDate(date: string | Date): string {
  const emailDate = typeof date === "string" ? new Date(date) : date;
  const now = new Date();

  // 计算时间差
  const diffMs = now.getTime() - emailDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // 今天：显示时间
    return emailDate.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } else if (diffDays === 1) {
    // 昨天
    return "昨天";
  } else if (diffDays < 7) {
    // 一周内：显示周几
    const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return weekdays[emailDate.getDay()];
  } else if (emailDate.getFullYear() === now.getFullYear()) {
    // 当年：显示月-日
    return emailDate.toLocaleDateString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
    });
  } else {
    // 其他年份：显示完整日期
    return emailDate.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }
}
