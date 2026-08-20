import React, { useState, useMemo } from "react";
import {
  MOOD_METER_WORDS,
  MOOD_METER_QUADRANTS,
  findMoodMeterWord,
} from "../data/moodMeterData";
import {
  Search,
  Check,
  X,
  Sparkles,
  Grid3X3,
  Layers,
} from "lucide-react";

interface MoodMeterPickerProps {
  selectedEmotions: string[];
  onChange: (emotions: string[]) => void;
  isReadOnly?: boolean;
}

export const MoodMeterPicker: React.FC<MoodMeterPickerProps> = ({
  selectedEmotions = [],
  onChange,
  isReadOnly = false,
}) => {
  const [activeTab, setActiveTab] = useState<"all" | "red" | "yellow" | "blue" | "green">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"matrix" | "quadrants">("matrix");

  const filteredWords = useMemo(() => {
    let list = MOOD_METER_WORDS;
    if (activeTab !== "all") {
      list = list.filter((w) => w.quadrant === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((w) => w.name.toLowerCase().includes(q));
    }
    return list;
  }, [activeTab, searchQuery]);

  const handleToggleWord = (wordName: string) => {
    if (isReadOnly) return;
    if (selectedEmotions.includes(wordName)) {
      onChange(selectedEmotions.filter((w) => w !== wordName));
    } else {
      // 詞彙標記數量無上限 (No limit on selected emotion tags)
      onChange([...selectedEmotions, wordName]);
    }
  };

  const handleClearAll = () => {
    if (isReadOnly) return;
    onChange([]);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-rose-500 via-amber-500 via-sky-500 to-emerald-500" />
            <h3 className="text-base font-extrabold text-stone-900 tracking-tight">
              現在的情緒
            </h3>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            點選符合當下心情的情緒詞彙（依 4 種顏色區分，可多選且不影響滑桿數值）：
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          <div className="bg-stone-100 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("matrix")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                viewMode === "matrix"
                  ? "bg-white text-stone-900 shadow-2xs font-bold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>四顏色矩陣</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("quadrants")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                viewMode === "quadrants"
                  ? "bg-white text-stone-900 shadow-2xs font-bold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>分類標籤列表</span>
            </button>
          </div>
        </div>
      </div>

      {/* Currently Selected Emotion Badges Bar */}
      <div className="bg-stone-50/80 rounded-2xl p-3.5 border border-stone-200/80 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>已選擇的情緒詞彙（共 {selectedEmotions.length} 個）：</span>
          </div>
          {selectedEmotions.length > 0 && !isReadOnly && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] text-stone-500 hover:text-rose-600 font-medium transition-colors"
            >
              全部清除
            </button>
          )}
        </div>

        {selectedEmotions.length === 0 ? (
          <div className="text-xs text-stone-500 italic py-1">
            尚未選擇情緒詞彙。您可由下方顏色區塊自由點選貼切的詞彙標記當下心境。
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {selectedEmotions.map((name) => {
              const wordObj = findMoodMeterWord(name);
              const qKey = wordObj?.quadrant || "yellow";
              const qInfo = MOOD_METER_QUADRANTS[qKey];

              return (
                <span
                  key={name}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border shadow-2xs transition-all ${
                    qKey === "red"
                      ? "bg-rose-100 text-rose-900 border-rose-300"
                      : qKey === "yellow"
                      ? "bg-amber-100 text-amber-950 border-amber-300"
                      : qKey === "blue"
                      ? "bg-sky-100 text-sky-950 border-sky-300"
                      : "bg-emerald-100 text-emerald-950 border-emerald-300"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: qInfo.colorHex }}
                  />
                  <span>{name}</span>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => handleToggleWord(name)}
                      className="ml-0.5 p-0.5 rounded-full hover:bg-black/10 transition-colors"
                      title="移除此標籤"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* 4 Color Matrix View (Cleaned: removed energy/pleasantness axis descriptions) */}
      {viewMode === "matrix" ? (
        <div className="space-y-3">
          {/* 4 Quadrants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* 1. Red Zone */}
            <div className="bg-rose-50/70 border-2 border-rose-200/90 rounded-2xl p-4 space-y-2.5 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
                  <span className="font-bold text-xs text-rose-900">紅色區</span>
                </div>
                <span className="text-[11px] font-medium text-rose-700">（共 25 個詞彙）</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                {MOOD_METER_WORDS.filter((w) => w.quadrant === "red").map((word) => {
                  const isSelected = selectedEmotions.includes(word.name);
                  return (
                    <button
                      key={word.id}
                      type="button"
                      onClick={() => handleToggleWord(word.name)}
                      disabled={isReadOnly}
                      className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-rose-600 text-white font-bold shadow-xs scale-105"
                          : "bg-white/90 hover:bg-rose-200 text-rose-950 border border-rose-200/80"
                      }`}
                    >
                      {word.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Yellow Zone */}
            <div className="bg-amber-50/70 border-2 border-amber-200/90 rounded-2xl p-4 space-y-2.5 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-bold text-xs text-amber-950">黃色區</span>
                </div>
                <span className="text-[11px] font-medium text-amber-800">（共 25 個詞彙）</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                {MOOD_METER_WORDS.filter((w) => w.quadrant === "yellow").map((word) => {
                  const isSelected = selectedEmotions.includes(word.name);
                  return (
                    <button
                      key={word.id}
                      type="button"
                      onClick={() => handleToggleWord(word.name)}
                      disabled={isReadOnly}
                      className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-amber-500 text-white font-bold shadow-xs scale-105"
                          : "bg-white/90 hover:bg-amber-200 text-amber-950 border border-amber-200/80"
                      }`}
                    >
                      {word.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Blue Zone */}
            <div className="bg-sky-50/70 border-2 border-sky-200/90 rounded-2xl p-4 space-y-2.5 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-sky-500 shrink-0" />
                  <span className="font-bold text-xs text-sky-950">藍色區</span>
                </div>
                <span className="text-[11px] font-medium text-sky-800">（共 25 個詞彙）</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                {MOOD_METER_WORDS.filter((w) => w.quadrant === "blue").map((word) => {
                  const isSelected = selectedEmotions.includes(word.name);
                  return (
                    <button
                      key={word.id}
                      type="button"
                      onClick={() => handleToggleWord(word.name)}
                      disabled={isReadOnly}
                      className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-sky-600 text-white font-bold shadow-xs scale-105"
                          : "bg-white/90 hover:bg-sky-200 text-sky-950 border border-sky-200/80"
                      }`}
                    >
                      {word.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Green Zone */}
            <div className="bg-emerald-50/70 border-2 border-emerald-200/90 rounded-2xl p-4 space-y-2.5 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
                  <span className="font-bold text-xs text-emerald-950">綠色區</span>
                </div>
                <span className="text-[11px] font-medium text-emerald-800">（共 25 個詞彙）</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                {MOOD_METER_WORDS.filter((w) => w.quadrant === "green").map((word) => {
                  const isSelected = selectedEmotions.includes(word.name);
                  return (
                    <button
                      key={word.id}
                      type="button"
                      onClick={() => handleToggleWord(word.name)}
                      disabled={isReadOnly}
                      className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-emerald-600 text-white font-bold shadow-xs scale-105"
                          : "bg-white/90 hover:bg-emerald-200 text-emerald-950 border border-emerald-200/80"
                      }`}
                    >
                      {word.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Categorized Tab and Search View */
        <div className="space-y-4">
          {/* Search and Tabs */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋情緒詞彙 (例如: 難過的、焦慮的、放鬆的...)"
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:bg-white focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1 bg-stone-100 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  activeTab === "all"
                    ? "bg-white text-stone-900 font-bold shadow-2xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                全部 (100)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("red")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                  activeTab === "red"
                    ? "bg-rose-500 text-white font-bold shadow-2xs"
                    : "text-rose-700 hover:bg-rose-50"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                紅色區
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("yellow")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                  activeTab === "yellow"
                    ? "bg-amber-500 text-white font-bold shadow-2xs"
                    : "text-amber-800 hover:bg-amber-50"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                黃色區
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("blue")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                  activeTab === "blue"
                    ? "bg-sky-500 text-white font-bold shadow-2xs"
                    : "text-sky-700 hover:bg-sky-50"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                藍色區
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("green")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                  activeTab === "green"
                    ? "bg-emerald-600 text-white font-bold shadow-2xs"
                    : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                綠色區
              </button>
            </div>
          </div>

          {/* Word Pills Grid */}
          <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-1">
            {filteredWords.map((word) => {
              const isSelected = selectedEmotions.includes(word.name);
              const qKey = word.quadrant;

              return (
                <button
                  key={word.id}
                  type="button"
                  onClick={() => handleToggleWord(word.name)}
                  disabled={isReadOnly}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? qKey === "red"
                        ? "bg-rose-600 text-white font-bold shadow-xs scale-105"
                        : qKey === "yellow"
                        ? "bg-amber-500 text-white font-bold shadow-xs scale-105"
                        : qKey === "blue"
                        ? "bg-sky-600 text-white font-bold shadow-xs scale-105"
                        : "bg-emerald-600 text-white font-bold shadow-xs scale-105"
                      : qKey === "red"
                      ? "bg-rose-50/90 text-rose-950 border border-rose-200 hover:bg-rose-100"
                      : qKey === "yellow"
                      ? "bg-amber-50/90 text-amber-950 border border-amber-200 hover:bg-amber-100"
                      : qKey === "blue"
                      ? "bg-sky-50/90 text-sky-950 border border-sky-200 hover:bg-sky-100"
                      : "bg-emerald-50/90 text-emerald-950 border border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: MOOD_METER_QUADRANTS[qKey].colorHex }}
                  />
                  <span>{word.name}</span>
                  {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
