import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SiteFooter from "./_components/SiteFooter";
import SiteHeader from "./_components/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // 各分頁只要設定自己的名稱，例如「蕃茄鐘」，就會變成「蕃茄鐘 | Alec 的小工具箱」
  title: {
    default: "Alec 的小工具箱",
    template: "%s | Alec 的小工具箱",
  },
  description: "抽獎輪盤、蕃茄鐘、好運抽籤，日常用得到的小工具都在這裡。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* 瀏覽器擴充功能常在 <body> 注入屬性，略過這一層的 hydration 屬性比對 */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
