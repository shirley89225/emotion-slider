import { EmotionStatusDefinition } from "../types";

/**
 * Linear interpolation helper
 */
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * Math.max(0, Math.min(1, t));
}

export type ColorTone = "gentle" | "vibrant" | "pastel";

/**
 * 將 0-100 的數值轉換為平滑過渡的 HSL 顏色字串
 * 0: 極度不好 (紅色 Red)
 * 50: 一般/平穩 (黃色/暖琥珀 Yellow/Amber)
 * 100: 很好 (綠色/翡翠綠 Green)
 */
export function getEmotionHSL(value: number, tone: ColorTone = "gentle"): string {
  const clamped = Math.max(0, Math.min(100, value));

  let hue: number;
  let sat: number;
  let light: number;

  if (clamped <= 50) {
    // 0 -> 50: 從紅色 (Hue 4) 過渡到黃色 (Hue 46)
    const t = clamped / 50;
    hue = lerp(4, 46, t);

    if (tone === "gentle") {
      sat = lerp(75, 80, t);
      light = lerp(56, 52, t);
    } else if (tone === "pastel") {
      sat = lerp(60, 68, t);
      light = lerp(68, 64, t);
    } else {
      // vibrant
      sat = lerp(86, 92, t);
      light = lerp(50, 48, t);
    }
  } else {
    // 50 -> 100: 從黃色 (Hue 46) 過渡到綠色 (Hue 145)
    const t = (clamped - 50) / 50;
    hue = lerp(46, 145, t);

    if (tone === "gentle") {
      sat = lerp(80, 66, t);
      light = lerp(52, 45, t);
    } else if (tone === "pastel") {
      sat = lerp(68, 55, t);
      light = lerp(64, 60, t);
    } else {
      // vibrant
      sat = lerp(92, 78, t);
      light = lerp(48, 40, t);
    }
  }

  return `hsl(${Math.round(hue)}, ${Math.round(sat)}%, ${Math.round(light)}%)`;
}

/**
 * 取得對應數值的柔和環境背景漸層樣式 (適用於全螢幕背景與氛圍營造)
 */
export function getEmotionBackgroundStyle(value: number, tone: ColorTone = "gentle") {
  const primaryHSL = getEmotionHSL(value, tone);
  
  // 計算一個稍微偏暖或偏柔的輔助色
  const clamped = Math.max(0, Math.min(100, value));
  let secondaryHue = clamped <= 50 ? lerp(345, 30, clamped / 50) : lerp(30, 165, (clamped - 50) / 50);
  
  const secondaryHSL = `hsl(${Math.round(secondaryHue)}, 60%, 75%)`;
  const subtleGlowHSL = `hsl(${Math.round(secondaryHue)}, 80%, 92%)`;

  return {
    backgroundColor: primaryHSL,
    backgroundImage: `radial-gradient(circle at 50% 25%, ${subtleGlowHSL} 0%, ${primaryHSL} 70%, hsl(${Math.round(secondaryHue)}, 65%, 28%) 120%)`,
  };
}

/**
 * 取得 0-100 對應的情緒狀態描述與諮商建議
 */
export function getEmotionStatusInfo(value: number): EmotionStatusDefinition {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  if (clamped <= 15) {
    return {
      range: [0, 15],
      label: "極度低落 · 需要暫停",
      englishLabel: "Critical Overload",
      description: "內心能量處於臨界點，可能感到巨大的痛苦、無助或強烈壓力。",
      counselingAdvice: "建議暫緩話題討論，給予安靜陪伴，確認身體感受，不急著尋找解決方案。",
      suggestedAction: "深呼吸 · 暫停對話 · 喝口水",
      suggestedTags: ["需要暫停", "難以言喻", "胸口發悶", "想靜一靜"],
      pulseSpeed: 1.5,
    };
  }

  if (clamped <= 35) {
    return {
      range: [16, 35],
      label: "焦慮沉重 · 感到緊繃",
      englishLabel: "Anxious & Heavy",
      description: "心緒明顯緊繃，伴隨擔憂、疲憊或防禦心理，需要更多安全感與理解。",
      counselingAdvice: "放慢講話節奏，用溫和的語調核對感受，避免過多質問或分析。",
      suggestedAction: "放慢節奏 · 專注呼吸 · 說出最困擾的一件事",
      suggestedTags: ["感到緊繃", "焦慮上升", "有些混亂", "需要同理"],
      pulseSpeed: 2.2,
    };
  }

  if (clamped <= 45) {
    return {
      range: [36, 45],
      label: "略感微悶 · 能量稍低",
      englishLabel: "Slightly Low",
      description: "處於略顯疲倦或有些猶豫的過渡狀態，思緒正在整理中。",
      counselingAdvice: "溫和引導，確認是否有想表達但尚未整理好的感受。",
      suggestedAction: "整理思緒 · 溫和傾訴",
      suggestedTags: ["有點累", "猶豫中", "慢慢說", "正在適應"],
      pulseSpeed: 3.0,
    };
  }

  if (clamped <= 55) {
    return {
      range: [46, 55],
      label: "平穩中性 · 自在平靜",
      englishLabel: "Balanced & Calm",
      description: "情緒維持在平和穩定的中心點，具備清晰的對話空間與接納度。",
      counselingAdvice: "良好的交流基底，可進行開放式探索或回顧近期生活變化。",
      suggestedAction: "開放分享 · 平穩交流",
      suggestedTags: ["平靜", "還可以", "放鬆", "準備好了"],
      pulseSpeed: 4.0,
    };
  }

  if (clamped <= 70) {
    return {
      range: [56, 70],
      label: "輕鬆舒展 · 感覺好轉",
      englishLabel: "Relieved & Open",
      description: "內心負擔開始減輕，感受到被接納與理解，思緒漸趨明朗。",
      counselingAdvice: "給予正面回應與同理，延續安全且溫暖的傾聽氛圍。",
      suggestedAction: "深入探索 · 感受舒緩",
      suggestedTags: ["感覺好多了", "放鬆許多", "被理解了", "思路清楚"],
      pulseSpeed: 3.5,
    };
  }

  if (clamped <= 85) {
    return {
      range: [71, 85],
      label: "充實穩定 · 樂觀明亮",
      englishLabel: "Grounded & Hopeful",
      description: "能量回升，感到充滿希望與內在力量，對當前處境有信心。",
      counselingAdvice: "肯定使用者的內在資源與自我覺察能力，鞏固正向體驗。",
      suggestedAction: "記錄正向感受 · 肯定自己",
      suggestedTags: ["充滿力量", "感到安心", "心情明朗", "很有收穫"],
      pulseSpeed: 3.0,
    };
  }

  return {
    range: [86, 100],
    label: "非常良好 · 自在喜悅",
    englishLabel: "Joyful & Centered",
    description: "身心非常和諧，感受到深刻的喜悅、踏實與全然的接納。",
    counselingAdvice: "享受與慶祝當下狀態，讓這份溫暖能量成為日後自我支持的定錨點。",
    suggestedAction: "感恩當下 · 慶祝這份平靜",
    suggestedTags: ["非常舒暢", "喜悅自在", "深深被支持", "充滿感謝"],
    pulseSpeed: 2.5,
  };
}

/**
 * 預設溫暖回應訊息清單 (Listener -> Speaker)
 */
export const WARM_REACTION_PRESETS = [
  { id: "here", text: "我在這裡傾聽 🤍", icon: "Heart" },
  { id: "breathe", text: "不急，深呼吸 🌿", icon: "Wind" },
  { id: "slow", text: "慢慢來，隨時可暫停 🕊️", icon: "Coffee" },
  { id: "hug", text: "給你一個溫暖的擁抱 🫂", icon: "Smile" },
  { id: "thank", text: "謝謝你願意分享 🌸", icon: "Sparkles" },
  { id: "safe", text: "這裡是安全的空間 🛡️", icon: "ShieldCheck" },
];
