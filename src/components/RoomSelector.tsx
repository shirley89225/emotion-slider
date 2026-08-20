import React, { useState } from "react";
import { UserRole } from "../types";
import {
  HeartHandshake,
  User,
  Headphones,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  HelpCircle,
} from "lucide-react";

interface RoomSelectorProps {
  initialRoomId?: string;
  initialRole?: UserRole;
  onJoinRoom: (roomId: string, role: UserRole) => void;
  onOpenFirebaseGuide: () => void;
}

export const RoomSelector: React.FC<RoomSelectorProps> = ({
  initialRoomId = "",
  initialRole = "speaker",
  onJoinRoom,
  onOpenFirebaseGuide,
}) => {
  const [roomId, setRoomId] = useState<string>(initialRoomId);
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    initialRole === "none" ? "speaker" : initialRole
  );

  const generateRandomRoomId = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${randomNum}`;
  };

  const handleCreateNewRoom = () => {
    const newId = generateRandomRoomId();
    setRoomId(newId);
    onJoinRoom(newId, selectedRole);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRoomId = roomId.trim() || generateRandomRoomId();
    onJoinRoom(finalRoomId, selectedRole);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Brand Bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-emerald-500 flex items-center justify-center shadow-xs text-white">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-stone-900 leading-tight">情緒滑桿</h1>
            <p className="text-xs text-stone-500">Emotion Slider · 諮商與傾聽即時同步</p>
          </div>
        </div>

        <button
          onClick={onOpenFirebaseGuide}
          className="flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-stone-900 bg-white/80 border border-stone-200/80 px-3 py-1.5 rounded-xl shadow-2xs transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Firebase 即時設定說明</span>
        </button>
      </div>

      {/* Center Main Card */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-white/90 backdrop-blur-xl border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-xs font-semibold text-amber-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>無壓力的非語言情緒對話</span>
            </div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              開啟同步對話房間
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              透過顏色與滑桿，即時讓對方理解你的感受變化，無須開口即可傳遞心境。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Room ID Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700">
                房間號碼 (Room ID)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="輸入 4 位數或自訂房號 (例如 8842)"
                  maxLength={12}
                  className="flex-1 px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 font-mono font-bold text-sm tracking-wider placeholder-stone-400 placeholder:font-normal placeholder:tracking-normal focus:bg-white focus:border-stone-400 focus:outline-hidden transition-all"
                />
                <button
                  type="button"
                  onClick={() => setRoomId(generateRandomRoomId())}
                  className="px-3.5 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold shrink-0 transition-colors"
                  title="隨機產生房間號碼"
                >
                  隨機
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700">
                選擇你在本次對話中的角色
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Speaker Card */}
                <button
                  type="button"
                  onClick={() => setSelectedRole("speaker")}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                    selectedRole === "speaker"
                      ? "border-amber-500 bg-amber-50/50 shadow-xs"
                      : "border-stone-200 hover:border-stone-300 bg-white"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-sm text-stone-900">我是分享者</div>
                  <div className="text-[11px] text-stone-500 mt-0.5 leading-tight">
                    操作滑桿 (0-100) 標示心情
                  </div>
                  {selectedRole === "speaker" && (
                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </button>

                {/* Listener Card */}
                <button
                  type="button"
                  onClick={() => setSelectedRole("listener")}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                    selectedRole === "listener"
                      ? "border-emerald-500 bg-emerald-50/50 shadow-xs"
                      : "border-stone-200 hover:border-stone-300 bg-white"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-sm text-stone-900">我是陪伴者</div>
                  <div className="text-[11px] text-stone-500 mt-0.5 leading-tight">
                    即時同步色彩與陪伴建議
                  </div>
                  {selectedRole === "listener" && (
                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-stone-900 text-white font-bold text-sm shadow-md hover:bg-stone-800 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>進入對話房間</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={handleCreateNewRoom}
                className="w-full py-3 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>建立全新對話房間 (一鍵開房)</span>
              </button>
            </div>
          </form>

          {/* Privacy Note */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>端到端即時連線 · 免登入 · 保護對話隱私</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl w-full mx-auto text-center text-xs text-stone-400">
        情緒滑桿 Emotion Slider · 用色彩搭起最溫柔的對話橋樑
      </div>
    </div>
  );
};
