"use client";

import { useSyncExternalStore } from "react";

/**
 * 以 localStorage 為來源的小型 store，搭配 useSyncExternalStore 使用。
 * Server render 與 hydration 期間一律回傳預設值，避免 hydration mismatch；
 * hydration 完成後才切換成瀏覽器裡存的值。
 */
export function createLocalStore<T>(key: string, fallback: T, validate: (value: unknown) => T) {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null | undefined;
  let cachedValue: T = fallback;

  function read(): T {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      return fallback;
    }
    // useSyncExternalStore 要求同樣的資料回傳同一個參照，否則會無限重新 render
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    try {
      cachedValue = raw === null ? fallback : validate(JSON.parse(raw));
    } catch {
      cachedValue = fallback;
    }
    return cachedValue;
  }

  function write(value: T) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 無痕模式或儲存空間被封鎖時，退回只存在記憶體
      cachedRaw = JSON.stringify(value);
      cachedValue = value;
    }
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    // 其他分頁改了同一個 key 時也同步更新
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  function useValue(): T {
    return useSyncExternalStore(subscribe, read, () => fallback);
  }

  return { useValue, write, read };
}
