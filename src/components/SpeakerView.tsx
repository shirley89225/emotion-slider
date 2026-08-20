import React, { useState, useEffect, useRef } from "react";
import { EmotionState, ReactionMessage } from "../types";
import {
  getEmotionHSL,
  getEmotionStatusInfo,
  ColorTone,
} from "../utils/colors";
import { MoodMeterPicker } from "./MoodMeterPicker";
import { findMoodMeterWord, MOOD_METER_QUADRANTS } from "../data/moodMeterData";
import {
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  MessageSquare,
  Heart,
  Shield,
  Tag,
} from "lucide-react";

interface SpeakerViewProps {
  state: EmotionState;
  colorTone: ColorTone;
  onUpdateEmotion: (partial: Partial<EmotionState>, immediate?: boolean) => void;
  incomingReaction: ReactionMessage | null;
  onClearReaction: () => void;
}

export const SpeakerView: React.FC<SpeakerViewProps> = ({
  state,
  colorTone,
  onUpdateEmotion,
  incomingReaction,
  onClearReaction,
}) => {
  const [localValue, setLocalValue] = useState<number>(state.value);
  const [noteText, setNoteText] = useState<string>(state.note || "");
  const [activeReactionToast, setActiveReactionToast] = useState<ReactionMessage | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Sync state.value into localValue when not actively dragging
  useEffect(() => {
    if (!isDraggingRef.current) {
      setLocalValue(state.value);
    }
  }, [state.value]);

  useEffect(() => {
    setNoteText(state.note || "");
  }, [state.note]);

  // Handle incoming reactions from listener (No confetti, peaceful warm notification)
  useEffect(() => {
    if (incomingReaction) {
      setActiveReactionToast(incomingReaction);

      const timer = setTimeout(() => {
        setActiveReactionToast(null);
        onClearReaction();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [incomingReaction, onClearReaction]);

  const currentColor = getEmotionHSL(localValue, colorTone);
  const statusInfo = getEmotionStatusInfo(localValue);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setLocalValue(val);
    isDraggingRef.current = true;
    onUpdateEmotion({ value: val, isAdjusting: true }, false);
  };

  const handleSliderEnd = () => {
    isDraggingRef.current = false;
    onUpdateEmotion({ value: localValue, isAdjusting: false }, true);
  };

  const handleQuickAdjust = (delta: number) => {
    const nextVal = Math.max(0, Math.min(100, localValue + delta));
    setLocalValue(nextVal);
    onUpdateEmotion({ value: nextVal, isAdjusting: false }, true);
  };

  const handleResetCenter = () => {
    setLocalValue(50);
    onUpdateEmotion({ value: 50, isAdjusting: false }, true);
  };

  // Separate emotion vocabulary updates - does NOT change the slider!
  const handleEmotionsChange = (newEmotions: string[]) => {
    onUpdateEmotion({ selectedEmotions: newEmotions }, true);
  };

  const handleNoteBlur = () => {
    if (noteText !== state.note) {
      onUpdateEmotion({ note: noteText }, true);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-57px)] flex flex-col justify-between p-4 sm:p-6 lg:p-8 transition-colors duration-500 overflow-x-hidden">
      {/* Background Soft Aura */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 transition-all duration-700 -z-10"
        style={{
          background: `radial-gradient(ellipse at 50% 25%, ${currentColor} 0%, transparent 70%)`,
        }}
      />

      {/* Peaceful Gentle Reaction Toast from Listener (No flashing/confetti) */}
      {activeReactionToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-40 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-md border border-stone-200 shadow-lg rounded-2xl p-4 flex items-center gap-3 max-w-sm">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <Heart className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-stone-500">
                來自 {activeReactionToast.sender} 的溫暖支持
              </div>
              <div className="text-xs sm:text-sm font-bold text-stone-800 mt-0.5">
                {activeReactionToast.text}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Container */}
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col space-y-6 sm:space-y-8 my-auto">
        {/* Status Header Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-stone-200 shadow-xs text-xs font-medium text-stone-600">
            <span
              className="w-2.5 h-2.5 rounded-full transition-colors duration-300"
              style={{ backgroundColor: currentColor }}
            />
            <span>分享者模式 · 滑桿狀態與情緒詞彙即時同步給陪伴者</span>
          </div>

          {/* Big Mood Value Display */}
          <div className="flex flex-col items-center justify-center pt-2">
            <div
              className="text-6xl sm:text-7xl lg:text-8xl font-black font-mono tracking-tight transition-all duration-300 select-none drop-shadow-xs"
              style={{ color: currentColor }}
            >
              {localValue}
            </div>

            <div className="mt-1 text-xl sm:text-2xl font-bold text-stone-800 tracking-tight">
              {statusInfo.label}
            </div>

            {/* Selected Mood Meter Badges Preview */}
            {(state.selectedEmotions && state.selectedEmotions.length > 0) && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5">
                {state.selectedEmotions.map((em) => {
                  const w = findMoodMeterWord(em);
                  const q = w?.quadrant || "yellow";
                  return (
                    <span
                      key={em}
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                        q === "red"
                          ? "bg-rose-100 text-rose-900 border-rose-200"
                          : q === "yellow"
                          ? "bg-amber-100 text-amber-950 border-amber-200"
                          : q === "blue"
                          ? "bg-sky-100 text-sky-950 border-sky-200"
                          : "bg-emerald-100 text-emerald-950 border-emerald-200"
                      }`}
                    >
                      {em}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* The Giant Slider Section (0 - 100) */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 px-1">
            <span className="flex items-center gap-1 text-rose-600">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              0 極度不好 (紅)
            </span>
            <span className="flex items-center gap-1 text-amber-600">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              50 平穩一般 (黃)
            </span>
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              100 很好 (綠)
            </span>
          </div>

          {/* Slider Element */}
          <div className="relative py-3">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={localValue}
              onChange={handleSliderChange}
              onMouseUp={handleSliderEnd}
              onTouchEnd={handleSliderEnd}
              onKeyUp={handleSliderEnd}
              className="w-full h-7 bg-stone-100 rounded-2xl appearance-none cursor-pointer accent-stone-900 focus:outline-hidden transition-all"
              style={{
                background: `linear-gradient(to right, #f43f5e 0%, #fbbf24 50%, #10b981 100%)`,
              }}
            />

            {/* Visual Pointer Indicator on Track */}
            <div
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75 flex flex-col items-center"
              style={{ left: `calc(${localValue}% + (${8 - localValue * 0.16}px))` }}
            >
              <div
                className="w-8 h-8 rounded-full border-4 border-white shadow-md transition-transform scale-110 flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: currentColor }}
              >
                {localValue}
              </div>
            </div>
          </div>

          {/* Fine Tuning Micro Adjustments */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap pt-1">
            <button
              onClick={() => handleQuickAdjust(-5)}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="減少 5"
            >
              <Minus className="w-3.5 h-3.5" /> 5
            </button>
            <button
              onClick={() => handleQuickAdjust(-1)}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="減少 1"
            >
              <Minus className="w-3.5 h-3.5" /> 1
            </button>

            <button
              onClick={handleResetCenter}
              className="px-4 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="置中為 50 平穩"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>置中 (50)</span>
            </button>

            <button
              onClick={() => handleQuickAdjust(1)}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="增加 1"
            >
              <Plus className="w-3.5 h-3.5" /> 1
            </button>
            <button
              onClick={() => handleQuickAdjust(5)}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="增加 5"
            >
              <Plus className="w-3.5 h-3.5" /> 5
            </button>
          </div>

          {/* Optional Note / Message for Listener */}
          <div className="pt-2 border-t border-stone-100">
            <label className="block text-xs font-medium text-stone-600 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
              <span>想留下一句話給陪伴者（選填，點擊空白處自動發送）：</span>
            </label>
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onBlur={handleNoteBlur}
              placeholder="例如：剛才談到的事情讓我有些心慌、現在感覺放鬆了..."
              maxLength={200}
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:bg-white focus:border-stone-400 focus:outline-hidden transition-all"
            />
          </div>
        </div>

        {/* Marc Brackett's Mood Meter Quadrant Vocabulary Picker */}
        <MoodMeterPicker
          selectedEmotions={state.selectedEmotions || []}
          onChange={handleEmotionsChange}
        />

        {/* Safety Boundary Note */}
        <div className="bg-stone-50/90 rounded-2xl p-4 border border-stone-200/80 flex items-start gap-3 text-xs text-stone-600">
          <Shield className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-stone-700">安心表達與邊界保護</p>
            <p className="leading-relaxed">
              滑桿數值與情緒詞彙各自獨立。您可以自由調整滑桿標示感受強度，並從四象限中選擇最切合的心情詞彙傳遞給陪伴者。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
