"use client";

import { useState } from "react";
import { localDateKey, useTodayKey } from "../_lib/date";
import { createLocalStore } from "../_lib/local-store";
import { drawFortune, getLevel, LUCKY_COLORS, parseFortune, type Fortune } from "./fortune-data";

const SHAKE_DURATION_MS = 1600;
const KAI_FONT = "'DFKai-SB', 'BiauKai', 'KaiTi', 'STKaiti', serif";

type Stored = { date: string; fortune: Fortune | null };

// 記住今天抽到的籤，重新整理或之後再回來都還看得到
const todayStore = createLocalStore<Stored>("fortune:today", { date: "", fortune: null }, (raw) => {
  const v = (raw ?? {}) as Partial<Stored>;
  return { date: typeof v.date === "string" ? v.date : "", fortune: parseFortune(v.fortune) };
});

// 籤桶幾何（viewBox 240 x 300）
const CX = 120;
const RIM_Y = 160; // 桶口
const BOTTOM_Y = 276; // 桶底
const HALF_W = 60;
const STICK_PIVOT_Y = 262; // 籤在桶內的支點，扇形以此為中心展開
const WOOD = { light: "#f3d9a4", mid: "#e2b877", dark: "#b8864a" };
const STAVE = { a: "#ee6a2e", b: "#f47c3c", line: "#b9451c" };
const PANEL = "#ef6a2c";
const EMBLEM_Y = (RIM_Y + BOTTOM_Y) / 2 + 4;

// 扇形排列的籤：先畫外側，最後畫中間那支（也是抽中後會升起的那支）
const SIDE_STICKS = [
  { angle: -20, length: 176 },
  { angle: 20, length: 176 },
  { angle: -10, length: 188 },
  { angle: 10, length: 188 },
];
const CENTER_STICK_LENGTH = 196;

// 背景光芒與光點
const RAY_COUNT = 18;
const SPARKS = [
  { x: 22, y: 40, r: 2.4 },
  { x: 58, y: 18, r: 1.6 },
  { x: 196, y: 30, r: 2.2 },
  { x: 222, y: 92, r: 1.8 },
  { x: 14, y: 128, r: 1.7 },
  { x: 40, y: 196, r: 2.6 },
  { x: 214, y: 176, r: 2.4 },
  { x: 228, y: 238, r: 1.6 },
  { x: 18, y: 262, r: 2 },
  { x: 92, y: 10, r: 1.4 },
  { x: 168, y: 8, r: 1.8 },
  { x: 200, y: 280, r: 2.2 },
];

// Node 與瀏覽器的三角函數在最後幾位小數可能不同，四捨五入避免 hydration mismatch
function round(n: number) {
  return Math.round(n * 100) / 100;
}

function rayPoints(i: number) {
  const center = 360 / RAY_COUNT;
  const half = 3.2;
  const len = 170;
  const p = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return `${round(CX + len * Math.sin(rad))},${round(RIM_Y - len * Math.cos(rad))}`;
  };
  return `${CX},${RIM_Y} ${p(i * center - half)} ${p(i * center + half)}`;
}

// 一支籤：底端在 (0,0)，往上長 length，頂端是尖角；中間是橘色面板、外框是淺木色
function Stick({ length, panel }: { length: number; panel: string }) {
  const L = length;
  return (
    <>
      <path
        d={`M -23 0 V ${-(L - 28)} L 0 ${-L} L 23 ${-(L - 28)} V 0 Z`}
        fill={WOOD.light}
        stroke={WOOD.dark}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d={`M -15 ${-(L - 116)} V ${-(L - 31)} L 0 ${-(L - 12)} L 15 ${-(L - 31)} V ${-(L - 116)} Z`}
        fill={panel}
        strokeLinejoin="round"
      />
      <path d={`M 9 ${-(L - 114)} V ${-(L - 33)}`} stroke="white" strokeOpacity="0.25" strokeWidth="4" />
    </>
  );
}

function Stars({ count, color }: { count: number; color: string }) {
  return (
    <span aria-label={`${count} 顆星`} className="tracking-widest">
      <span style={{ color }}>{"★".repeat(count)}</span>
      <span className="text-black/15">{"★".repeat(5 - count)}</span>
    </span>
  );
}

export default function FortuneDraw() {
  const stored = todayStore.useValue();
  const todayKey = useTodayKey();
  const [shaking, setShaking] = useState(false);
  const [revealCount, setRevealCount] = useState(0); // 這次開啟頁面後抽了幾次，用來重播動畫

  const fortune = !shaking && todayKey !== "" && stored.date === todayKey ? stored.fortune : null;
  const level = fortune ? getLevel(fortune.level) : null;

  function draw() {
    if (shaking) return;
    setShaking(true);
    window.setTimeout(() => {
      todayStore.write({ date: localDateKey(), fortune: drawFortune() });
      setShaking(false);
      setRevealCount((n) => n + 1);
    }, SHAKE_DURATION_MS);
  }

  return (
    <div className="grid items-start gap-8 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <section className="flex flex-col items-center gap-5 overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_50%_38%,#5b3322_0%,#2a1810_55%,#160c07_100%)] px-6 py-8 text-amber-50 shadow-xl">
        <svg viewBox="0 0 240 300" className="w-full max-w-[280px] overflow-visible" role="img" aria-label="籤桶">
          <defs>
            <radialGradient id="fortune-ray" gradientUnits="userSpaceOnUse" cx={CX} cy={RIM_Y} r="170">
              <stop offset="0%" stopColor="#ffe9a8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#ffb547" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="fortune-glow" gradientUnits="userSpaceOnUse" cx={CX} cy={RIM_Y - 30} r="120">
              <stop offset="0%" stopColor="#ffd98a" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ffb547" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="fortune-shade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#5a1a05" stopOpacity="0.45" />
              <stop offset="30%" stopColor="#5a1a05" stopOpacity="0" />
              <stop offset="70%" stopColor="#5a1a05" stopOpacity="0" />
              <stop offset="100%" stopColor="#5a1a05" stopOpacity="0.5" />
            </linearGradient>
            <clipPath id="fortune-body-clip">
              <path
                d={`M ${CX - HALF_W} ${RIM_Y} V ${BOTTOM_Y} A ${HALF_W} 12 0 0 0 ${CX + HALF_W} ${BOTTOM_Y} V ${RIM_Y} A ${HALF_W} 12 0 0 1 ${CX - HALF_W} ${RIM_Y} Z`}
              />
            </clipPath>
            <filter id="fortune-spark" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="1.6" />
            </filter>
            <filter id="fortune-stick-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ffd27a" floodOpacity="0.75" />
            </filter>
          </defs>

          {/* 背景：放射狀光芒、柔光與漂浮的光點 */}
          <g pointerEvents="none">
            {Array.from({ length: RAY_COUNT }, (_, i) => (
              <polygon key={i} points={rayPoints(i)} fill="url(#fortune-ray)" opacity={i % 2 === 0 ? 0.55 : 0.3} />
            ))}
            <circle cx={CX} cy={RIM_Y - 30} r="120" fill="url(#fortune-glow)" />
            {SPARKS.map((s, i) => (
              <g key={i} className="animate-pulse" style={{ animationDelay: `${(i % 5) * 0.37}s` }}>
                <circle cx={s.x} cy={s.y} r={s.r * 2.2} fill="#ffcf6b" opacity="0.5" filter="url(#fortune-spark)" />
                <circle cx={s.x} cy={s.y} r={s.r} fill="#fff1c4" />
              </g>
            ))}
          </g>

          <g
            className={shaking ? "animate-fortune-shake" : ""}
            style={{ transformOrigin: `${CX}px ${BOTTOM_Y + 12}px`, transformBox: "view-box" }}
          >
            {/* 桶口：後半圈的木框與內側陰影 */}
            <ellipse cx={CX} cy={RIM_Y} rx={HALF_W} ry="12" fill={WOOD.mid} />
            <ellipse cx={CX} cy={RIM_Y + 1} rx={HALF_W - 7} ry="8" fill="#3a1a0c" />

            {/* 扇形的籤 */}
            <g filter="url(#fortune-stick-glow)">
              {SIDE_STICKS.map((s) => (
                <g key={s.angle} transform={`translate(${CX} ${STICK_PIVOT_Y}) rotate(${s.angle})`}>
                  <Stick length={s.length} panel={PANEL} />
                </g>
              ))}
              {/* 中間那支：抽完後從桶裡升起，面板換成籤等的顏色 */}
              <g
                style={{
                  transform: fortune ? "translateY(-46px)" : "translateY(0)",
                  transition: "transform 600ms cubic-bezier(0.2, 1.4, 0.4, 1)",
                }}
              >
                <g transform={`translate(${CX} ${STICK_PIVOT_Y})`}>
                  <Stick length={CENTER_STICK_LENGTH} panel={level?.color ?? PANEL} />
                </g>
              </g>
            </g>

            {/* 底座與小腳 */}
            <rect x={CX - HALF_W + 6} y={BOTTOM_Y + 8} width="12" height="16" rx="2" fill={WOOD.dark} />
            <rect x={CX + HALF_W - 18} y={BOTTOM_Y + 8} width="12" height="16" rx="2" fill={WOOD.dark} />
            <ellipse cx={CX} cy={BOTTOM_Y + 4} rx={HALF_W + 4} ry="13" fill={WOOD.mid} stroke={WOOD.dark} strokeWidth="1.5" />

            {/* 桶身：直條木板拼接 */}
            <g clipPath="url(#fortune-body-clip)">
              {Array.from({ length: 9 }, (_, i) => {
                const w = (HALF_W * 2) / 9;
                return (
                  <rect
                    key={i}
                    x={CX - HALF_W + i * w}
                    y={RIM_Y - 14}
                    width={w}
                    height={BOTTOM_Y - RIM_Y + 30}
                    fill={i % 2 === 0 ? STAVE.a : STAVE.b}
                    stroke={STAVE.line}
                    strokeWidth="1"
                  />
                );
              })}
              <rect x={CX - HALF_W} y={RIM_Y - 14} width={HALF_W * 2} height={BOTTOM_Y - RIM_Y + 30} fill="url(#fortune-shade)" />
            </g>

            {/* 上下兩圈淺木色箍 */}
            {[RIM_Y - 2, BOTTOM_Y - 14].map((y) => (
              <path
                key={y}
                d={`M ${CX - HALF_W} ${y} A ${HALF_W} 12 0 0 0 ${CX + HALF_W} ${y} V ${y + 13} A ${HALF_W} 12 0 0 1 ${CX - HALF_W} ${y + 13} Z`}
                fill={WOOD.light}
                stroke={WOOD.dark}
                strokeWidth="1.5"
              />
            ))}

            {/* 正面的圓形徽章 */}
            <circle cx={CX} cy={EMBLEM_Y} r="22" fill={PANEL} stroke="#fff4dc" strokeWidth="3" />
            <text
              x={CX}
              y={EMBLEM_Y + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="24"
              fontWeight="700"
              fill="#fff4dc"
              style={{ fontFamily: KAI_FONT }}
            >
              籤
            </text>
          </g>
        </svg>

        <button
          type="button"
          onClick={draw}
          disabled={shaking}
          className="rounded-full bg-gradient-to-b from-[#f8d77a] to-[#d9a428] px-8 py-3 text-lg font-bold text-[#5c1010] shadow-lg transition hover:brightness-110 active:scale-95 disabled:cursor-wait disabled:opacity-70"
        >
          {shaking ? "搖籤中…" : fortune ? "再抽一次" : "搖籤筒抽籤"}
        </button>
        <p className="text-center text-sm text-amber-100/70">
          {shaking ? "誠心默念想問的事…" : "心裡想著今天想問的事，按下按鈕搖一搖"}
        </p>
      </section>

      <section aria-live="polite">
        {!fortune || !level ? (
          <div className="flex min-h-80 items-center justify-center rounded-2xl border-2 border-dashed border-current/20 p-8 text-center opacity-60">
            {shaking ? "籤筒搖動中，馬上揭曉…" : "搖一搖籤筒，看看今天的運勢吧！"}
          </div>
        ) : (
          <article
            key={revealCount}
            className="animate-fortune-unfold overflow-hidden rounded-2xl border-4 bg-[#fbf6ea] text-[#3b2f2f] shadow-xl"
            style={{ borderColor: level.color }}
          >
            <header className="flex items-stretch gap-4 border-b-2 border-dashed border-black/10 p-5">
              <div
                className="flex shrink-0 items-center justify-center rounded-lg px-3 py-4 text-white"
                style={{ backgroundColor: level.color }}
              >
                <span
                  className="text-5xl font-bold leading-none"
                  style={{ writingMode: "vertical-rl", fontFamily: KAI_FONT, letterSpacing: "0.1em" }}
                >
                  {level.name}
                </span>
              </div>
              <div className="flex flex-col justify-center gap-2">
                <p className="text-sm text-black/50">
                  第 {fortune.no} 籤・{stored.date} 的運勢
                  {revealCount === 0 && "（今天已經抽過囉）"}
                </p>
                <p className="text-xl font-bold leading-relaxed" style={{ fontFamily: KAI_FONT }}>
                  {fortune.message}
                </p>
              </div>
            </header>

            <dl className="grid gap-3 p-5 sm:grid-cols-2">
              {fortune.categories.map((c) => (
                <div key={c.key} className="rounded-lg bg-white/70 p-3">
                  <dt className="flex items-center justify-between font-bold">
                    {c.label}
                    <Stars count={c.stars} color={level.color} />
                  </dt>
                  <dd className="mt-1 text-sm text-black/70">{c.comment}</dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-wrap gap-x-6 gap-y-2 px-5 pb-4 text-sm">
              <span className="flex items-center gap-1.5">
                幸運色：
                <span
                  className="inline-block size-3.5 rounded-full ring-1 ring-black/20"
                  style={{ backgroundColor: LUCKY_COLORS.find((c) => c.name === fortune.luckyColor)?.hex }}
                />
                <b>{fortune.luckyColor}</b>
              </span>
              <span>
                幸運數字：<b>{fortune.luckyNumber}</b>
              </span>
              <span>
                幸運方位：<b>{fortune.luckyDirection}</b>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 px-5 pb-5">
              <div className="rounded-lg border border-[#c0262d]/30 bg-[#c0262d]/5 p-3">
                <p className="mb-1 font-bold text-[#c0262d]" style={{ fontFamily: KAI_FONT }}>
                  宜
                </p>
                <p className="text-sm">{fortune.good.join("、")}</p>
              </div>
              <div className="rounded-lg border border-black/20 bg-black/5 p-3">
                <p className="mb-1 font-bold" style={{ fontFamily: KAI_FONT }}>
                  忌
                </p>
                <p className="text-sm">{fortune.bad.join("、")}</p>
              </div>
            </div>

            {level.bad && (
              <p className="mx-5 mb-5 rounded-lg bg-amber-100 p-3 text-sm text-amber-900">
                🎋 傳統上抽到凶籤，會把籤紙綁在寺廟的樹枝上，把壞運留在那裡。今天就把煩惱留在這裡，輕鬆面對吧！
              </p>
            )}
          </article>
        )}
      </section>
    </div>
  );
}
