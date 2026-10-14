// 工具清單：header、footer 與首頁共用，新增工具時只要改這裡
export type Tool = {
  href: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
};

export const TOOLS: Tool[] = [
  {
    href: "/lottery",
    name: "抽獎輪盤",
    tagline: "公平又刺激的幸運大輪盤",
    description: "貼上名單、按下 SPIN，看輪盤轉呀轉，最後停在得獎者身上，還會放煙火慶祝。",
    features: ["自訂抽獎名單", "中獎煙火特效", "可避免重複中獎"],
  },
  {
    href: "/pomodoro",
    name: "蕃茄鐘",
    tagline: "專注 25 分鐘，休息 5 分鐘",
    description: "用蕃茄工作法安排節奏：倒數計時、時間到提醒，分頁標題也看得到剩餘時間。",
    features: ["專注／短休息／長休息", "提示音與系統通知", "記錄今日完成數"],
  },
  {
    href: "/fortune",
    name: "好運抽籤",
    tagline: "搖一搖，看看今天的運勢",
    description: "從大吉到大凶隨機抽一支籤，附上工作、財運、愛情、健康運勢與今日宜忌。",
    features: ["七種籤等", "四大運勢評分", "幸運色與幸運數字"],
  },
];
