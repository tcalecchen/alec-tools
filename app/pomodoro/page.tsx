import type { Metadata } from "next";
import PomodoroTimer from "./PomodoroTimer";

export const metadata: Metadata = {
  title: "蕃茄鐘",
  description: "專注工作 25 分鐘、休息 5 分鐘的蕃茄工作法計時器",
};

export default function PomodoroPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">蕃茄鐘</h1>
      <p className="mb-8 text-sm opacity-70">
        專注一段時間、短暫休息，每完成 4 個蕃茄就來一次長休息。按空白鍵可以開始或暫停。
      </p>
      <PomodoroTimer />
    </main>
  );
}
