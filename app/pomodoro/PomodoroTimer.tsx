"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { localDateKey, useTodayKey } from "../_lib/date";
import { createLocalStore } from "../_lib/local-store";

type Mode = "work" | "short" | "long";
type Status = "idle" | "running" | "paused";

type Settings = {
  work: number; // 分鐘
  short: number;
  long: number;
  longEvery: number; // 每完成幾個蕃茄來一次長休息
  autoStart: boolean;
  sound: boolean;
};

type Stats = { date: string; count: number };

const DEFAULT_SETTINGS: Settings = {
  work: 25,
  short: 5,
  long: 15,
  longEvery: 4,
  autoStart: false,
  sound: true,
};

// 參考圖的柔和配色：淡色底、扁平蕃茄；休息模式換成薄荷綠／淡藍底
const MODES: Record<Mode, { label: string; accent: string; bg: string; track: string; ink: string }> = {
  work: { label: "專注", accent: "#e86b6b", bg: "#fdf0ef", track: "#fbe1df", ink: "#8a3f37" },
  short: { label: "短休息", accent: "#4fb286", bg: "#eef8f2", track: "#d7efe2", ink: "#2f6b50" },
  long: { label: "長休息", accent: "#6c8cdb", bg: "#eff3fd", track: "#dbe4f8", ink: "#3b4f86" },
};

const TOMATO = { shade: "#e07a5f", body: "#ee8d70", leaf: "#8fd06c", stem: "#6db34d" };

// 蒂頭的 5 片葉子，以「正下方為 0 度」往兩側展開
const LEAF_ANGLES = [-105, -55, 0, 55, 105];

const RING_RADIUS = 128;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const PAGE_TITLE = "蕃茄鐘 | Alec 的小工具箱";

function clampInt(value: unknown, min: number, max: number, fallback: number) {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

const settingsStore = createLocalStore<Settings>("pomodoro:settings", DEFAULT_SETTINGS, (raw) => {
  const v = (raw ?? {}) as Partial<Settings>;
  return {
    work: clampInt(v.work, 1, 180, DEFAULT_SETTINGS.work),
    short: clampInt(v.short, 1, 60, DEFAULT_SETTINGS.short),
    long: clampInt(v.long, 1, 120, DEFAULT_SETTINGS.long),
    longEvery: clampInt(v.longEvery, 1, 12, DEFAULT_SETTINGS.longEvery),
    autoStart: typeof v.autoStart === "boolean" ? v.autoStart : DEFAULT_SETTINGS.autoStart,
    sound: typeof v.sound === "boolean" ? v.sound : DEFAULT_SETTINGS.sound,
  };
});

const statsStore = createLocalStore<Stats>("pomodoro:stats", { date: "", count: 0 }, (raw) => {
  const v = (raw ?? {}) as Partial<Stats>;
  return {
    date: typeof v.date === "string" ? v.date : "",
    count: clampInt(v.count, 0, 10000, 0),
  };
});

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function playChime(ctx: AudioContext) {
  const notes = [880, 660, 880, 1046];
  notes.forEach((freq, i) => {
    const start = ctx.currentTime + i * 0.28;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.3, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.26);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.3);
  });
}

export default function PomodoroTimer() {
  const settings = settingsStore.useValue();
  const stats = statsStore.useValue();

  const [mode, setMode] = useState<Mode>("work");
  const [status, setStatus] = useState<Status>("idle");
  const [remainingMs, setRemainingMs] = useState(0);
  const [cycleCount, setCycleCount] = useState(0); // 距離上次長休息已完成幾個蕃茄
  const todayKey = useTodayKey();
  const [task, setTask] = useState("");

  const endAtRef = useRef(0);
  const audioRef = useRef<AudioContext | null>(null);

  const durationMs = (m: Mode) => settings[m] * 60_000;
  const totalMs = durationMs(mode);
  const shownMs = status === "idle" ? totalMs : remainingMs;
  const progress = Math.min(1, Math.max(0, 1 - shownMs / totalMs));
  const todayCount = todayKey !== "" && stats.date === todayKey ? stats.count : 0;
  const { label, accent, bg, track, ink } = MODES[mode];

  function notify(title: string, body: string) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    if (!document.hidden) return; // 正在看這個頁面時就不必跳系統通知
    try {
      new Notification(title, { body, tag: "pomodoro" });
    } catch {
      // 部分瀏覽器（例如 Android Chrome）不允許直接 new Notification
    }
  }

  function startMode(next: Mode, autoRun: boolean) {
    setMode(next);
    if (autoRun) {
      endAtRef.current = Date.now() + durationMs(next);
      setRemainingMs(durationMs(next));
      setStatus("running");
    } else {
      setStatus("idle");
    }
  }

  function finish() {
    if (settings.sound && audioRef.current) playChime(audioRef.current);

    if (mode === "work") {
      const today = localDateKey();
      const current = statsStore.read();
      statsStore.write({ date: today, count: (current.date === today ? current.count : 0) + 1 });
      const nextCycle = cycleCount + 1;
      const next: Mode = nextCycle >= settings.longEvery ? "long" : "short";
      setCycleCount(next === "long" ? 0 : nextCycle);
      notify("🍅 完成一個蕃茄！", next === "long" ? "辛苦了，來個長休息吧" : "起來動一動，休息一下");
      startMode(next, settings.autoStart);
    } else {
      notify("⏰ 休息結束", "準備好就開始下一個蕃茄");
      startMode("work", settings.autoStart);
    }
  }

  // 用結束時間點反推剩餘時間，分頁被切到背景、計時器被瀏覽器降頻也不會跑慢
  useEffect(() => {
    if (status !== "running") return;
    const timer = window.setInterval(() => {
      const left = endAtRef.current - Date.now();
      if (left <= 0) finish();
      else setRemainingMs(left);
    }, 250);
    return () => window.clearInterval(timer);
  });

  // 分頁標題顯示倒數，切到別的分頁也看得到
  useEffect(() => {
    const focus = mode === "work" && task.trim() ? task.trim() : label;
    document.title = status === "idle" ? PAGE_TITLE : `${formatTime(shownMs)} ${focus}｜蕃茄鐘`;
  }, [status, shownMs, label, mode, task]);
  useEffect(() => () => void (document.title = PAGE_TITLE), []);

  function start() {
    // AudioContext 必須在使用者操作中建立，瀏覽器才允許之後播放聲音
    if (!audioRef.current && typeof AudioContext !== "undefined") audioRef.current = new AudioContext();
    void audioRef.current?.resume();
    if ("Notification" in window && Notification.permission === "default") {
      void Notification.requestPermission();
    }

    const left = status === "paused" ? remainingMs : totalMs;
    endAtRef.current = Date.now() + left;
    setRemainingMs(left);
    setStatus("running");
  }

  function pause() {
    setRemainingMs(Math.max(0, endAtRef.current - Date.now()));
    setStatus("paused");
  }

  function toggle() {
    if (status === "running") pause();
    else start();
  }

  function reset() {
    setStatus("idle");
  }

  function skip() {
    startMode(mode === "work" ? "short" : "work", false);
  }

  function selectMode(next: Mode) {
    startMode(next, false);
  }

  // 空白鍵開始／暫停（正在輸入文字或焦點在按鈕上時不攔截）
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code !== "Space" || e.repeat) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON" || tag === "SELECT") return;
      e.preventDefault();
      toggle();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    settingsStore.write({ ...settings, [key]: value });
  }

  return (
    <div
      className="grid items-start gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]"
      style={{ "--accent": accent, "--track": track, "--ink": ink, "--bg": bg } as CSSProperties}
    >
      <section
        className="flex w-full flex-col items-center gap-6 rounded-3xl px-4 py-8 transition-colors duration-500"
        style={{ backgroundColor: bg, color: ink }}
      >
        <div role="tablist" aria-label="計時模式" className="flex flex-wrap justify-center gap-2">
          {(Object.keys(MODES) as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => selectMode(m)}
              className="rounded-full px-4 py-1.5 text-sm font-semibold transition-colors"
              style={
                mode === m
                  ? { backgroundColor: MODES[m].accent, color: "white" }
                  : { backgroundColor: "rgba(255,255,255,0.7)", color: MODES[m].accent }
              }
            >
              {MODES[m].label}
            </button>
          ))}
        </div>

        {task.trim() && (
          <p className="max-w-full truncate text-center text-lg font-semibold">🎯 {task.trim()}</p>
        )}

        <div className="relative w-full max-w-[320px]">
          <svg viewBox="0 0 280 280" className="w-full overflow-visible" aria-hidden="true">
            <defs>
              <clipPath id="pomo-tomato-body">
                <circle cx="140" cy="146" r="104" />
              </clipPath>
            </defs>

            {/* 外圈軌道與進度弧：從正上方順時針，隨經過時間增長 */}
            <circle cx="140" cy="140" r={RING_RADIUS} fill="none" stroke={track} strokeWidth="8" />
            <circle
              cx="140"
              cy="140"
              r={RING_RADIUS}
              fill="none"
              stroke={accent}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
              transform="rotate(-90 140 140)"
              opacity={progress > 0 ? 1 : 0}
              className="transition-[stroke-dashoffset,stroke] duration-300 ease-linear"
            />

            {/* 蕃茄本體：深色底 + 偏右上的亮色圓，留下左下的月牙陰影 */}
            <g clipPath="url(#pomo-tomato-body)">
              <circle cx="140" cy="146" r="104" fill={TOMATO.shade} />
              <circle cx="154" cy="138" r="100" fill={TOMATO.body} />
            </g>

            {/* 蒂頭與葉子 */}
            <path
              d="M 140 50 C 139 38, 135 28, 128 20"
              fill="none"
              stroke={TOMATO.stem}
              strokeWidth="7"
              strokeLinecap="round"
            />
            {LEAF_ANGLES.map((angle) => (
              <ellipse
                key={angle}
                cx="140"
                cy="66"
                rx="10"
                ry="18"
                fill={TOMATO.leaf}
                transform={`rotate(${angle} 140 50)`}
              />
            ))}
            <circle cx="140" cy="51" r="9" fill={TOMATO.leaf} />

            <text
              x="140"
              y="150"
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize="54"
              fontWeight="500"
              letterSpacing="3"
              className="font-sans tabular-nums"
              role="timer"
            >
              {formatTime(shownMs)}
            </text>
            <text
              x="140"
              y="198"
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fillOpacity="0.85"
              fontSize="14"
              fontWeight="600"
              letterSpacing="2"
            >
              {label}・{status === "running" ? "進行中" : status === "paused" ? "已暫停" : "準備開始"}
            </text>
          </svg>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            disabled={status === "idle"}
            className="rounded-full bg-white/80 px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-white disabled:opacity-40"
          >
            重設
          </button>
          <button
            type="button"
            onClick={toggle}
            className="min-w-36 rounded-full px-8 py-3 text-lg font-bold text-white shadow-md transition hover:brightness-110 active:scale-95"
            style={{ backgroundColor: accent }}
          >
            {status === "running" ? "暫停" : status === "paused" ? "繼續" : "開始"}
          </button>
          <button
            type="button"
            onClick={skip}
            className="rounded-full bg-white/80 px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-white"
          >
            跳過
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 text-sm">
          <div className="flex gap-1.5" aria-label={`這一輪已完成 ${cycleCount} / ${settings.longEvery} 個蕃茄`}>
            {Array.from({ length: settings.longEvery }, (_, i) => (
              <span
                key={i}
                className="size-3 rounded-full"
                style={{ backgroundColor: i < cycleCount ? TOMATO.body : "rgba(0,0,0,0.1)" }}
              />
            ))}
          </div>
          <p className="opacity-70">今日已完成 {todayCount} 個蕃茄 🍅</p>
        </div>
      </section>

      {/* 右側面板：跟著目前模式換色，與左邊計時器同一套配色 */}
      <aside className="flex flex-col gap-4 text-(--ink) transition-colors duration-500">
        <label className="flex flex-col gap-3 rounded-3xl border-2 border-(--track) bg-white p-5 shadow-sm transition-colors duration-500">
          <span className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-(--bg) text-xl transition-colors duration-500">
              🎯
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-bold">現在要專注的事</span>
              <span className="text-xs opacity-60">會顯示在蕃茄上方與分頁標題</span>
            </span>
          </span>
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="例如：寫完週報"
            className="rounded-xl border-2 border-(--track) bg-(--bg) px-4 py-2.5 text-[#3a2a28] outline-none transition placeholder:text-black/30 focus:border-(--accent)"
          />
        </label>

        <section className="flex flex-col gap-4 rounded-3xl border-2 border-(--track) bg-white p-5 text-sm shadow-sm transition-colors duration-500">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-(--bg) text-xl transition-colors duration-500">
              ⚙️
            </span>
            <span className="text-base font-bold">設定</span>
            <button
              type="button"
              onClick={() => settingsStore.write(DEFAULT_SETTINGS)}
              className="ml-auto rounded-full px-3 py-1 text-xs font-semibold opacity-60 transition hover:bg-(--bg) hover:opacity-100"
            >
              ↺ 恢復預設
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["work", "專注", "分鐘", 1, 180],
                ["short", "短休息", "分鐘", 1, 60],
                ["long", "長休息", "分鐘", 1, 120],
                ["longEvery", "長休息間隔", "個蕃茄", 1, 12],
              ] as const
            ).map(([key, text, unit, min, max]) => (
              <label
                key={key}
                className="flex flex-col gap-1 rounded-2xl bg-(--bg) px-3 py-2.5 transition-colors duration-500 focus-within:ring-2 focus-within:ring-(--accent)"
              >
                <span className="text-xs font-semibold opacity-70">{text}</span>
                <span className="flex items-baseline gap-1">
                  <input
                    type="number"
                    min={min}
                    max={max}
                    value={settings[key]}
                    disabled={status !== "idle" && key === mode}
                    onChange={(e) => {
                      if (e.target.value === "") return;
                      updateSetting(key, clampInt(e.target.value, min, max, settings[key]));
                    }}
                    className="w-full min-w-0 bg-transparent text-2xl font-bold tabular-nums outline-none disabled:opacity-40"
                  />
                  <span className="shrink-0 text-xs opacity-60">{unit}</span>
                </span>
              </label>
            ))}
          </div>

          <div className="flex flex-col divide-y divide-(--track) border-t-2 border-(--track)">
            {(
              [
                ["autoStart", "時間到自動開始下一段"],
                ["sound", "時間到播放提示音"],
              ] as const
            ).map(([key, text]) => (
              <label key={key} className="flex cursor-pointer items-center justify-between gap-3 py-3">
                <span className="font-medium">{text}</span>
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={(e) => updateSetting(key, e.target.checked)}
                  className="peer sr-only"
                />
                {/* 自訂開關樣式 */}
                <span className="relative h-6 w-11 shrink-0 rounded-full bg-black/15 transition peer-checked:bg-(--accent) peer-focus-visible:ring-2 peer-focus-visible:ring-(--accent) peer-focus-visible:ring-offset-2 after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
              </label>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
