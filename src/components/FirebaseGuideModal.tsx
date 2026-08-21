import React, { useState, useEffect } from "react";
import {
  X,
  Database,
  Flame,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Code,
  Shield,
  Key,
  Save,
  RotateCcw,
  Zap,
  Globe,
  Radio,
  Server,
  HelpCircle,
} from "lucide-react";
import {
  getStoredFirebaseConfig,
  saveFirebaseConfig,
} from "../utils/firebaseRealtime";
import {
  getStoredBackendUrl,
  saveStoredBackendUrl,
} from "../hooks/useRoomSync";
import { FirebaseConfigOptions } from "../types";

interface FirebaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseGuideModal: React.FC<FirebaseGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"p2p" | "server" | "firebase">("p2p");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Custom backend url state
  const [backendUrl, setBackendUrl] = useState<string>("");
  const [backendSavedSuccess, setBackendSavedSuccess] = useState<boolean>(false);

  // Firebase states
  const [apiKey, setApiKey] = useState<string>("");
  const [authDomain, setAuthDomain] = useState<string>("");
  const [databaseURL, setDatabaseURL] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [firebaseSavedSuccess, setFirebaseSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setBackendUrl(getStoredBackendUrl());

      const stored = getStoredFirebaseConfig();
      if (stored) {
        setApiKey(stored.apiKey || "");
        setAuthDomain(stored.authDomain || "");
        setDatabaseURL(stored.databaseURL || "");
        setProjectId(stored.projectId || "");
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleSaveBackendUrl = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredBackendUrl(backendUrl);
    setBackendSavedSuccess(true);
    setTimeout(() => setBackendSavedSuccess(false), 2000);
  };

  const handleSaveCustomFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!databaseURL.trim()) {
      saveFirebaseConfig(null);
      setFirebaseSavedSuccess(true);
      setTimeout(() => setFirebaseSavedSuccess(false), 2500);
      return;
    }

    const config: FirebaseConfigOptions = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      databaseURL: databaseURL.trim(),
      projectId: projectId.trim(),
    };

    saveFirebaseConfig(config);
    setFirebaseSavedSuccess(true);
    setTimeout(() => setFirebaseSavedSuccess(false), 2500);
  };

  const sampleRules = `{
  "rules": {
    ".read": true,
    ".write": true
  }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-stone-200 space-y-5 relative max-h-[90vh] overflow-y-auto animate-scale-up text-stone-900">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="space-y-1 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>跨裝置即時同步管道</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            即時連線與同步設定
          </h3>
          <p className="text-xs sm:text-sm text-stone-600">
            在 Hostinger 等靜態網站主機上，系統已內建多重同步機制，確保不同手機或電腦可即時互通。
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-stone-100 p-1.5 rounded-2xl gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("p2p")}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "p2p"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>P2P 免費通道 (推薦)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("server")}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "server"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Server className="w-3.5 h-3.5 text-sky-500" />
            <span>自訂後端伺服器</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("firebase")}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "firebase"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Firebase 診斷與設定</span>
          </button>
        </div>

        {/* Tab 1: WebRTC P2P (Zero config) */}
        {activeTab === "p2p" && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>系統已內建啟用 WebRTC P2P 與公共通道</span>
              </div>
              <p className="text-emerald-800 leading-relaxed">
                您<strong>完全不需要申請任何帳號或設定金鑰</strong>！只要兩台裝置輸入相同的房間代碼（例如 <code className="bg-emerald-150 px-1.5 py-0.5 rounded font-mono font-bold">ROOM-8888</code>），一人選擇分享者、一人選擇陪伴者，瀏覽器便會透過 P2P 建立加密的直接通訊。
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2">
              <div className="font-bold text-stone-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-stone-500" />
                <span>使用技巧與注意事項：</span>
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-stone-600 pl-1 leading-relaxed">
                <li>請先讓「<strong>分享者 (Speaker)</strong>」進入房間，隨後「<strong>陪伴者 (Listener)</strong>」進入即可自動對接。</li>
                <li>支援手機 4G/5G 跨家用 WiFi 連線，延遲極低。</li>
                <li>若所在網路環境（如特殊公司防火牆）阻擋 P2P，系統會自動轉由公共 WebSocket 備援通道傳輸。</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Custom Backend Server */}
        {activeTab === "server" && (
          <form onSubmit={handleSaveBackendUrl} className="space-y-4 text-xs sm:text-sm">
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 space-y-2">
              <div className="font-bold text-sky-950 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-sky-600" />
                <span>連接自建或免費雲端後端 (Render / Railway / VPS)</span>
              </div>
              <p className="text-sky-800 text-xs leading-relaxed">
                您可以將專案的 <code className="font-mono bg-sky-100 px-1 py-0.5 rounded">server.ts</code> 免費一鍵部署在 <strong>Render.com</strong> 或 <strong>Railway.app</strong>，並在此填入後端 API 網址，讓 Hostinger 靜態前端直接與專屬伺服器連線。
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-stone-700 text-xs">
                後端伺服器 API 網址 (Backend Server URL)
              </label>
              <input
                type="url"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="例如: https://my-slider-api.onrender.com"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-800 focus:bg-white focus:outline-hidden"
              />
              <p className="text-[11px] text-stone-500">
                留空表示使用本機或 P2P 模式。
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              {backendSavedSuccess ? (
                <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> 伺服器網址已儲存！
                </span>
              ) : (
                <span />
              )}
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-colors shadow-xs"
              >
                儲存後端網址
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Firebase RTDB & Permission Troubleshooter */}
        {activeTab === "firebase" && (
          <form onSubmit={handleSaveCustomFirebase} className="space-y-4 text-xs sm:text-sm">
            {/* Troubleshooter for Permission Denied */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
              <div className="font-bold text-amber-950 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>常見連不上原因：Firebase 規則 (Rules) 尚未開放</span>
              </div>
              <p className="text-amber-900 text-xs leading-relaxed">
                Firebase Realtime Database 預設為禁止讀寫 (<code className="font-mono">false</code>)。請前往 Firebase Console ➔ <strong>Realtime Database</strong> ➔ 點選「<strong>規則 (Rules)</strong>」頁籤，改成以下內容並點選「發布」：
              </p>
              <div className="relative bg-stone-900 text-amber-300 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                <pre>{sampleRules}</pre>
                <button
                  type="button"
                  onClick={() => handleCopy(sampleRules, "rules")}
                  className="absolute right-2 top-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] flex items-center gap-1 transition-colors"
                >
                  {copiedSection === "rules" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSection === "rules" ? "已複製" : "複製規則"}</span>
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-stone-700 text-xs mb-1">
                  databaseURL (必填)
                </label>
                <input
                  type="text"
                  value={databaseURL}
                  onChange={(e) => setDatabaseURL(e.target.value)}
                  placeholder="https://your-project-default-rtdb.firebaseio.com"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-800 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 text-xs mb-1">
                    apiKey
                  </label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-800 focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 text-xs mb-1">
                    projectId
                  </label>
                  <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="my-project-id"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-800 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {firebaseSavedSuccess ? (
                <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Firebase 設定已儲存！
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setApiKey("");
                    setAuthDomain("");
                    setDatabaseURL("");
                    setProjectId("");
                    saveFirebaseConfig(null);
                  }}
                  className="text-stone-500 hover:text-rose-600 text-xs font-semibold"
                >
                  清除 Firebase 設定
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 transition-colors shadow-xs"
              >
                儲存 Firebase 設定
              </button>
            </div>
          </form>
        )}

        {/* Modal Footer */}
        <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>只要兩端在相同房間，系統將自動確保連線與即時同步</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white font-semibold hover:bg-stone-800 transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
