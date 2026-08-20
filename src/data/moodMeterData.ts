export interface MoodMeterWord {
  id: string;
  name: string;
  quadrant: "red" | "yellow" | "blue" | "green";
  energy: "high" | "low";
  pleasantness: "low" | "high";
  colorHex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export const MOOD_METER_QUADRANTS = {
  red: {
    id: "red",
    name: "紅色象限",
    title: "高活力 · 低愉悅",
    subtitle: "憤怒、焦慮、緊繃、恐慌",
    bgClass: "bg-rose-50",
    activeClass: "bg-rose-500 text-white shadow-rose-200",
    borderClass: "border-rose-300",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
    colorHex: "#f43f5e",
  },
  yellow: {
    id: "yellow",
    name: "黃色象限",
    title: "高活力 · 高愉悅",
    subtitle: "興奮、喜悅、樂觀、動力",
    bgClass: "bg-amber-50",
    activeClass: "bg-amber-500 text-white shadow-amber-200",
    borderClass: "border-amber-300",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-200",
    colorHex: "#f59e0b",
  },
  blue: {
    id: "blue",
    name: "藍色象限",
    title: "低活力 · 低愉悅",
    subtitle: "難過、失望、疲憊、抑鬱",
    bgClass: "bg-sky-50",
    activeClass: "bg-sky-500 text-white shadow-sky-200",
    borderClass: "border-sky-300",
    badgeClass: "bg-sky-100 text-sky-900 border-sky-200",
    colorHex: "#0284c7",
  },
  green: {
    id: "green",
    name: "綠色象限",
    title: "低活力 · 高愉悅",
    subtitle: "平靜、自在、放鬆、知足",
    bgClass: "bg-emerald-50",
    activeClass: "bg-emerald-600 text-white shadow-emerald-200",
    borderClass: "border-emerald-300",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-200",
    colorHex: "#059669",
  },
} as const;

// 完整提取圖片中 Marc Brackett 情緒量表 (Mood Meter) 的所有中文詞彙
export const MOOD_METER_WORDS: MoodMeterWord[] = [
  // ==========================
  // 紅色象限 (Red - 高活力, 低愉悅) 25 個
  // ==========================
  // Row 1 (最高活力)
  { id: "r1_1", name: "勃然大怒的", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },
  { id: "r1_2", name: "驚慌失措的", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },
  { id: "r1_3", name: "備感壓力的", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },
  { id: "r1_4", name: "緊張不安的", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },
  { id: "r1_5", name: "震驚的", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },

  // Row 2
  { id: "r2_1", name: "憤怒的", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },
  { id: "r2_2", name: "氣沖沖地", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },
  { id: "r2_3", name: "沮喪的", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },
  { id: "r2_4", name: "神經緊繃的", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },
  { id: "r2_5", name: "錯愕的", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },

  // Row 3
  { id: "r3_1", name: "火冒三丈的", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },
  { id: "r3_2", name: "受到驚嚇的", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },
  { id: "r3_3", name: "生氣的", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },
  { id: "r3_4", name: "緊張的", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },
  { id: "r3_5", name: "坐立難安的", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },

  // Row 4
  { id: "r4_1", name: "焦慮的", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },
  { id: "r4_2", name: "憂慮不安的", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },
  { id: "r4_3", name: "擔心的", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },
  { id: "r4_4", name: "被激怒的", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },
  { id: "r4_5", name: "被惹惱的", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },

  // Row 5
  { id: "r5_1", name: "反感的", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },
  { id: "r5_2", name: "困擾的", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },
  { id: "r5_3", name: "在意的", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },
  { id: "r5_4", name: "忐忑不安的", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },
  { id: "r5_5", name: "不太高興", quadrant: "red", energy: "high", pleasantness: "low", colorHex: "#e11d48", bgClass: "bg-rose-100", textClass: "text-rose-950", borderClass: "border-rose-300" },

  // ==========================
  // 黃色象限 (Yellow - 高活力, 高愉悅) 25 個
  // ==========================
  // Row 1 (最高活力)
  { id: "y1_1", name: "驚喜的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },
  { id: "y1_2", name: "振奮的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },
  { id: "y1_3", name: "歡慶的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },
  { id: "y1_4", name: "心花怒放的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },
  { id: "y1_5", name: "欣喜若狂的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },

  // Row 2
  { id: "y2_1", name: "亢奮的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },
  { id: "y2_2", name: "愉悅的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },
  { id: "y2_3", name: "有動力的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },
  { id: "y2_4", name: "受到啟發的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },
  { id: "y2_5", name: "興高采烈的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },

  // Row 3
  { id: "y3_1", name: "精力充沛的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },
  { id: "y3_2", name: "生氣勃勃的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },
  { id: "y3_3", name: "興奮的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },
  { id: "y3_4", name: "樂觀的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },
  { id: "y3_5", name: "熱情洋溢的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },

  // Row 4
  { id: "y4_1", name: "開心的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },
  { id: "y4_2", name: "集中的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },
  { id: "y4_3", name: "快樂的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },
  { id: "y4_4", name: "驕傲的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },
  { id: "y4_5", name: "興奮激動的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },

  // Row 5
  { id: "y5_1", name: "令人愉悅的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },
  { id: "y5_2", name: "欣喜的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },
  { id: "y5_3", name: "有希望的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },
  { id: "y5_4", name: "好玩的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },
  { id: "y5_5", name: "幸福的", quadrant: "yellow", energy: "high", pleasantness: "high", colorHex: "#d97706", bgClass: "bg-amber-100", textClass: "text-amber-950", borderClass: "border-amber-300" },

  // ==========================
  // 藍色象限 (Blue - 低活力, 低愉悅) 25 個
  // ==========================
  // Row 6
  { id: "b1_1", name: "厭惡的", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },
  { id: "b1_2", name: "死氣沉沉", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },
  { id: "b1_3", name: "失望的", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },
  { id: "b1_4", name: "低落的", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },
  { id: "b1_5", name: "提不起勁的", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },

  // Row 7
  { id: "b2_1", name: "悲觀的", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },
  { id: "b2_2", name: "鬱鬱寡歡", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },
  { id: "b2_3", name: "洩氣的", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },
  { id: "b2_4", name: "難過的", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },
  { id: "b2_5", name: "無聊的", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },

  // Row 8
  { id: "b3_1", name: "疏離的", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },
  { id: "b3_2", name: "悲慘的", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },
  { id: "b3_3", name: "孤單的", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },
  { id: "b3_4", name: "心灰意冷", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },
  { id: "b3_5", name: "疲累的", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },

  // Row 9
  { id: "b4_1", name: "消沉的", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },
  { id: "b4_2", name: "抑鬱的", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },
  { id: "b4_3", name: "悶悶不樂", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },
  { id: "b4_4", name: "精疲力竭", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },
  { id: "b4_5", name: "疲勞的", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },

  // Row 10 (最低活力)
  { id: "b5_1", name: "絕望的", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },
  { id: "b5_2", name: "無望的", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },
  { id: "b5_3", name: "孤寂的", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },
  { id: "b5_4", name: "疲憊不堪的", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },
  { id: "b5_5", name: "被搾乾的的", quadrant: "blue", energy: "low", pleasantness: "low", colorHex: "#0284c7", bgClass: "bg-sky-100", textClass: "text-sky-950", borderClass: "border-sky-300" },

  // ==========================
  // 綠色象限 (Green - 低活力, 高愉悅) 25 個
  // ==========================
  // Row 6
  { id: "g1_1", name: "自在的", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },
  { id: "g1_2", name: "隨和的", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },
  { id: "g1_3", name: "知足的", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },
  { id: "g1_4", name: "充滿愛的", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },
  { id: "g1_5", name: "心滿意足的", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },

  // Row 7
  { id: "g2_1", name: "平靜的", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },
  { id: "g2_2", name: "安全的", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },
  { id: "g2_3", name: "滿意的", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },
  { id: "g2_4", name: "滿懷感激的", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },
  { id: "g2_5", name: "感動的", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },

  // Row 8
  { id: "g3_1", name: "放鬆的", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },
  { id: "g3_2", name: "冷靜的", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },
  { id: "g3_3", name: "寧靜的", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },
  { id: "g3_4", name: "有福氣的", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },
  { id: "g3_5", name: "平衡的", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },

  // Row 9
  { id: "g4_1", name: "柔和的", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },
  { id: "g4_2", name: "沉思的", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },
  { id: "g4_3", name: "平和的", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },
  { id: "g4_4", name: "舒服的", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },
  { id: "g4_5", name: "無憂無慮", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },

  // Row 10 (最低活力)
  { id: "g5_1", name: "昏昏欲睡", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },
  { id: "g5_2", name: "安於現狀的", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },
  { id: "g5_3", name: "平靜的", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },
  { id: "g5_4", name: "舒適的", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },
  { id: "g5_5", name: "安詳的", quadrant: "green", energy: "low", pleasantness: "high", colorHex: "#059669", bgClass: "bg-emerald-100", textClass: "text-emerald-950", borderClass: "border-emerald-300" },
];

export function findMoodMeterWord(name: string): MoodMeterWord | undefined {
  return MOOD_METER_WORDS.find((w) => w.name === name);
}
