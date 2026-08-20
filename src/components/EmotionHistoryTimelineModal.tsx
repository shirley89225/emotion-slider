import React, { useState, useMemo } from "react";
import { EmotionHistoryEntry } from "../types";
import { findMoodMeterWord, MOOD_METER_QUADRANTS } from "../data/moodMeterData";
import {
  LineChart,
  Clock,
  X,
  History,
  Download,
  Trash2,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowRight,
  MessageSquareQuote,
  Activity,
  Calendar,
} from "lucide-react";

interface EmotionHistoryTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: EmotionHistoryEntry[];
  onClearHistory?: () => void;
}

export const EmotionHistoryTimelineModal: React.FC<EmotionHistoryTimelineModalProps> = ({
  isOpen,
  onClose,
  history = [],
  onClearHistory,
}) => {
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [filterTag, setFilterTag] = useState<string>("all");

  // Compute session statistics (MUST be called before any conditional return)
  const stats = useMemo(() => {
    if (history.length === 0) {
      return { min: 50, max: 50, avg: 50, count: 0, durationMinutes: 0 };
    }
    const values = history.map((h) => h.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((acc, v) => acc + v, 0);
    const avg = Math.round(sum / values.length);
    const firstTime = history[0].timestamp;
    const lastTime = history[history.length - 1].timestamp;
    const durationMinutes = Math.max(1, Math.round((lastTime - firstTime) / 60000));

    return { min, max, avg, count: history.length, durationMinutes };
  }, [history]);

  // SVG Chart Dimensions
  const chartWidth = 700;
  const chartHeight = 240;
  const paddingX = 45;
  const paddingY = 30;
  const plotWidth = chartWidth - paddingX * 2;
  const plotHeight = chartHeight - paddingY * 2;

  // Generate SVG path coordinates
  const svgPoints = useMemo(() => {
    if (history.length === 0) return [];
    if (history.length === 1) {
      const y = chartHeight - paddingY - (history[0].value / 100) * plotHeight;
      return [{ x: chartWidth / 2, y, entry: history[0], index: 0 }];
    }

    return history.map((entry, index) => {
      const x = paddingX + (index / (history.length - 1)) * plotWidth;
      const y = chartHeight - paddingY - (entry.value / 100) * plotHeight;
      return { x, y, entry, index };
    });
  }, [history, plotHeight, plotWidth]);

  // Construct SVG smooth polyline/path
  const svgPathD = useMemo(() => {
    if (svgPoints.length === 0) return "";
    if (svgPoints.length === 1) {
      return `M ${svgPoints[0].x - 20} ${svgPoints[0].y} L ${svgPoints[0].x + 20} ${svgPoints[0].y}`;
    }
    return svgPoints.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`;
      return `${acc} L ${pt.x} ${pt.y}`;
    }, "");
  }, [svgPoints]);

  // Area under curve fill
  const svgAreaD = useMemo(() => {
    if (svgPoints.length < 2) return "";
    const first = svgPoints[0];
    const last = svgPoints[svgPoints.length - 1];
    const baseY = chartHeight - paddingY;
    return `${svgPathD} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;
  }, [svgPathD, svgPoints, chartHeight, paddingY]);

  if (!isOpen) return null;

  const formatClockTime = (timestamp: number) => {
    const d = new Date(timestamp);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  const formatElapsed = (timestamp: number) => {
    if (history.length === 0) return "0分";
    const start = history[0].timestamp;
    const diffSec = Math.max(0, Math.floor((timestamp - start) / 1000));
    const mins = Math.floor(diffSec / 60);
    const secs = diffSec % 60;
    return mins > 0 ? `+${mins}分${secs}秒` : `+${secs}秒`;
  };

  const handleExportText = () => {
    if (history.length === 0) return;
    let output = `=== 情緒滑桿 (Emotion Slider) 諮商與對話歷程紀錄 ===\n`;
    output += `對話開始時間: ${new Date(history[0].timestamp).toLocaleString()}\n`;
    output += `記錄點總數: ${history.length} 筆\n`;
    output += `情緒數值: 最高 ${stats.max} | 最低 ${stats.min} | 平均 ${stats.avg}\n\n`;
    output += `--- 時間標記明細 ---\n`;

    history.forEach((h, idx) => {
      output += `[${idx + 1}] 時間: ${formatClockTime(h.timestamp)} (${formatElapsed(h.timestamp)})\n`;
      output += `    數值: ${h.value} / 100\n`;
      if (h.selectedEmotions && h.selectedEmotions.length > 0) {
        output += `    標記詞彙: ${h.selectedEmotions.join(", ")}\n`;
      }
      if (h.note) {
        output += `    分享者筆記: 「${h.note}」\n`;
      }
      output += `\n`;
    });

    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `emotion-slider-session-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden text-stone-900 animate-scale-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/90 bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-700">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-stone-900 tracking-tight">
                狀態紀錄曲線圖與時間標記
              </h3>
              <p className="text-[11px] text-stone-500">
                回顧整個對話各環節的情緒波動、高低點與文字筆記
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleExportText}
                className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-100 flex items-center gap-1.5 shadow-2xs transition-colors"
                title="匯出純文字紀錄檔"
              >
                <Download className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">匯出紀錄</span>
              </button>
            )}

            {history.length > 0 && onClearHistory && (
              <button
                type="button"
                onClick={onClearHistory}
                className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="清除本次歷程"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80">
              <div className="text-[11px] font-medium text-stone-500">總記錄點數</div>
              <div className="text-xl font-bold text-stone-900 mt-0.5">{stats.count} 筆</div>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200/80">
              <div className="text-[11px] font-medium text-emerald-700">最高情緒值</div>
              <div className="text-xl font-bold text-emerald-900 mt-0.5">{stats.max}</div>
            </div>
            <div className="bg-rose-50 rounded-2xl p-3.5 border border-rose-200/80">
              <div className="text-[11px] font-medium text-rose-700">最低情緒值</div>
              <div className="text-xl font-bold text-rose-900 mt-0.5">{stats.min}</div>
            </div>
            <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200/80">
              <div className="text-[11px] font-medium text-amber-800">平均指數</div>
              <div className="text-xl font-bold text-amber-950 mt-0.5">{stats.avg}</div>
            </div>
          </div>

          {/* Section 1: SVG Emotion Trend Chart */}
          <div className="bg-stone-50/90 rounded-3xl p-4 sm:p-6 border border-stone-200/90 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 px-1">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>情緒變化趨勢曲線 (0 - 100)</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-semibold text-stone-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> 綠 (66-100)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> 黃 (36-65)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> 紅 (0-35)
                </span>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-xs text-stone-400 italic">
                尚無任何記錄。當分享者移動滑桿或標記情緒詞彙時，系統將自動在此繪製趨勢曲線。
              </div>
            ) : (
              <div className="relative w-full overflow-x-auto bg-white rounded-2xl border border-stone-200/90 p-2">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-auto min-w-[550px] overflow-visible"
                >
                  <defs>
                    <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.1" />
                    </linearGradient>
                    <linearGradient id="lineStrokeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" />
                      <stop offset="50%" stopColor="#d97706" />
                      <stop offset="100%" stopColor="#e11d48" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[100, 75, 50, 25, 0].map((val) => {
                    const y = chartHeight - paddingY - (val / 100) * plotHeight;
                    return (
                      <g key={val}>
                        <line
                          x1={paddingX}
                          y1={y}
                          x2={chartWidth - paddingX}
                          y2={y}
                          stroke="#e7e5e4"
                          strokeDasharray={val === 50 ? "4 4" : undefined}
                          strokeWidth="1"
                        />
                        <text
                          x={paddingX - 8}
                          y={y + 3.5}
                          textAnchor="end"
                          fontSize="9"
                          fill="#78716c"
                          fontWeight="600"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Area fill under line */}
                  {svgAreaD && <path d={svgAreaD} fill="url(#curveGradient)" />}

                  {/* The main curve line */}
                  <path
                    d={svgPathD}
                    fill="none"
                    stroke="url(#lineStrokeGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Plotted Points */}
                  {svgPoints.map((pt) => {
                    const val = pt.entry.value;
                    const color =
                      val >= 66 ? "#059669" : val >= 36 ? "#d97706" : "#e11d48";
                    const isHovered = hoveredPointIndex === pt.index;

                    return (
                      <g
                        key={pt.entry.id}
                        onMouseEnter={() => setHoveredPointIndex(pt.index)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 7 : 4.5}
                          fill="#ffffff"
                          stroke={color}
                          strokeWidth={isHovered ? 3.5 : 2.5}
                          className="transition-all duration-150"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Interactive Tooltip Card */}
                {hoveredPointIndex !== null && svgPoints[hoveredPointIndex] && (
                  <div
                    className="absolute bg-stone-900 text-white rounded-xl px-3 py-2 text-xs shadow-xl pointer-events-none z-30 space-y-1 transform -translate-x-1/2 -translate-y-full"
                    style={{
                      left: `${(svgPoints[hoveredPointIndex].x / chartWidth) * 100}%`,
                      top: `${(svgPoints[hoveredPointIndex].y / chartHeight) * 100 - 10}%`,
                    }}
                  >
                    <div className="flex items-center gap-2 font-mono text-[10px] text-stone-300">
                      <span>{formatClockTime(svgPoints[hoveredPointIndex].entry.timestamp)}</span>
                      <span>({formatElapsed(svgPoints[hoveredPointIndex].entry.timestamp)})</span>
                    </div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>數值: {svgPoints[hoveredPointIndex].entry.value}</span>
                    </div>
                    {svgPoints[hoveredPointIndex].entry.selectedEmotions &&
                      svgPoints[hoveredPointIndex].entry.selectedEmotions!.length > 0 && (
                        <div className="text-[11px] text-amber-300">
                          詞彙: {svgPoints[hoveredPointIndex].entry.selectedEmotions!.join(", ")}
                        </div>
                      )}
                    {svgPoints[hoveredPointIndex].entry.note && (
                      <div className="text-[11px] text-stone-200 italic">
                        「{svgPoints[hoveredPointIndex].entry.note}」
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Detailed Timestamp Timeline Events */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 px-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-stone-500" />
                <span>時間標記歷程 ({history.length} 個環節)</span>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-6 text-xs text-stone-400 italic">
                尚無事件標記。
              </div>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                {history.map((item, idx) => {
                  const val = item.value;
                  const colorClass =
                    val >= 66
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                      : val >= 36
                      ? "border-amber-300 bg-amber-50 text-amber-950"
                      : "border-rose-300 bg-rose-50 text-rose-900";

                  const dotColor =
                    val >= 66 ? "bg-emerald-500" : val >= 36 ? "bg-amber-500" : "bg-rose-500";

                  return (
                    <div key={item.id} className="relative group">
                      {/* Timeline Dot */}
                      <span
                        className={`absolute -left-[27px] top-3.5 w-3 h-3 rounded-full border-2 border-white shadow-2xs ${dotColor}`}
                      />

                      <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs hover:border-stone-400 transition-all space-y-2.5">
                        {/* Time & Value Banner */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-stone-800">
                              {formatClockTime(item.timestamp)}
                            </span>
                            <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                              {formatElapsed(item.timestamp)}
                            </span>
                          </div>

                          <div
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${colorClass}`}
                          >
                            數值: {item.value} / 100
                          </div>
                        </div>

                        {/* Selected Mood Meter Words */}
                        {item.selectedEmotions && item.selectedEmotions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {item.selectedEmotions.map((name) => {
                              const wordObj = findMoodMeterWord(name);
                              const qKey = wordObj?.quadrant || "yellow";
                              return (
                                <span
                                  key={name}
                                  className={`text-xs px-2.5 py-0.5 rounded-xl font-bold border ${
                                    qKey === "red"
                                      ? "bg-rose-100 text-rose-950 border-rose-200"
                                      : qKey === "yellow"
                                      ? "bg-amber-100 text-amber-950 border-amber-200"
                                      : qKey === "blue"
                                      ? "bg-sky-100 text-sky-950 border-sky-200"
                                      : "bg-emerald-100 text-emerald-950 border-emerald-200"
                                  }`}
                                >
                                  {name}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Speaker's Note if present */}
                        {item.note && (
                          <div className="bg-stone-50 rounded-xl p-2.5 text-xs text-stone-700 flex items-start gap-2 border border-stone-200/60">
                            <MessageSquareQuote className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">「{item.note}」</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50/80 flex items-center justify-between text-xs text-stone-500">
          <span>歷程記錄在對話期間即時彙整，方便陪伴者隨時回顧評估</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-900 text-white font-semibold hover:bg-stone-800 transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
