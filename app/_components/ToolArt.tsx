// 首頁用的三個工具小插圖，風格對應各工具頁面本身的設計
// （只用固定座標與 transform，不做三角函數運算，避免 hydration mismatch）

const KAI_FONT = "'DFKai-SB', 'BiauKai', 'KaiTi', 'STKaiti', serif";

export function WheelArt({ className }: { className?: string }) {
  return (
    <div className={`relative aspect-square ${className ?? ""}`} aria-hidden="true">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#fff2b0] via-[#d9a428] to-[#8a5d0b] p-[7%] shadow-[0_0_24px_rgba(255,150,40,0.6)]">
        <div
          className="size-full rounded-full"
          style={{
            background:
              "conic-gradient(#e9c53b 0 60deg, #3b5bdb 60deg 120deg, #4c9a1f 120deg 180deg, #d63031 180deg 240deg, #d9935a 240deg 300deg, #8e44c9 300deg 360deg)",
          }}
        />
      </div>
      <div className="absolute left-1/2 top-1/2 flex size-[26%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-b from-[#ffe08a] to-[#e67700] text-[0.55em] font-black text-[#5c2a00] ring-4 ring-[#f2cf5b]">
        SPIN
      </div>
      <svg viewBox="0 0 20 20" className="absolute left-1/2 top-0 w-[14%] -translate-x-1/2 -translate-y-1/4">
        <path
          d="M10 18 C 9 16, 2 12, 2 7 C 2 3.5, 6 2, 10 5.5 C 14 2, 18 3.5, 18 7 C 18 12, 11 16, 10 18 Z"
          fill="#c92a2a"
          stroke="#f2cf5b"
          strokeWidth="1.6"
        />
      </svg>
    </div>
  );
}

export function TomatoArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <clipPath id="art-tomato">
          <circle cx="60" cy="64" r="46" />
        </clipPath>
      </defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke="#fbe1df" strokeWidth="4" />
      <path d="M 60 4 A 56 56 0 0 1 112 46" fill="none" stroke="#e86b6b" strokeWidth="4" strokeLinecap="round" />
      <g clipPath="url(#art-tomato)">
        <circle cx="60" cy="64" r="46" fill="#e07a5f" />
        <circle cx="66" cy="60" r="44" fill="#ee8d70" />
      </g>
      <path d="M 60 22 C 60 16, 58 12, 54 8" fill="none" stroke="#6db34d" strokeWidth="3.5" strokeLinecap="round" />
      {[-105, -55, 0, 55, 105].map((a) => (
        <ellipse key={a} cx="60" cy="29" rx="4.5" ry="8" fill="#8fd06c" transform={`rotate(${a} 60 22)`} />
      ))}
      <circle cx="60" cy="22.5" r="4" fill="#8fd06c" />
      <text x="60" y="68" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="20" fontWeight="600">
        25:00
      </text>
    </svg>
  );
}

export function FortuneArt({ className }: { className?: string }) {
  const sticks = [
    { a: -18, l: 70 },
    { a: 18, l: 70 },
    { a: -9, l: 76 },
    { a: 9, l: 76 },
    { a: 0, l: 80 },
  ];
  return (
    <svg viewBox="0 0 120 130" className={className} aria-hidden="true">
      <defs>
        <clipPath id="art-bucket">
          <path d="M 30 70 V 112 A 30 6 0 0 0 90 112 V 70 A 30 6 0 0 1 30 70 Z" />
        </clipPath>
        <filter id="art-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ffd27a" floodOpacity="0.8" />
        </filter>
      </defs>
      <ellipse cx="60" cy="70" rx="30" ry="6" fill="#e2b877" />
      <ellipse cx="60" cy="70.5" rx="25" ry="4" fill="#3a1a0c" />
      <g filter="url(#art-glow)">
        {sticks.map((s) => (
          <g key={s.a} transform={`translate(60 106) rotate(${s.a})`}>
            <path
              d={`M -10 0 V ${-(s.l - 12)} L 0 ${-s.l} L 10 ${-(s.l - 12)} V 0 Z`}
              fill="#f3d9a4"
              stroke="#b8864a"
              strokeWidth="0.8"
            />
            <path d={`M -6.5 ${-(s.l - 48)} V ${-(s.l - 14)} L 0 ${-(s.l - 6)} L 6.5 ${-(s.l - 14)} V ${-(s.l - 48)} Z`} fill="#ef6a2c" />
          </g>
        ))}
      </g>
      <g clipPath="url(#art-bucket)">
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={30 + i * 10} y="60" width="10" height="60" fill={i % 2 ? "#f47c3c" : "#ee6a2e"} stroke="#b9451c" strokeWidth="0.6" />
        ))}
      </g>
      <path d="M 30 69 A 30 6 0 0 0 90 69 V 75 A 30 6 0 0 1 30 75 Z" fill="#f3d9a4" stroke="#b8864a" strokeWidth="0.8" />
      <path d="M 30 106 A 30 6 0 0 0 90 106 V 112 A 30 6 0 0 1 30 112 Z" fill="#f3d9a4" stroke="#b8864a" strokeWidth="0.8" />
      <circle cx="60" cy="92" r="10" fill="#ef6a2c" stroke="#fff4dc" strokeWidth="1.6" />
      <text
        x="60"
        y="92.5"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff4dc"
        fontSize="11"
        fontWeight="700"
        style={{ fontFamily: KAI_FONT }}
      >
        籤
      </text>
    </svg>
  );
}
