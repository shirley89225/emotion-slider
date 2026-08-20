import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  Share2,
  User,
  Headphones,
  ExternalLink,
  QrCode,
} from "lucide-react";

interface ShareModalProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  roomId,
  isOpen,
  onClose,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const speakerUrl = `${baseUrl}?room=${encodeURIComponent(roomId)}&role=speaker`;
  const listenerUrl = `${baseUrl}?room=${encodeURIComponent(roomId)}&role=listener`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 relative animate-scale-up">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-xs font-semibold text-stone-700">
            <Share2 className="w-3.5 h-3.5" />
            <span>房間邀請</span>
          </div>
          <h3 className="text-xl font-bold text-stone-900">分享此對話房間</h3>
          <p className="text-xs text-stone-500">
            將連結或房號傳送給另一位參與者，雙方即可在各自裝置上即時連線。
          </p>
        </div>

        {/* Room Code Quick Box */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-medium">房間號碼</div>
            <div className="text-2xl font-black font-mono tracking-widest text-stone-900 mt-0.5">
              {roomId}
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(roomId, "code")}
            className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 hover:bg-stone-50 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            {copiedType === "code" ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>已複製</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>複製房號</span>
              </>
            )}
          </button>
        </div>

        {/* Specific Role Links */}
        <div className="space-y-3">
          {/* Listener Link (Recommended to send to listener) */}
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-emerald-900">陪伴者專屬連結 (Listener)</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium">點擊自動進入陪伴畫面</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={listenerUrl}
                className="flex-1 px-3 py-2 bg-white border border-emerald-200/80 rounded-xl text-xs text-stone-600 font-mono select-all focus:outline-hidden"
              />
              <button
                onClick={() => copyToClipboard(listenerUrl, "listener")}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 shadow-2xs"
              >
                {copiedType === "listener" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === "listener" ? "已複製" : "複製連結"}</span>
              </button>
            </div>
          </div>

          {/* Speaker Link */}
          <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-bold text-amber-900">分享者專屬連結 (Speaker)</span>
              </div>
              <span className="text-[11px] text-amber-700 font-medium">點擊自動開啟滑桿介面</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={speakerUrl}
                className="flex-1 px-3 py-2 bg-white border border-amber-200/80 rounded-xl text-xs text-stone-600 font-mono select-all focus:outline-hidden"
              />
              <button
                onClick={() => copyToClipboard(speakerUrl, "speaker")}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 shadow-2xs"
              >
                {copiedType === "speaker" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === "speaker" ? "已複製" : "複製連結"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tip for same computer testing */}
        <div className="bg-stone-50 rounded-2xl p-3 text-[11px] text-stone-500 leading-relaxed">
          💡 <strong>本機測試提示：</strong> 您可以直接在瀏覽器開啟另一個「無痕分頁」或新視窗貼上連結，即可模擬兩台裝置即時聯動的真實效果！
        </div>
      </div>
    </div>
  );
};
