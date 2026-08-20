import React, { useState, useEffect, useRef } from "react";
import { EmotionState, EmotionHistoryEntry } from "../types";
import {
  getEmotionHSL,
  getEmotionStatusInfo,
  ColorTone,
} from "../utils/colors";
import { findMoodMeterWord, MOOD_METER_QUADRANTS } from "../data/moodMeterData";
import { CountdownHourglassTimer } from "./CountdownHourglassTimer";
import { EmotionHistoryTimelineModal } from "./EmotionHistoryTimelineModal";
import {
  Compass,
  Volume2,
  VolumeX,
  Edit3,
  Save,
  LineChart,
  History,
  MessageSquareQuote,
  Sparkles,
} from "lucide-react";

interface ListenerViewProps {
  state: EmotionState;
  colorTone: ColorTone;
  onUpdateCustomGuidance?: (guidance: string) => void;
  history: EmotionHistoryEntry[];
  onClearHistory?: () => void;
}

export const ListenerView: React.FC<ListenerViewProps> = ({
  state,
  colorTone,
  onUpdateCustomGuidance,
  history = [],
  onClearHistory,
}) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [isEditingGuidance, setIsEditingGuidance] = useState<boolean>(false);
  const [guidanceText, setGuidanceText] = useState<string>(state.customGuidance || "");
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setGuidanceText(state.customGuidance || "");
  }, [state.customGuidance]);

  const currentColor = getEmotionHSL(state.value, colorTone);
  const statusInfo = getEmotionStatusInfo(state.value);

  // Optional subtle bell chime when emotion drops drastically (< 20)
  useEffect(() => {
    if (soundEnabled && state.value <= 20) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(330, audioCtx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      } catch {
        // blocked or not supported
      }
    }
  }, [state.value, soundEnabled]);

  const handleSaveGuidance = () => {
    setIsEditingGuidance(false);
    if (onUpdateCustomGuidance) {
      onUpdateCustomGuidance(guidanceText);
    }
  };

  return (
    <div
      className="relative min-h-[calc(100vh-57px)] flex flex-col justify-between p-4 sm:p-8 lg:p-10 transition-all duration-700 overflow-x-hidden text-stone-900"
      style={{
        backgroundColor: currentColor,
      }}
    >
      {/* Ambient Breathing Overlay Layers */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay transition-opacity duration-1000"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.75) 0%, rgba(0,0,0,0.18) 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Floating Adjusting Alert */}
      {state.isAdjusting && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40">
          <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-amber-200 text-xs font-semibold text-amber-900 flex items-center gap-2 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>分享者正在滑動調整情緒狀態...</span>
          </div>
        </div>
      )}

      {/* Top Meta & Action Bar */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex items-center justify-between gap-2 flex-wrap">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white/60 shadow-xs text-xs font-semibold text-stone-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>陪伴者視角 · 畫面色彩即時反映對話者當下感受</span>
        </div>

        <div className="flex items-center gap-2">
          {/* History Chart Modal Trigger Button */}
          <button
            type="button"
            onClick={() => setIsHistoryModalOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-stone-800 border border-white/80 shadow-xs font-bold text-xs flex items-center gap-1.5 transition-all hover:scale-105"
            title="查看狀態紀錄曲線圖與時間標記歷程"
          >
            <LineChart className="w-4 h-4 text-sky-600" />
            <span>狀態紀錄曲線 ({history.length})</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-full backdrop-blur-md border transition-all text-xs flex items-center gap-1.5 ${
              soundEnabled
                ? "bg-white/90 border-white text-stone-800"
                : "bg-black/10 border-black/10 text-stone-700 hover:bg-white/50"
            }`}
            title={soundEnabled ? "已開啟低落提醒音效" : "音效已靜音（點擊開啟）"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? "音效開啟" : "靜音"}</span>
          </button>
        </div>
      </div>

      {/* Core Emotion Display Section */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center text-center my-6 space-y-6">
        {/* Main Glass Card */}
        <div className="w-full bg-white/85 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-xl border border-white/80 space-y-6 transition-all duration-500">
          {/* Big Number and Label */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
                {statusInfo.englishLabel}
              </span>
            </div>

            <div
              className="text-7xl sm:text-8xl lg:text-9xl font-black font-mono tracking-tighter transition-all duration-300 drop-shadow-xs"
              style={{ color: currentColor }}
            >
              {state.value}
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {statusInfo.label}
            </div>

            {/* Selected Mood Meter Words with respective Quadrant Colors */}
            {state.selectedEmotions && state.selectedEmotions.length > 0 ? (
              <div className="pt-3">
                <div className="text-xs font-bold text-stone-500 mb-2">
                  分享者標記的情緒詞彙：
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {state.selectedEmotions.map((name) => {
                    const wordObj = findMoodMeterWord(name);
                    const qKey = wordObj?.quadrant || "yellow";
                    const qInfo = MOOD_METER_QUADRANTS[qKey];

                    return (
                      <span
                        key={name}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-extrabold border shadow-2xs ${
                          qKey === "red"
                            ? "bg-rose-100 text-rose-950 border-rose-300"
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
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-xs text-stone-600 italic pt-2">
                分享者尚未選擇特定情緒詞彙
              </div>
            )}
          </div>

          {/* Speaker's Note if provided */}
          {state.note && (
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 text-left flex items-start gap-3 text-stone-800">
              <MessageSquareQuote className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <div className="text-xs font-semibold text-amber-800">分享者此刻留下的文字：</div>
                <div className="text-sm font-medium leading-relaxed">{state.note}</div>
              </div>
            </div>
          )}

          {/* Customizable Counseling Guidance & Notes */}
          <div className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-4 sm:p-5 text-left space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
                <Compass className="w-4 h-4 text-stone-500" />
                <span>陪伴指引與對話備忘（可自訂）</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isEditingGuidance) {
                    handleSaveGuidance();
                  } else {
                    setIsEditingGuidance(true);
                  }
                }}
                className="text-xs text-stone-600 hover:text-stone-900 font-semibold flex items-center gap-1 bg-white border border-stone-200/80 px-2.5 py-1 rounded-xl shadow-2xs transition-colors"
              >
                {isEditingGuidance ? (
                  <>
                    <Save className="w-3.5 h-3.5 text-emerald-600" />
                    <span>儲存備忘</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{state.customGuidance ? "編輯備忘" : "新增自訂指引"}</span>
                  </>
                )}
              </button>
            </div>

            {isEditingGuidance ? (
              <div className="space-y-2 pt-1">
                <textarea
                  value={guidanceText}
                  onChange={(e) => setGuidanceText(e.target.value)}
                  placeholder="在此輸入您專屬的諮商指引、陪伴提醒、對話節奏策略或觀察筆記..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-white border border-stone-300 text-xs text-stone-800 placeholder-stone-400 focus:outline-hidden focus:border-stone-500 leading-relaxed resize-none"
                />
              </div>
            ) : state.customGuidance ? (
              <div className="text-xs text-stone-700 leading-relaxed whitespace-pre-wrap pt-1 font-medium">
                {state.customGuidance}
              </div>
            ) : (
              <div className="text-xs text-stone-600 italic pt-1">
                目前尚無自訂指引。點擊右上角「新增自訂指引」可記錄此房間的對話要點或陪伴策略。
              </div>
            )}
          </div>
        </div>

        {/* Hourglass Countdown Interval Timer */}
        <div className="w-full">
          <CountdownHourglassTimer />
        </div>
      </div>

      {/* Emotion History Timeline Modal */}
      <EmotionHistoryTimelineModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
        onClearHistory={onClearHistory}
      />

      {/* Footer subtle tip */}
      <div className="relative z-10 w-full max-w-4xl mx-auto text-center text-xs text-stone-700/80 font-medium pb-2">
        <span>情緒滑桿即時連線中 · 不作任何永久身份綁定 · 尊重對談隱私與自由度</span>
      </div>
    </div>
  );
};
