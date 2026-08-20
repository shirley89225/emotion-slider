import { useState, useEffect, useRef, useCallback } from "react";
import { EmotionState, ReactionMessage, UserRole } from "../types";
import {
  subscribeFirebaseRoom,
  updateFirebaseRoom,
  getStoredFirebaseConfig,
} from "../utils/firebaseRealtime";

const DEFAULT_STATE: EmotionState = {
  value: 50,
  note: "",
  tag: "平穩",
  selectedEmotions: [],
  customGuidance: "",
  isAdjusting: false,
  updatedAt: Date.now(),
};

export function useRoomSync(roomId: string, role: UserRole) {
  const [state, setState] = useState<EmotionState>(DEFAULT_STATE);
  const [peerCount, setPeerCount] = useState<number>(1);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [incomingReaction, setIncomingReaction] = useState<ReactionMessage | null>(null);

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const isLocalUpdateRef = useRef<boolean>(false);
  const debounceTimerRef = useRef<any>(null);

  // Initialize BroadcastChannel for instant local multi-tab testing
  useEffect(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel(`emotion_slider_${roomId}`);
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === "STATE_UPDATE") {
          setState((prev) => ({
            ...prev,
            ...payload,
            updatedAt: payload.updatedAt || Date.now(),
          }));
        } else if (type === "REACTION") {
          setIncomingReaction(payload);
        }
      };

      return () => {
        channel.close();
      };
    }
  }, [roomId]);

  // Connect to SSE (Server-Sent Events) backend
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let isSubscribed = true;

    try {
      eventSource = new EventSource(`/api/rooms/${encodeURIComponent(roomId)}/events?role=${role}`);

      eventSource.onopen = () => {
        if (isSubscribed) {
          setIsConnected(true);
        }
      };

      eventSource.addEventListener("init", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (isSubscribed) {
            setState({
              value: data.value ?? 50,
              note: data.note || "",
              tag: data.tag || "平穩",
              selectedEmotions: Array.isArray(data.selectedEmotions) ? data.selectedEmotions : [],
              customGuidance: data.customGuidance || "",
              isAdjusting: Boolean(data.isAdjusting),
              updatedAt: data.updatedAt || Date.now(),
              lastReaction: data.lastReaction,
            });
            if (data.peerCount) {
              setPeerCount(data.peerCount);
            }
          }
        } catch (e) {
          console.error("Failed to parse init data", e);
        }
      });

      eventSource.addEventListener("state_update", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (isSubscribed) {
            setState({
              value: data.value ?? 50,
              note: data.note || "",
              tag: data.tag || "平穩",
              selectedEmotions: Array.isArray(data.selectedEmotions) ? data.selectedEmotions : [],
              customGuidance: data.customGuidance || "",
              isAdjusting: Boolean(data.isAdjusting),
              updatedAt: data.updatedAt || Date.now(),
              lastReaction: data.lastReaction,
            });
          }
        } catch (e) {
          console.error("Failed to parse state update", e);
        }
      });

      eventSource.addEventListener("peer_count", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (isSubscribed && typeof data.count === "number") {
            setPeerCount(data.count);
          }
        } catch (e) {
          console.error("Failed to parse peer count", e);
        }
      });

      eventSource.addEventListener("reaction", (event: MessageEvent) => {
        try {
          const reaction = JSON.parse(event.data);
          if (isSubscribed) {
            setIncomingReaction(reaction);
          }
        } catch (e) {
          console.error("Failed to parse reaction", e);
        }
      });

      eventSource.onerror = () => {
        if (isSubscribed) {
          setIsConnected(false);
        }
      };
    } catch (err) {
      console.warn("SSE Connection error", err);
    }

    // Optional Firebase RTDB subscriber
    const unsubFirebase = subscribeFirebaseRoom(roomId, (fbState) => {
      if (isSubscribed && fbState) {
        setState((prev) => ({
          ...prev,
          ...fbState,
        }));
      }
    });

    return () => {
      isSubscribed = false;
      if (eventSource) {
        eventSource.close();
      }
      if (unsubFirebase) {
        unsubFirebase();
      }
    };
  }, [roomId, role]);

  // Update room state (Used by Speaker)
  const updateEmotion = useCallback(
    (partial: Partial<EmotionState>, immediate: boolean = false) => {
      isLocalUpdateRef.current = true;
      const nextState: EmotionState = {
        ...state,
        ...partial,
        updatedAt: Date.now(),
      };

      // Optimistic local update
      setState(nextState);

      // Broadcast to other tabs on the same computer immediately
      if (broadcastChannelRef.current) {
        try {
          broadcastChannelRef.current.postMessage({
            type: "STATE_UPDATE",
            payload: nextState,
          });
        } catch {
          // ignore
        }
      }

      // Sync with Firebase RTDB if configured
      if (getStoredFirebaseConfig()) {
        updateFirebaseRoom(roomId, nextState);
      }

      // Debounced or immediate sync to Express backend
      const sendToServer = () => {
        fetch(`/api/rooms/${encodeURIComponent(roomId)}/update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nextState),
        }).catch((err) => console.warn("Failed to sync room state", err));
      };

      if (immediate) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        sendToServer();
      } else {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(sendToServer, 60);
      }
    },
    [roomId, state]
  );

  // Send reaction (Used by Listener)
  const sendReaction = useCallback(
    async (text: string, senderName: string = "陪伴者") => {
      const reactionPayload: ReactionMessage = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        text,
        sender: senderName,
        timestamp: Date.now(),
      };

      // Local optimistic reaction trigger
      setIncomingReaction(reactionPayload);

      // Broadcast channel for local tab sync
      if (broadcastChannelRef.current) {
        try {
          broadcastChannelRef.current.postMessage({
            type: "REACTION",
            payload: reactionPayload,
          });
        } catch {
          // ignore
        }
      }

      try {
        await fetch(`/api/rooms/${encodeURIComponent(roomId)}/reaction`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, sender: senderName }),
        });
      } catch (err) {
        console.warn("Failed to send reaction", err);
      }
    },
    [roomId]
  );

  return {
    state,
    peerCount,
    isConnected,
    incomingReaction,
    updateEmotion,
    sendReaction,
    clearReaction: () => setIncomingReaction(null),
  };
}
