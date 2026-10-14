"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TOOLS } from "../_lib/tools";
import { LogoMark } from "./LogoMark";

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-background/80 backdrop-blur-md dark:border-white/10">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-wide">
          <LogoMark className="size-8" />
          <span className="text-lg">Alec 的小工具箱</span>
        </Link>

        <nav aria-label="工具" className="-mx-1 flex max-w-full gap-1 overflow-x-auto px-1">
          {TOOLS.map((tool) => {
            const active = pathname === tool.href;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-foreground text-background"
                    : "opacity-70 hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
                }`}
              >
                {tool.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
