export type LevelName = "大吉" | "中吉" | "小吉" | "吉" | "末吉" | "凶" | "大凶";

type Level = {
  name: LevelName;
  weight: number; // 抽中的相對機率
  stars: [number, number]; // 各項運勢星等的範圍
  color: string;
  bad: boolean;
  messages: string[];
};

export const LEVELS: Level[] = [
  {
    name: "大吉",
    weight: 10,
    stars: [4, 5],
    color: "#c0262d",
    bad: false,
    messages: [
      "諸事順遂，心想事成。今天是把握機會的好日子！",
      "好運當頭，貴人相助，想做的事就放手去做吧。",
      "如日中天，所求皆得，記得把好運分享給身邊的人。",
    ],
  },
  {
    name: "中吉",
    weight: 15,
    stars: [3, 5],
    color: "#c0262d",
    bad: false,
    messages: ["運勢穩定向上，付出的努力會得到不錯的回報。", "順風順水，保持自己的步調就能有好結果。"],
  },
  {
    name: "小吉",
    weight: 20,
    stars: [3, 4],
    color: "#d9480f",
    bad: false,
    messages: ["小確幸會悄悄出現，多留意身邊的美好。", "平穩中帶點好運，適合踏實地把事情做好。"],
  },
  {
    name: "吉",
    weight: 20,
    stars: [2, 4],
    color: "#d9480f",
    bad: false,
    messages: ["平安順利，按部就班就是最好的安排。", "沒有大起大落，平凡也是一種福氣。"],
  },
  {
    name: "末吉",
    weight: 15,
    stars: [2, 4],
    color: "#b7791f",
    bad: false,
    messages: ["先苦後甘，耐心等待，好運在後頭。", "起步稍慢，但堅持下去會漸入佳境。"],
  },
  {
    name: "凶",
    weight: 12,
    stars: [1, 3],
    color: "#4b5563",
    bad: true,
    messages: ["今天宜低調行事，凡事多想一步。", "小心謹慎就能避開麻煩，別急著做決定。"],
  },
  {
    name: "大凶",
    weight: 8,
    stars: [1, 2],
    color: "#1f2937",
    bad: true,
    messages: ["物極必反，今天就是谷底，接下來只會越來越好！", "諸事不宜躁進，好好休息、養精蓄銳。"],
  },
];

export const CATEGORIES = [
  {
    key: "work",
    label: "工作運",
    comments: [
      "溝通容易生誤會，重要決定先緩一緩",
      "容易分心，重要事項多檢查一次",
      "按部就班，穩定完成手邊的工作",
      "效率不錯，適合推進重要任務",
      "表現亮眼，提案容易被採納",
    ],
  },
  {
    key: "money",
    label: "財運",
    comments: [
      "不宜投資或借貸，保守為上",
      "小心衝動購物，荷包要守緊",
      "財運平穩，量入為出就好",
      "收支順利，小投資有機會獲利",
      "偏財運旺，可能有意外之財",
    ],
  },
  {
    key: "love",
    label: "愛情運",
    comments: [
      "情緒起伏大，先冷靜再溝通",
      "容易因小事鬧彆扭，多一點耐心",
      "平淡中見真情，多些體貼",
      "互動融洽，適合表達心意",
      "桃花朵朵開，感情甜蜜升溫",
    ],
  },
  {
    key: "health",
    label: "健康運",
    comments: [
      "身體在發出警訊，今天早點休息",
      "容易疲倦，記得多喝水、多休息",
      "注意作息，別再熬夜了",
      "狀態良好，適合出門運動",
      "精神飽滿，活力十足",
    ],
  },
] as const;

export const LUCKY_COLORS = [
  { name: "紅色", hex: "#e03131" },
  { name: "金色", hex: "#f2b632" },
  { name: "白色", hex: "#ffffff" },
  { name: "綠色", hex: "#2f9e44" },
  { name: "藍色", hex: "#1c7ed6" },
  { name: "紫色", hex: "#7048e8" },
  { name: "粉紅色", hex: "#f783ac" },
  { name: "橘色", hex: "#f76707" },
  { name: "黃色", hex: "#fcc419" },
  { name: "黑色", hex: "#212529" },
];

const DIRECTIONS = ["東", "南", "西", "北", "東南", "東北", "西南", "西北"];

const GOOD_THINGS = [
  "整理桌面",
  "學習新事物",
  "運動流汗",
  "聯絡老朋友",
  "早睡早起",
  "嘗試新餐廳",
  "閱讀",
  "訂下計畫",
  "斷捨離",
  "喝杯好咖啡",
  "出門散步",
  "跟人說聲謝謝",
];

const BAD_THINGS = [
  "熬夜",
  "衝動購物",
  "拖延",
  "抱怨",
  "暴飲暴食",
  "與人爭執",
  "久坐不動",
  "滑手機太久",
  "借錢給別人",
  "臨時改計畫",
];

export type Fortune = {
  no: number; // 第幾籤
  level: LevelName;
  message: string;
  categories: { key: string; label: string; stars: number; comment: string }[];
  luckyColor: string;
  luckyNumber: number;
  luckyDirection: string;
  good: string[];
  bad: string[];
};

function randomInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function pickMany<T>(items: readonly T[], count: number): T[] {
  const pool = [...items];
  const result: T[] = [];
  while (result.length < count && pool.length > 0) {
    result.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return result;
}

function pickLevel(): Level {
  const total = LEVELS.reduce((sum, l) => sum + l.weight, 0);
  let roll = Math.random() * total;
  for (const level of LEVELS) {
    roll -= level.weight;
    if (roll < 0) return level;
  }
  return LEVELS[LEVELS.length - 1];
}

export function getLevel(name: LevelName): Level {
  return LEVELS.find((l) => l.name === name) ?? LEVELS[0];
}

/** 隨機抽一支籤。各項運勢的星等會落在該籤等的範圍內，整體口吻才會一致。 */
export function drawFortune(): Fortune {
  const level = pickLevel();
  return {
    no: randomInt(1, 100),
    level: level.name,
    message: pick(level.messages),
    categories: CATEGORIES.map((c) => {
      const stars = randomInt(level.stars[0], level.stars[1]);
      return { key: c.key, label: c.label, stars, comment: c.comments[stars - 1] };
    }),
    luckyColor: pick(LUCKY_COLORS).name,
    luckyNumber: randomInt(1, 99),
    luckyDirection: pick(DIRECTIONS),
    good: pickMany(GOOD_THINGS, 2),
    bad: pickMany(BAD_THINGS, 2),
  };
}

/** 驗證 localStorage 讀回來的資料；格式不對就當作沒抽過。 */
export function parseFortune(raw: unknown): Fortune | null {
  if (!raw || typeof raw !== "object") return null;
  const f = raw as Partial<Fortune>;
  if (!LEVELS.some((l) => l.name === f.level)) return null;
  if (typeof f.no !== "number" || typeof f.message !== "string") return null;
  if (!Array.isArray(f.categories) || !Array.isArray(f.good) || !Array.isArray(f.bad)) return null;
  if (typeof f.luckyColor !== "string" || typeof f.luckyNumber !== "number" || typeof f.luckyDirection !== "string") {
    return null;
  }
  return f as Fortune;
}
