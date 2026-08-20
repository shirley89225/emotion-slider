import React, { useState } from "react";
import { UserRole } from "../types";
import { ColorTone } from "../utils/colors";
import {
  HeartHandshake,
  Share2,
  Settings,
  HelpCircle,
  Columns,
  Radio,
  Sparkles,
  Users,
  Copy,
  Check,
} from "lucide-react";

interface HeaderProps {
  roomId: string;
  role: UserRole;
  peerCount: number;
  isConnected: boolean;
  colorTone: ColorTone;
  onRoleChange: (newRole: UserRole) => void;
  onToneChange: (tone: ColorTone) => void;
  onOpenShare: () => void;
  onOpenFirebaseGuide: () => void;
  onToggleSplitView: () => void;
  isSplitView: boolean;
  onLeaveRoom: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  roomId,
  role,
  peerCount,
  isConnected,
  colorTone,
  onRoleChange,
  onToneChange,
  onOpenShare,
  onOpenFirebaseGuide,
  onToggleSplitView,
  isSplitView,
  onLeaveRoom,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="w-full bg-white/75 backdrop-blur-md border-b border-stone-200/80 px-4 py-2.5 sm:px-6 sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Room Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLeaveRoom}
            className="flex items-center gap-2 text-stone-800 hover:text-stone-950 font-semibold tracking-tight transition-colors text-left group"
            title="返回首頁 / 離開房間"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-emerald-500 flex items-center justify-center shadow-sm text-white transition-transform group-hover:scale-105">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div className="hidden sm:block leading-tight">
              <span className="text-base font-bold text-stone-800">情緒滑桿</span>
              <span className="text-xs text-stone-600 block">Emotion Slider</span>
            </div>
          </button>

          {/* Room Pill */}
          <div className="flex items-center gap-1.5 bg-stone-100/90 border border-stone-200/90 rounded-full px-3 py-1 text-xs text-stone-700">
            <span className="text-stone-600 font-medium">房間:</span>
            <span className="font-mono font-bold tracking-wider text-stone-900">{roomId}</span>
            <button
              onClick={handleCopyRoomId}
              className="ml-1 p-0.5 hover:text-stone-900 transition-colors"
              title="複製房間代碼"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Connection Indicator */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/70"
            title={isConnected ? `即時同步連線中 · ${peerCount} 人在線` : "連線中斷或重試中"}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-stone-300"
              }`}
            />
            <span>{isConnected ? "即時同步中" : "連線中"}</span>
            <span className="text-emerald-700 flex items-center gap-0.5 text-[11px] ml-0.5">
              <Users className="w-3 h-3 inline" /> {peerCount}
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Role Switcher */}
          <div className="bg-stone-100 p-0.5 rounded-xl border border-stone-200/80 flex items-center text-xs">
            <button
              onClick={() => onRoleChange("speaker")}
              className={`px-2.5 sm:px-3 py-1 rounded-lg font-medium transition-all ${
                role === "speaker"
                  ? "bg-white text-stone-900 shadow-xs border border-stone-200/60"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              分享者
            </button>
            <button
              onClick={() => onRoleChange("listener")}
              className={`px-2.5 sm:px-3 py-1 rounded-lg font-medium transition-all ${
                role === "listener"
                  ? "bg-white text-stone-900 shadow-xs border border-stone-200/60"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              陪伴者
            </button>
          </div>

          {/* Split View Toggle for easy testing */}
          <button
            onClick={onToggleSplitView}
            className={`p-2 rounded-xl border text-xs font-medium hidden lg:flex items-center gap-1.5 transition-all ${
              isSplitView
                ? "bg-amber-50 border-amber-300 text-amber-900"
                : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
            }`}
            title="開啟/關閉雙人分屏即時對照預覽"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{isSplitView ? "雙端分屏中" : "分屏預覽"}</span>
          </button>

          {/* Color Tone Toggle */}
          <div className="hidden sm:flex items-center">
            <button
              onClick={() => {
                const nextTone: Record<ColorTone, ColorTone> = {
                  gentle: "pastel",
                  pastel: "vibrant",
                  vibrant: "gentle",
                };
                onToneChange(nextTone[colorTone]);
              }}
              className="p-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-1 text-xs font-medium"
              title={`切換色彩模式（目前：${
                colorTone === "gentle" ? "舒緩柔和" : colorTone === "pastel" ? "恬靜粉彩" : "鮮明對比"
              }）`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden xl:inline">
                {colorTone === "gentle" ? "舒緩色調" : colorTone === "pastel" ? "粉彩色調" : "鮮明色調"}
              </span>
            </button>
          </div>

          {/* Share Room Button */}
          <button
            onClick={onOpenShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 text-xs font-medium shadow-xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>分享邀請</span>
          </button>

          {/* Firebase Guide Button */}
          <button
            onClick={onOpenFirebaseGuide}
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
            title="Firebase 設定教學與即時同步配置"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
