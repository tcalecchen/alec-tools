"use client";

import { useEffect, useState } from "react";

// 以本地時間取日期（不用 toISOString，那是 UTC，台灣早上 8 點前會算成前一天）
export function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * 今天的本地日期（YYYY-MM-DD）。Server render 與 hydration 期間回傳空字串，
 * 之後才在瀏覽器端取得；每分鐘檢查一次，跨過午夜會自動更新。
 */
export function useTodayKey() {
  const [todayKey, setTodayKey] = useState("");

  useEffect(() => {
    const update = () => setTodayKey(localDateKey());
    const first = window.setTimeout(update, 0);
    const timer = window.setInterval(update, 60_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, []);

  return todayKey;
}
