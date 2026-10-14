import Link from "next/link";
import { TOOLS } from "../_lib/tools";
import { LogoMark } from "./LogoMark";

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-black/5 dark:border-white/10">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:grid-cols-[1.5fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <Link href="/" className="flex items-center gap-2.5 font-bold">
            <LogoMark className="size-7" />
            Alec 的小工具箱
          </Link>
          <p className="max-w-xs text-sm leading-relaxed opacity-60">
            收集日常用得到的小幫手。打開瀏覽器就能用，設定與紀錄只存在你自己的瀏覽器裡。
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold">工具</h2>
          <ul className="space-y-2 text-sm">
            {TOOLS.map((tool) => (
              <li key={tool.href}>
                <Link href={tool.href} className="opacity-60 transition-opacity hover:opacity-100">
                  {tool.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold">關於</h2>
          <ul className="space-y-2 text-sm opacity-60">
            <li>以 Next.js 與 Tailwind CSS 打造</li>
            <li>免安裝、免註冊、完全免費</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-black/5 dark:border-white/10">
        <p className="mx-auto w-full max-w-6xl px-4 py-5 text-xs opacity-50">© 2026 Alec 的小工具箱</p>
      </div>
    </footer>
  );
}
