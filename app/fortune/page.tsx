import type { Metadata } from "next";
import FortuneDraw from "./FortuneDraw";

export const metadata: Metadata = {
  title: "好運抽籤",
  description: "搖一搖籤筒，隨機抽出今天的運勢籤",
};

export default function FortunePage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">好運抽籤</h1>
      <p className="mb-8 text-sm opacity-70">
        從大吉到大凶，隨機抽一支籤看看今天的運勢。結果僅供娛樂，好運還是要靠自己創造！
      </p>
      <FortuneDraw />
    </main>
  );
}
