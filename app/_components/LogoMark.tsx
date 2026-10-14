// 工具箱造型的 logo：暖色漸層方塊 + 白色工具箱
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff9a5a" />
          <stop offset="55%" stopColor="#f0544f" />
          <stop offset="100%" stopColor="#a93fd6" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#logo-bg)" />
      <path d="M15 13.5v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" fill="none" stroke="white" strokeWidth="2.4" />
      <rect x="8.5" y="13.5" width="23" height="16" rx="3.5" fill="white" />
      <rect x="8.5" y="19.5" width="23" height="2.4" fill="#f0544f" opacity="0.85" />
      <rect x="17.5" y="18" width="5" height="5.5" rx="1.2" fill="#f0544f" />
    </svg>
  );
}
