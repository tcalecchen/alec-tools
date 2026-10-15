"use client";

import { useMemo, useState } from "react";
import Fireworks from "./Fireworks";

const SPIN_DURATION_MS = 5000;
const EXTRA_TURNS = 6;

// SVG 畫布與轉盤幾何
const VIEW_W = 600;
const VIEW_H = 620;
const CX = 300;
const CY = 335;
const RADIUS = 226; // 扇形半徑
const RIM_RADIUS = 242; // 金框中線
const RIM_WIDTH = 30;
const OUTER_RING_RADIUS = 262; // 最外圈橘色光環
const HUB_RADIUS = 50;
const BULB_COUNT = 12;

const DEFAULT_NAMES = ["小明", "小華", "小美", "阿強", "小芳", "大雄"].join("\n");

// 參考圖的配色（由正上方順時針）：黃、藍、綠、紅、棕、紫
const PALETTE = [
  { id: "yellow", light: "#fff3a3", base: "#e9c53b", dark: "#9c7a12" },
  { id: "blue", light: "#8fa8ff", base: "#3b5bdb", dark: "#1a2a80" },
  { id: "green", light: "#a6e36b", base: "#4c9a1f", dark: "#1f4d0a" },
  { id: "red", light: "#ff8f8f", base: "#d63031", dark: "#7a0f10" },
  { id: "tan", light: "#ffd2a3", base: "#d9935a", dark: "#8a4f1f" },
  { id: "purple", light: "#d08cff", base: "#8e44c9", dark: "#4a1a7a" },
];

const COINS = [
  { x: 40, y: 175, r: 28 },
  { x: 570, y: 185, r: 26 },
  { x: 30, y: 300, r: 20 },
  { x: 566, y: 252, r: 20 },
  { x: 556, y: 440, r: 24 },
  { x: 66, y: 482, r: 28 },
  { x: 128, y: 575, r: 34 },
  { x: 402, y: 582, r: 28 },
];

const SPARKLES = [
  { x: 40, y: 112, s: 14 },
  { x: 520, y: 70, s: 10 },
  { x: 100, y: 545, s: 12 },
  { x: 585, y: 410, s: 9 },
  { x: 360, y: 560, s: 10 },
];

function parseNames(text: string): string[] {
  return text
    .split("\n")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
}

// Node 與瀏覽器的三角函數在最後幾位小數可能不同，四捨五入避免 hydration mismatch
function round(n: number) {
  return Math.round(n * 1000) / 1000;
}

// 角度以「正上方為 0 度、順時針增加」計算，與指針位置一致
function pointOnCircle(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: round(CX + radius * Math.sin(rad)),
    y: round(CY - radius * Math.cos(rad)),
  };
}

function sectorPath(startDeg: number, endDeg: number) {
  const start = pointOnCircle(startDeg, RADIUS);
  const end = pointOnCircle(endDeg, RADIUS);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

// 依序循環配色；若最後一格會與第一格同色，就換一個顏色避免相鄰重複
function colorIndexFor(i: number, total: number) {
  const index = i % PALETTE.length;
  if (total > 1 && i === total - 1 && index === 0) return 2;
  return index;
}

function truncate(name: string, max: number) {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

function starPoints(cx: number, cy: number, outer: number, inner: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i;
    return `${round(cx + r * Math.sin(a))},${round(cy - r * Math.cos(a))}`;
  }).join(" ");
}

export default function LotteryWheel() {
  const [namesText, setNamesText] = useState(DEFAULT_NAMES);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [removeWinner, setRemoveWinner] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  // 每抽中一次就 +1，用來觸發煙火與中獎動畫
  const [celebration, setCelebration] = useState(0);
  const [showWinnerCard, setShowWinnerCard] = useState(false);

  const names = useMemo(() => parseNames(namesText), [namesText]);
  const segmentAngle = names.length > 0 ? 360 / names.length : 360;
  const fontSize = Math.max(11, Math.min(26, 300 / Math.max(names.length, 1)));
  const maxChars = names.length > 20 ? 4 : 7;
  const canSpin = !spinning && names.length >= 2;

  function spin() {
    if (!canSpin) return;

    const winnerIndex = Math.floor(Math.random() * names.length);
    // 停在扇形內的隨機位置，但避開邊界，免得指針看起來壓在兩格中間
    const jitter = (Math.random() - 0.5) * segmentAngle * 0.7;
    const targetAngle = winnerIndex * segmentAngle + segmentAngle / 2 + jitter;

    // 轉盤順時針轉 R 度後，指針對到的是轉盤上的 (-R mod 360) 度
    const current = ((rotation % 360) + 360) % 360;
    const desired = (((360 - targetAngle) % 360) + 360) % 360;
    const delta = (desired - current + 360) % 360;
    const nextRotation = rotation + EXTRA_TURNS * 360 + delta;

    setWinner(null);
    setSpinning(true);
    setRotation(nextRotation);

    const picked = names[winnerIndex];
    window.setTimeout(() => {
      setSpinning(false);
      setWinner(picked);
      setHistory((prev) => [picked, ...prev]);
      setCelebration((n) => n + 1);
      setShowWinnerCard(true);
    }, SPIN_DURATION_MS);
  }

  function removeCurrentWinner() {
    if (!winner) return;
    const index = names.indexOf(winner);
    if (index === -1) return;
    const next = [...names.slice(0, index), ...names.slice(index + 1)];
    setNamesText(next.join("\n"));
    setWinner(null);
    setShowWinnerCard(false);
  }

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
      <section className="relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-amber-300/30 bg-gradient-to-b from-[#16205e] via-[#0f1847] to-[#0a1033] p-5 text-white shadow-xl">
        {/* 背景光暈，呼應右側轉盤的金色調 */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-amber-400/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-12 size-44 rounded-full bg-indigo-500/25 blur-3xl"
        />

        <label className="relative flex flex-col gap-3">
          <span className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-yellow-200 via-amber-400 to-orange-600 text-lg shadow-[0_0_14px_rgba(255,190,60,0.5)]">
              🎫
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-lg font-bold tracking-wide text-amber-100">抽獎名單</span>
              <span className="text-xs text-white/50">一行輸入一個名字</span>
            </span>
            <span className="ml-auto rounded-full border border-amber-300/50 bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-200">
              共 <span className="text-sm font-extrabold text-amber-300">{names.length}</span> 人
            </span>
          </span>
          <textarea
            value={namesText}
            onChange={(e) => {
              setNamesText(e.target.value);
              setWinner(null);
            }}
            disabled={spinning}
            rows={12}
            placeholder="一行輸入一個名字"
            className="w-full resize-y rounded-xl border border-white/15 bg-black/30 p-4 font-mono text-sm leading-7 text-white shadow-inner outline-none transition placeholder:text-white/30 focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/30 disabled:opacity-60"
          />
        </label>

        <label className="relative flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm transition hover:bg-white/10">
          <input
            type="checkbox"
            checked={removeWinner}
            onChange={(e) => setRemoveWinner(e.target.checked)}
            className="peer sr-only"
          />
          {/* 自訂開關樣式 */}
          <span className="relative h-6 w-11 shrink-0 rounded-full bg-white/20 transition peer-checked:bg-amber-400 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-300 after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
          <span className="text-white/85">
            抽中後提供「從名單移除」按鈕
            <span className="block text-xs text-white/45">避免同一人重複中獎</span>
          </span>
        </label>

        {history.length > 0 && (
          <div className="relative rounded-xl border border-amber-300/25 bg-black/25 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-bold text-amber-100">
                🏆 中獎紀錄
              </span>
              <button
                type="button"
                onClick={() => setHistory([])}
                className="rounded-full px-2 py-0.5 text-xs text-white/50 transition hover:bg-white/10 hover:text-white"
              >
                清除
              </button>
            </div>
            <ol className="space-y-2 text-sm">
              {[...history].reverse().map((name, i) => (
                <li key={`${name}-${i}`} className="flex items-center gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-yellow-200 to-amber-500 text-xs font-extrabold text-[#5c2a00]">
                    {i + 1}
                  </span>
                  <span className="font-medium text-white/90">{name}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      <section className="flex flex-col items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-b from-[#0a1450] via-[#2b3a6e] to-[#c9a54e] px-2 pb-6 pt-2 shadow-xl">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full max-w-[560px] select-none"
          role="img"
          aria-label="抽獎輪盤"
        >
          <defs>
            {PALETTE.map((c) => (
              <radialGradient
                key={c.id}
                id={`lw-seg-${c.id}`}
                gradientUnits="userSpaceOnUse"
                cx={CX}
                cy={CY}
                r={RADIUS}
              >
                <stop offset="0%" stopColor={c.light} />
                <stop offset="45%" stopColor={c.base} />
                <stop offset="88%" stopColor={c.base} />
                <stop offset="100%" stopColor={c.dark} />
              </radialGradient>
            ))}
            <radialGradient id="lw-gloss" gradientUnits="userSpaceOnUse" cx={CX} cy={CY} r={RADIUS}>
              <stop offset="0%" stopColor="#000" stopOpacity="0.25" />
              <stop offset="30%" stopColor="#000" stopOpacity="0" />
              <stop offset="85%" stopColor="#fff" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.35" />
            </radialGradient>
            <linearGradient id="lw-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fff6c2" />
              <stop offset="25%" stopColor="#e2b23c" />
              <stop offset="50%" stopColor="#8a5d0b" />
              <stop offset="75%" stopColor="#f2cf5b" />
              <stop offset="100%" stopColor="#9a6a10" />
            </linearGradient>
            <radialGradient id="lw-hub" cx="0.4" cy="0.35" r="0.75">
              <stop offset="0%" stopColor="#ffe08a" />
              <stop offset="45%" stopColor="#f59f00" />
              <stop offset="100%" stopColor="#b35c00" />
            </radialGradient>
            <radialGradient id="lw-bulb" cx="0.4" cy="0.4" r="0.6">
              <stop offset="0%" stopColor="#fffbe6" />
              <stop offset="45%" stopColor="#ffc078" />
              <stop offset="100%" stopColor="#e8590c" />
            </radialGradient>
            <radialGradient id="lw-coin" cx="0.35" cy="0.3" r="0.8">
              <stop offset="0%" stopColor="#fff6c2" />
              <stop offset="40%" stopColor="#f5c518" />
              <stop offset="100%" stopColor="#a86f00" />
            </radialGradient>
            <filter id="lw-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ff922b" floodOpacity="0.9" />
            </filter>
            <filter id="lw-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.45" />
            </filter>
            <path
              id="lw-title-arc"
              d={`M ${CX - 250} ${CY - 120} A 280 280 0 0 1 ${CX + 250} ${CY - 120}`}
            />
            <linearGradient id="lw-title" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff3a3" />
              <stop offset="50%" stopColor="#ffb703" />
              <stop offset="100%" stopColor="#e85d04" />
            </linearGradient>
          </defs>

          {/* 弧形標題，中間留空給愛心指針 */}
          <text
            fontSize="50"
            fontWeight="900"
            fill="url(#lw-title)"
            stroke="#7a2e00"
            strokeWidth="5"
            paintOrder="stroke"
            letterSpacing="8"
            fontFamily="'Microsoft JhengHei', 'PingFang TC', 'Noto Sans TC', sans-serif"
            filter="url(#lw-shadow)"
          >
            <textPath href="#lw-title-arc" startOffset="44%" textAnchor="end">
              幸運
            </textPath>
          </text>
          <text
            fontSize="50"
            fontWeight="900"
            fill="url(#lw-title)"
            stroke="#7a2e00"
            strokeWidth="5"
            paintOrder="stroke"
            letterSpacing="8"
            fontFamily="'Microsoft JhengHei', 'PingFang TC', 'Noto Sans TC', sans-serif"
            filter="url(#lw-shadow)"
          >
            <textPath href="#lw-title-arc" startOffset="56%" textAnchor="start">
              大輪盤
            </textPath>
          </text>

          {/* 最外圈橘色光環 */}
          <circle
            cx={CX}
            cy={CY}
            r={OUTER_RING_RADIUS}
            fill="none"
            stroke="#ff7a1a"
            strokeWidth="5"
            filter="url(#lw-glow)"
          />

          {/* 會旋轉的轉盤本體 */}
          <g
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: `${CX}px ${CY}px`,
              transformBox: "view-box",
              transition: spinning
                ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.15, 0.85, 0.25, 1)`
                : "none",
            }}
          >
            {names.length === 0 && <circle cx={CX} cy={CY} r={RADIUS} fill="#4b5563" />}
            {names.length === 1 && (
              <circle cx={CX} cy={CY} r={RADIUS} fill={`url(#lw-seg-${PALETTE[0].id})`} />
            )}
            {names.length > 1 &&
              names.map((name, i) => (
                <path
                  key={`${name}-${i}`}
                  d={sectorPath(i * segmentAngle, (i + 1) * segmentAngle)}
                  fill={`url(#lw-seg-${PALETTE[colorIndexFor(i, names.length)].id})`}
                  stroke="#f5d77a"
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                />
              ))}
            <circle cx={CX} cy={CY} r={RADIUS} fill="url(#lw-gloss)" pointerEvents="none" />
            {names.map((name, i) => {
              const mid = i * segmentAngle + segmentAngle / 2;
              return (
                <text
                  key={`label-${name}-${i}`}
                  x={CX + RADIUS - 24}
                  y={CY}
                  transform={`rotate(${mid - 90} ${CX} ${CY})`}
                  textAnchor="end"
                  dominantBaseline="central"
                  fontSize={fontSize}
                  fontWeight={800}
                  fill="#fff"
                  stroke="rgba(0,0,0,0.45)"
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  {truncate(name, maxChars)}
                </text>
              );
            })}
          </g>

          {/* 金屬金框與燈泡（固定不轉） */}
          <circle
            cx={CX}
            cy={CY}
            r={RIM_RADIUS}
            fill="none"
            stroke="url(#lw-gold)"
            strokeWidth={RIM_WIDTH}
            filter="url(#lw-shadow)"
          />
          <circle cx={CX} cy={CY} r={RIM_RADIUS - RIM_WIDTH / 2} fill="none" stroke="#6b4300" strokeWidth="2" />
          <circle cx={CX} cy={CY} r={RIM_RADIUS + RIM_WIDTH / 2} fill="none" stroke="#fff1b8" strokeWidth="1.5" />
          {Array.from({ length: BULB_COUNT }, (_, i) => {
            const p = pointOnCircle((360 / BULB_COUNT) * i + 15, RIM_RADIUS);
            return (
              <circle
                key={`bulb-${i}`}
                cx={p.x}
                cy={p.y}
                r={7}
                fill="url(#lw-bulb)"
                filter="url(#lw-glow)"
                className={spinning ? (i % 2 === 0 ? "animate-pulse" : "animate-pulse [animation-delay:500ms]") : ""}
              />
            );
          })}

          {/* 愛心指針 */}
          <g filter="url(#lw-shadow)">
            <path
              d={`M ${CX} ${CY - RADIUS + 34}
                  C ${CX - 6} ${CY - RADIUS + 22}, ${CX - 26} ${CY - RADIUS + 6}, ${CX - 26} ${CY - RADIUS - 12}
                  C ${CX - 26} ${CY - RADIUS - 30}, ${CX - 6} ${CY - RADIUS - 34}, ${CX} ${CY - RADIUS - 20}
                  C ${CX + 6} ${CY - RADIUS - 34}, ${CX + 26} ${CY - RADIUS - 30}, ${CX + 26} ${CY - RADIUS - 12}
                  C ${CX + 26} ${CY - RADIUS + 6}, ${CX + 6} ${CY - RADIUS + 22}, ${CX} ${CY - RADIUS + 34} Z`}
              fill="#c92a2a"
              stroke="url(#lw-gold)"
              strokeWidth="5"
              strokeLinejoin="round"
            />
          </g>

          {/* 中央 SPIN 按鈕 */}
          <g
            role="button"
            tabIndex={canSpin ? 0 : -1}
            aria-label="開始抽獎"
            aria-disabled={!canSpin}
            onClick={spin}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                spin();
              }
            }}
            className={`outline-none transition-opacity ${canSpin ? "cursor-pointer hover:opacity-90" : "cursor-not-allowed"}`}
            filter="url(#lw-shadow)"
          >
            <circle cx={CX} cy={CY} r={HUB_RADIUS} fill="url(#lw-gold)" />
            <circle
              cx={CX}
              cy={CY}
              r={HUB_RADIUS - 10}
              fill="url(#lw-hub)"
              stroke="#7a3d00"
              strokeWidth="1.5"
              opacity={canSpin || spinning ? 1 : 0.6}
            />
            <text
              x={CX}
              y={CY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="24"
              fontWeight="900"
              fill="#5c2a00"
              stroke="#ffe8a3"
              strokeWidth="1"
              fontFamily="'Arial Black', 'Segoe UI', sans-serif"
            >
              SPIN
            </text>
          </g>

          {/* 裝飾金幣與閃光 */}
          {COINS.map((c, i) => (
            <g key={`coin-${i}`} filter="url(#lw-shadow)" pointerEvents="none">
              <circle cx={c.x} cy={c.y} r={c.r} fill="url(#lw-coin)" stroke="#a86f00" strokeWidth="1.5" />
              <circle cx={c.x} cy={c.y} r={c.r * 0.74} fill="none" stroke="#c48a00" strokeWidth="2" />
              <polygon points={starPoints(c.x, c.y, c.r * 0.45, c.r * 0.2)} fill="#fff3bf" stroke="#c48a00" strokeWidth="1" />
            </g>
          ))}
          {SPARKLES.map((s, i) => (
            <path
              key={`sparkle-${i}`}
              d={`M ${s.x} ${s.y - s.s} Q ${s.x} ${s.y} ${s.x + s.s} ${s.y} Q ${s.x} ${s.y} ${s.x} ${s.y + s.s} Q ${s.x} ${s.y} ${s.x - s.s} ${s.y} Q ${s.x} ${s.y} ${s.x} ${s.y - s.s} Z`}
              fill="#fffbe6"
              opacity="0.9"
              pointerEvents="none"
            />
          ))}
        </svg>

        {names.length < 2 && !spinning ? (
          <p className="text-sm font-medium text-amber-200">名單至少需要 2 個名字才能抽獎</p>
        ) : (
          <p className="text-sm text-white/80">{spinning ? "抽獎中…" : "點擊轉盤中央的 SPIN 開始抽獎"}</p>
        )}

        <p className="min-h-8 text-center text-xl text-white" aria-live="polite">
          {winner && (
            <>
              本次中獎：<span className="font-extrabold text-yellow-300">{winner}</span>
            </>
          )}
        </p>
      </section>

      {/* 中獎彈出卡片：放在畫面正中央，不必捲動就看得到 */}
      {winner && showWinnerCard && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="winner-card-title"
          onClick={() => setShowWinnerCard(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowWinnerCard(false);
          }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div
            key={celebration}
            onClick={(e) => e.stopPropagation()}
            className="animate-winner-pop w-full max-w-sm rounded-3xl border-4 border-yellow-400 bg-gradient-to-b from-[#24358f] to-[#0a1450] p-8 text-center shadow-[0_0_60px_rgba(255,200,0,0.55)]"
          >
            <p id="winner-card-title" className="text-xl font-bold text-yellow-100">
              🎉 恭喜中獎 🎉
            </p>
            <p className="my-6 break-words text-6xl font-extrabold text-yellow-300 drop-shadow-[0_0_14px_rgba(255,200,0,0.8)]">
              {winner}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {removeWinner && (
                <button
                  type="button"
                  onClick={removeCurrentWinner}
                  className="rounded-full border border-white/40 px-5 py-2 text-sm text-white hover:bg-white/10"
                >
                  從名單移除
                </button>
              )}
              <button
                type="button"
                autoFocus
                onClick={() => setShowWinnerCard(false)}
                className="rounded-full bg-yellow-400 px-6 py-2 text-sm font-bold text-[#5c2a00] hover:bg-yellow-300"
              >
                確定
              </button>
            </div>
          </div>
        </div>
      )}

      <Fireworks trigger={celebration} />
    </div>
  );
}
