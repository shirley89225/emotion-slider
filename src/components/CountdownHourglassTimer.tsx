import React, { useState, useEffect, useRef } from "react";
import {
  Hourglass,
  Play,
  Pause,
  RotateCcw,
  BellRing,
  Volume2,
  Plus,
  X,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface CountdownHourglassTimerProps {
  onCheckInTimeReached?: () => void;
}

const PRESET_MINUTES = [3, 5, 10, 15, 20, 30, 45];

export const CountdownHourglassTimer: React.FC<CountdownHourglassTimerProps> = ({
  onCheckInTimeReached,
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(10);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(10 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showAlarmModal, setShowAlarmModal] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const totalDurationSeconds = selectedMinutes * 60;
  const progressPercent = Math.max(
    0,
    Math.min(100, ((totalDurationSeconds - timeLeftSeconds) / totalDurationSeconds) * 100)
  );

  const intervalRef = useRef<any>(null);

  // Play audio chime when timer fires
  const playAlertChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;

      // 3 pleasant harmonic tones
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);
        gain.gain.setValueAtTime(0.08, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.9);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.9);
      });
    } catch {
      // Audio context blocked or not supported
    }
  };

  // Vibration feedback
  const triggerVibration = () => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([300, 150, 300, 150, 500]);
      } catch {
        // vibration not supported
      }
    }
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            setShowAlarmModal(true);
            playAlertChime();
            triggerVibration();
            if (onCheckInTimeReached) {
              onCheckInTimeReached();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onCheckInTimeReached]);

  const handleSelectPreset = (mins: number) => {
    setSelectedMinutes(mins);
    setTimeLeftSeconds(mins * 60);
    setIsRunning(false);
  };

  const handleTogglePlay = () => {
    if (timeLeftSeconds === 0) {
      setTimeLeftSeconds(selectedMinutes * 60);
    }
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeftSeconds(selectedMinutes * 60);
  };

  const handleAddMinutes = (extraMins: number) => {
    setTimeLeftSeconds((prev) => prev + extraMins * 60);
  };

  const handleDismissModal = (restartNextCycle: boolean = false) => {
    setShowAlarmModal(false);
    if (restartNextCycle) {
      setTimeLeftSeconds(selectedMinutes * 60);
      setIsRunning(true);
    } else {
      setTimeLeftSeconds(selectedMinutes * 60);
      setIsRunning(false);
    }
  };

  // Format mm:ss
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <>
      {/* Time Up Alert Modal */}
      {showAlarmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-300 text-stone-900 space-y-6 animate-scale-up">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 mx-auto flex items-center justify-center text-amber-600 animate-bounce">
              <BellRing className="w-8 h-8" />
            </div>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>{selectedMinutes} 分鐘陪伴區間已到</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                請適時暫停並確認狀態
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed px-2">
                沙漏計時已完成。建議在此刻溫柔地暫停對話節奏，向分享者確認「此刻感受如何？」或觀察情緒滑桿是否有新變化。
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleDismissModal(true)}
                className="flex-1 px-4 py-3 rounded-2xl bg-stone-900 text-white hover:bg-stone-800 text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>狀態已確認，開始下一輪</span>
              </button>
              <button
                type="button"
                onClick={() => handleDismissModal(false)}
                className="px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-semibold transition-colors"
              >
                關閉提醒
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Hourglass Timer Card */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-white/80 shadow-md text-stone-900 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
              <Hourglass className={`w-4 h-4 ${isRunning ? "animate-spin" : ""}`} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-stone-900">陪伴沙漏計時器</h4>
              <p className="text-[11px] text-stone-500">倒數提醒暫停，確認對話者狀態</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isRunning && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                進行中
              </span>
            )}
          </div>
        </div>

        {/* Digital Time & Circular Sand Track */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-50/90 rounded-2xl p-4 border border-stone-200/80">
          <div className="flex items-center gap-4">
            {/* Visual Sand Circle */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-stone-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-500 transition-all duration-500 ease-linear"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <Hourglass className="w-5 h-5 text-amber-600 absolute" />
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-stone-900">
                {formatTime(timeLeftSeconds)}
              </div>
              <div className="text-[11px] font-medium text-stone-500">
                預設區間：{selectedMinutes} 分鐘（已進行 {Math.round(progressPercent)}%）
              </div>
            </div>
          </div>

          {/* Primary Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTogglePlay}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all ${
                isRunning
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-stone-900 hover:bg-stone-800 text-white"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>暫停</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{timeLeftSeconds === 0 ? "重新開始" : "開始計時"}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors shadow-2xs"
              title="重設目前區間"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleAddMinutes(5)}
              className="px-2.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-semibold flex items-center gap-0.5 transition-colors"
              title="延長 5 分鐘"
            >
              <Plus className="w-3 h-3" />
              <span>5分</span>
            </button>
          </div>
        </div>

        {/* Interval Selection Presets */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-bold text-stone-500">選擇提醒間隔區間：</div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_MINUTES.map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => handleSelectPreset(mins)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  selectedMinutes === mins
                    ? "bg-amber-500 text-white shadow-2xs font-bold"
                    : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                }`}
              >
                {mins} 分鐘
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
