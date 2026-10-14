import type { Metadata } from "next";
import LotteryWheel from "./LotteryWheel";

export const metadata: Metadata = {
  title: "抽獎輪盤",
  description: "輸入名單，轉動轉盤抽出得獎者",
};

export default function LotteryPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">抽獎輪盤</h1>
      <p className="mb-8 text-sm opacity-70">
        在左側輸入名單（一行一個名字），點擊轉盤中央的「SPIN」開始抽獎。
      </p>
      <LotteryWheel />
    </main>
  );
}
