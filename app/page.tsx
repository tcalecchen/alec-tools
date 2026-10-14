import Link from "next/link";
import type { ComponentType } from "react";
import { FortuneArt, TomatoArt, WheelArt } from "./_components/ToolArt";
import { TOOLS } from "./_lib/tools";

// 每個工具卡片的插圖與配色，沿用各工具頁面本身的視覺風格
const TOOL_STYLE: Record<string, { Art: ComponentType<{ className?: string }>; stage: string; accent: string }> = {
  "/lottery": {
    Art: WheelArt,
    stage: "bg-gradient-to-b from-[#0a1450] via-[#2b3a6e] to-[#c9a54e]",
    accent: "#3b5bdb",
  },
  "/pomodoro": {
    Art: TomatoArt,
    stage: "bg-[#fdf0ef]",
    accent: "#e86b6b",
  },
  "/fortune": {
    Art: FortuneArt,
    stage: "bg-[radial-gradient(circle_at_50%_45%,#6b3d26_0%,#2a1810_60%,#160c07_100%)]",
    accent: "#ef6a2c",
  },
};

const HIGHLIGHTS = [
  { icon: "⚡", title: "打開就能用", text: "不用安裝、不用註冊，點進去馬上開始。" },
  { icon: "🔒", title: "資料留在你身邊", text: "名單、設定與紀錄只存在你自己的瀏覽器裡。" },
  { icon: "🎨", title: "用起來有趣", text: "煙火、搖籤、會跑的蕃茄，小工具也要有好心情。" },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 size-96 rounded-full bg-[#ff9a5a]/30 blur-3xl" />
          <div className="absolute -right-16 top-10 size-[28rem] rounded-full bg-[#a93fd6]/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 size-80 rounded-full bg-[#f0544f]/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1px)] bg-[size:22px_22px] opacity-[0.06]" />
        </div>

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-20 pt-16 md:grid-cols-[1.1fr_1fr] md:pt-24">
          <div className="flex flex-col items-start gap-6">
            <span className="rounded-full border border-current/15 bg-background/60 px-3 py-1 text-xs font-medium tracking-wide opacity-80 backdrop-blur">
              {TOOLS.length} 個小工具・免安裝・免註冊
            </span>
            <h1 className="text-5xl font-black leading-[1.1] tracking-tight sm:text-6xl md:text-7xl">
              Alec 的
              <br />
              <span className="bg-gradient-to-r from-[#ff8a3d] via-[#f0544f] to-[#a93fd6] bg-clip-text text-transparent">
                小工具箱
              </span>
            </h1>
            <p className="max-w-md text-lg leading-relaxed opacity-70">
              抽獎、專注、看運勢——把日常需要的小幫手，收進同一個盒子裡。挑一個開始玩吧！
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#tools"
                className="rounded-full bg-foreground px-6 py-3 font-semibold text-background shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                看看有哪些工具
              </a>
              <Link
                href="/fortune"
                className="rounded-full border border-current/20 px-6 py-3 font-semibold transition hover:-translate-y-0.5 hover:bg-black/5 dark:hover:bg-white/10"
              >
                先抽支籤試手氣 🎋
              </Link>
            </div>
          </div>

          {/* 三個工具插圖的拼貼 */}
          <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-md">
            <div className="animate-float absolute left-[6%] top-[4%] w-[52%] -rotate-6 rounded-[2rem] bg-gradient-to-b from-[#0a1450] via-[#2b3a6e] to-[#c9a54e] p-[7%] shadow-2xl">
              <WheelArt className="w-full text-[clamp(10px,2.4vw,18px)]" />
            </div>
            <div className="animate-float absolute right-[2%] top-[22%] w-[44%] rotate-6 rounded-[2rem] bg-[#fdf0ef] p-[5%] shadow-2xl [animation-delay:-2s]">
              <TomatoArt className="w-full" />
            </div>
            <div className="animate-float absolute bottom-[0%] left-[24%] w-[44%] -rotate-3 rounded-[2rem] bg-[radial-gradient(circle_at_50%_45%,#6b3d26_0%,#2a1810_60%,#160c07_100%)] p-[4%] shadow-2xl [animation-delay:-4s]">
              <FortuneArt className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* 工具一覽 */}
      <section id="tools" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-12">
        <div className="mb-10 flex flex-col gap-2">
          <p className="text-sm font-semibold tracking-widest text-[#f0544f]">TOOLS</p>
          <h2 className="text-3xl font-bold sm:text-4xl">工具一覽</h2>
          <p className="opacity-60">每個工具都有自己的小個性，點卡片就能直接開始使用。</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TOOLS.map((tool, i) => {
            const { Art, stage, accent } = TOOL_STYLE[tool.href];
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className={`relative flex h-56 items-center justify-center overflow-hidden ${stage}`}>
                  <span className="absolute left-4 top-4 rounded-full bg-black/25 px-2.5 py-0.5 font-mono text-xs text-white backdrop-blur">
                    0{i + 1}
                  </span>
                  <Art className="w-40 text-sm transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div>
                    <h3 className="text-2xl font-bold">{tool.name}</h3>
                    <p className="text-sm font-medium" style={{ color: accent }}>
                      {tool.tagline}
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed opacity-70">{tool.description}</p>
                  <ul className="flex flex-wrap gap-2">
                    {tool.features.map((f) => (
                      <li key={f} className="rounded-full bg-black/5 px-2.5 py-1 text-xs dark:bg-white/10">
                        {f}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-auto pt-2 font-semibold" style={{ color: accent }}>
                    開始使用
                    <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 特色 */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="grid gap-6 rounded-3xl bg-gradient-to-br from-[#ff9a5a]/10 via-[#f0544f]/10 to-[#a93fd6]/10 p-8 sm:grid-cols-3 sm:p-10">
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="flex flex-col gap-2">
              <span className="text-3xl">{h.icon}</span>
              <h3 className="text-lg font-bold">{h.title}</h3>
              <p className="text-sm leading-relaxed opacity-70">{h.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
