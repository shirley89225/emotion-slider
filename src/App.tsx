/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { UserRole, EmotionHistoryEntry } from "./types";
import { ColorTone } from "./utils/colors";
import { useRoomSync } from "./hooks/useRoomSync";
import { Header } from "./components/Header";
import { RoomSelector } from "./components/RoomSelector";
import { SpeakerView } from "./components/SpeakerView";
import { ListenerView } from "./components/ListenerView";
import { ShareModal } from "./components/ShareModal";
import { FirebaseGuideModal } from "./components/FirebaseGuideModal";

export default function App() {
  const [roomId, setRoomId] = useState<string>("");
  const [role, setRole] = useState<UserRole>("none");
  const [colorTone, setColorTone] = useState<ColorTone>("gentle");
  const [isSplitView, setIsSplitView] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isFirebaseGuideOpen, setIsFirebaseGuideOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<EmotionHistoryEntry[]>([]);

  // Parse URL query parameters on initial mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get("room");
      const urlRole = params.get("role") as UserRole;

      if (urlRoom) {
        setRoomId(urlRoom.toUpperCase());
        if (urlRole === "speaker" || urlRole === "listener") {
          setRole(urlRole);
        } else {
          setRole("speaker");
        }
      }
    }
  }, []);

  // Update browser URL query params whenever room or role changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (roomId) {
        const newUrl = `${window.location.pathname}?room=${encodeURIComponent(roomId)}&role=${role}`;
        window.history.replaceState(null, "", newUrl);
      } else {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, [roomId, role]);

  const {
    state: roomState,
    peerCount,
    isConnected,
    incomingReaction,
    updateEmotion,
    clearReaction,
  } = useRoomSync(roomId || "default", role);

  // Track emotion history snapshots
  const lastLoggedStateRef = useRef<{ value: number; note: string; emotionsStr: string } | null>(null);

  useEffect(() => {
    if (!roomId || role === "none") return;

    // Do not log while continuously dragging
    if (roomState.isAdjusting) return;

    const emotionsStr = (roomState.selectedEmotions || []).slice().sort().join(",");
    const isDifferent =
      !lastLoggedStateRef.current ||
      lastLoggedStateRef.current.value !== roomState.value ||
      lastLoggedStateRef.current.note !== (roomState.note || "") ||
      lastLoggedStateRef.current.emotionsStr !== emotionsStr;

    if (isDifferent) {
      lastLoggedStateRef.current = {
        value: roomState.value,
        note: roomState.note || "",
        emotionsStr,
      };

      const newEntry: EmotionHistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        timestamp: Date.now(),
        value: roomState.value,
        note: roomState.note || "",
        selectedEmotions: roomState.selectedEmotions || [],
      };

      setHistory((prev) => [...prev, newEntry]);
    }
  }, [roomState.value, roomState.note, roomState.selectedEmotions, roomState.isAdjusting, roomId, role]);

  const handleJoinRoom = (targetRoomId: string, targetRole: UserRole) => {
    setRoomId(targetRoomId.toUpperCase());
    setRole(targetRole === "none" ? "speaker" : targetRole);
    setHistory([]);
    lastLoggedStateRef.current = null;
  };

  const handleLeaveRoom = () => {
    setRoomId("");
    setRole("none");
    setIsSplitView(false);
    setHistory([]);
    lastLoggedStateRef.current = null;
  };

  // If no room is joined yet, show the room selector and onboarding view
  if (!roomId || role === "none") {
    return (
      <main className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased selection:bg-amber-200">
        <RoomSelector
          initialRoomId={roomId}
          initialRole={role}
          onJoinRoom={handleJoinRoom}
          onOpenFirebaseGuide={() => setIsFirebaseGuideOpen(true)}
        />
        <FirebaseGuideModal
          isOpen={isFirebaseGuideOpen}
          onClose={() => setIsFirebaseGuideOpen(false)}
        />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans antialiased text-stone-900 selection:bg-amber-200">
      {/* Top App Header */}
      <Header
        roomId={roomId}
        role={role}
        peerCount={peerCount}
        isConnected={isConnected}
        colorTone={colorTone}
        onRoleChange={(newRole) => setRole(newRole)}
        onToneChange={(newTone) => setColorTone(newTone)}
        onOpenShare={() => setIsShareModalOpen(true)}
        onOpenFirebaseGuide={() => setIsFirebaseGuideOpen(true)}
        onToggleSplitView={() => setIsSplitView((prev) => !prev)}
        isSplitView={isSplitView}
        onLeaveRoom={handleLeaveRoom}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {isSplitView ? (
          /* Split View for simultaneous multi-perspective previewing */
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-stone-300">
            <div className="flex-1 bg-white/95 relative border-r border-stone-200">
              <div className="bg-stone-900 text-white text-xs font-bold py-1.5 px-4 sticky top-[57px] z-20 flex items-center justify-between">
                <span>左側：分享者端 (Speaker View)</span>
                <span className="text-[11px] font-normal text-stone-400">操作滑桿立即同步至右側</span>
              </div>
              <SpeakerView
                state={roomState}
                colorTone={colorTone}
                onUpdateEmotion={updateEmotion}
                incomingReaction={incomingReaction}
                onClearReaction={clearReaction}
              />
            </div>
            <div className="flex-1 relative">
              <div className="bg-stone-800 text-white text-xs font-bold py-1.5 px-4 sticky top-[57px] z-20 flex items-center justify-between">
                <span>右側：陪伴者端 (Listener View)</span>
                <span className="text-[11px] font-normal text-stone-300">畫面背景隨左側數值平滑過渡</span>
              </div>
              <ListenerView
                state={roomState}
                colorTone={colorTone}
                history={history}
                onClearHistory={() => setHistory([])}
                onUpdateCustomGuidance={(guidance) => updateEmotion({ customGuidance: guidance }, true)}
              />
            </div>
          </div>
        ) : role === "speaker" ? (
          /* Speaker View (Single role) */
          <SpeakerView
            state={roomState}
            colorTone={colorTone}
            onUpdateEmotion={updateEmotion}
            incomingReaction={incomingReaction}
            onClearReaction={clearReaction}
          />
        ) : (
          /* Listener View (Single role) */
          <ListenerView
            state={roomState}
            colorTone={colorTone}
            history={history}
            onClearHistory={() => setHistory([])}
            onUpdateCustomGuidance={(guidance) => updateEmotion({ customGuidance: guidance }, true)}
          />
        )}
      </main>

      {/* Share and Firebase Modals */}
      <ShareModal
        roomId={roomId}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
      <FirebaseGuideModal
        isOpen={isFirebaseGuideOpen}
        onClose={() => setIsFirebaseGuideOpen(false)}
      />
    </div>
  );
}
