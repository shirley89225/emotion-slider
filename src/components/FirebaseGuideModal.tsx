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
} from "lucide-react";
import {
  getStoredFirebaseConfig,
  saveFirebaseConfig,
} from "../utils/firebaseRealtime";
import { FirebaseConfigOptions } from "../types";

interface FirebaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseGuideModal: React.FC<FirebaseGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [authDomain, setAuthDomain] = useState<string>("");
  const [databaseURL, setDatabaseURL] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
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

  const handleSaveCustomFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!databaseURL.trim()) {
      saveFirebaseConfig(null);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
      return;
    }

    const config: FirebaseConfigOptions = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      databaseURL: databaseURL.trim(),
      projectId: projectId.trim(),
    };
    saveFirebaseConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleClearConfig = () => {
    setApiKey("");
    setAuthDomain("");
    setDatabaseURL("");
    setProjectId("");
    saveFirebaseConfig(null);
  };

  const rulesExample = `{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    }
  }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 relative my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-xs font-semibold text-amber-900">
            <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
            <span>Firebase Realtime Database 設定指南</span>
          </div>
          <h3 className="text-xl font-bold text-stone-900">
            如何在 Firebase Console 啟用即時同步？
          </h3>
          <p className="text-xs text-stone-500">
            本 App 預設已內建零延遲的即時通訊服務；若您希望連接個人的 Firebase 專案，請參考以下 4 個簡易步驟：
          </p>
        </div>

        {/* 4-Step Visual Guide */}
        <div className="space-y-4 text-xs">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
              <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs">
                1
              </span>
              <span>前往 Firebase Console 建立專案</span>
            </div>
            <p className="text-stone-600 leading-relaxed pl-7">
              打開{" "}
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-amber-700 font-semibold underline inline-flex items-center gap-0.5"
              >
                Firebase Console <ExternalLink className="w-3 h-3" />
              </a>{" "}
              並點擊「新增專案 (Add Project)」，輸入專案名稱（例如：<code>emotion-slider</code>）。
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
              <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs">
                2
              </span>
              <span>啟用 Realtime Database</span>
            </div>
            <p className="text-stone-600 leading-relaxed pl-7">
              在左側導航選單中點擊 <strong>Build (建構)</strong> &gt;{" "}
              <strong>Realtime Database</strong>，接著點選「<strong>建立資料庫 (Create Database)</strong>」，選擇離您最近的地理區域（例如：<code>asia-southeast1</code> 或 <code>us-central1</code>）。
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
              <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs">
                3
              </span>
              <span>配置安全規則 (Security Rules)</span>
            </div>
            <p className="text-stone-600 leading-relaxed pl-7">
              切換至「<strong>規則 (Rules)</strong>」頁籤，貼上以下房間讀寫規則，讓擁有相同房號的使用者可以即時同步情緒數值：
            </p>
            <div className="pl-7 relative">
              <pre className="bg-stone-900 text-emerald-400 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
                {rulesExample}
              </pre>
              <button
                onClick={() => handleCopy(rulesExample, "rules")}
                className="absolute top-2 right-2 px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-[10px] font-mono flex items-center gap-1 transition-colors"
              >
                {copiedSection === "rules" ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>已複製</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>複製規則</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
              <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs">
                4
              </span>
              <span>新增 Web 應用並複製 Database URL</span>
            </div>
            <p className="text-stone-600 leading-relaxed pl-7">
              在「專案設定 (Project Settings)」中點擊 <strong>&lt;/&gt; Web</strong> 註冊應用，取得 <code>databaseURL</code> 與 <code>apiKey</code>。
            </p>
          </div>
        </div>

        {/* Optional Custom Configuration Form */}
        <div className="pt-2 border-t border-stone-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-stone-500" />
              <span>自訂 Firebase 連線資訊 (可選)</span>
            </div>
            <button
              type="button"
              onClick={handleClearConfig}
              className="text-[11px] text-stone-400 hover:text-rose-600 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>清除自訂配置 (恢復預設即時伺服器)</span>
            </button>
          </div>

          <form onSubmit={handleSaveCustomFirebase} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Database URL (例如: https://my-app-default-rtdb.firebaseio.com)
              </label>
              <input
                type="text"
                value={databaseURL}
                onChange={(e) => setDatabaseURL(e.target.value)}
                placeholder="https://your-project-id.firebaseio.com"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-800 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  API Key
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-800 focus:bg-white focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Project ID
                </label>
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="my-emotion-app"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-800 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {savedSuccess && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  已儲存設定
                </span>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>儲存並啟用</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
