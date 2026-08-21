import { useState, useEffect, useRef, useCallback } from "react";
import { EmotionState, ReactionMessage, UserRole } from "../types";
import {
  subscribeFirebaseRoom,
  updateFirebaseRoom,
  getStoredFirebaseConfig,
} from "../utils/firebaseRealtime";
import { WebRTCRoomManager, WebRTCConnectionStatus } from "../utils/webrtcSync";
import { PublicWebSocketRelay } from "../utils/publicMqttRelay";

const DEFAULT_STATE: EmotionState = {
  value: 50,
  note: "",
  tag: "平穩",
  selectedEmotions: [],
  customGuidance: "",
  isAdjusting: false,
  updatedAt: Date.now(),
};

export const BACKEND_URL_STORAGE_KEY = "emotion_slider_custom_backend_url";

export function getStoredBackendUrl(): string {
  try {
    return localStorage.getItem(BACKEND_URL_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function saveStoredBackendUrl(url: string) {
  try {
    if (!url.trim()) {
      localStorage.removeItem(BACKEND_URL_STORAGE_KEY);
    } else {
      localStorage.setItem(BACKEND_URL_STORAGE_KEY, url.trim().replace(/\/+$/, ""));
    }
  } catch {
    // ignore
  }
}

export function useRoomSync(roomId: string, role: UserRole) {
  const [state, setState] = useState<EmotionState>(DEFAULT_STATE);
  const [peerCount, setPeerCount] = useState<number>(1);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionMethod, setConnectionMethod] = useState<string>("connecting");
  const [incomingReaction, setIncomingReaction] = useState<ReactionMessage | null>(null);

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const webrtcManagerRef = useRef<WebRTCRoomManager | null>(null);
  const publicRelayRef = useRef<PublicWebSocketRelay | null>(null);
  const isLocalUpdateRef = useRef<boolean>(false);
  const debounceTimerRef = useRef<any>(null);

  // 1. Initialize BroadcastChannel for instant local multi-tab testing
  useEffect(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel(`emotion_slider_${roomId}`);
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === "STATE_UPDATE" && payload) {
          setState((prev) => ({
            ...prev,
            ...payload,
            updatedAt: payload.updatedAt || Date.now(),
          }));
        } else if (type === "REACTION" && payload) {
          setIncomingReaction(payload);
        }
      };

      return () => {
        channel.close();
      };
    }
  }, [roomId]);

  // 2. Initialize WebRTC P2P + Public Relay (Zero Setup) + Backend SSE + Firebase RTDB
  useEffect(() => {
    if (!roomId || role === "none") return;

    let isSubscribed = true;

    // Handle Incoming State from any channel
    const handleRemoteStateUpdate = (remoteState: EmotionState) => {
      if (!isSubscribed || !remoteState) return;
      setState((prev) => ({
        ...prev,
        ...remoteState,
        updatedAt: remoteState.updatedAt || Date.now(),
      }));
      setIsConnected(true);
    };

    // Handle Incoming Reaction
    const handleRemoteReaction = (reaction: ReactionMessage) => {
      if (!isSubscribed || !reaction) return;
      setIncomingReaction(reaction);
    };

    // A. WebRTC P2P Channel (No server required, direct device-to-device)
    try {
      const webrtc = new WebRTCRoomManager(
        roomId,
        role === "listener" ? "listener" : "speaker",
        handleRemoteStateUpdate,
        handleRemoteReaction,
        (status: WebRTCConnectionStatus, count: number) => {
          if (!isSubscribed) return;
          if (status === "connected") {
            setIsConnected(true);
            setConnectionMethod("p2p");
            if (count > 0) setPeerCount(count);
          }
        }
      );
      webrtcManagerRef.current = webrtc;
    } catch (err) {
      console.warn("WebRTC manager failed:", err);
    }

    // B. Public Relay Fallback
    try {
      const relay = new PublicWebSocketRelay(
        roomId,
        handleRemoteStateUpdate,
        handleRemoteReaction
      );
      publicRelayRef.current = relay;
    } catch (err) {
      console.warn("Public relay failed:", err);
    }

    // C. Backend SSE (Local dev server or custom backend URL)
    let eventSource: EventSource | null = null;
    const customBackend = getStoredBackendUrl();
    const sseBase = customBackend || "";

    try {
      const sseUrl = `${sseBase}/api/rooms/${encodeURIComponent(roomId)}/events?role=${role}`;
      eventSource = new EventSource(sseUrl);

      eventSource.onopen = () => {
        if (isSubscribed) {
          setIsConnected(true);
          setConnectionMethod("server");
        }
      };

      eventSource.addEventListener("init", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (isSubscribed) {
            handleRemoteStateUpdate(data);
            if (data.peerCount) {
              setPeerCount(data.peerCount);
            }
          }
        } catch {
          // ignore
        }
      });

      eventSource.addEventListener("state_update", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (isSubscribed) {
            handleRemoteStateUpdate(data);
          }
        } catch {
          // ignore
        }
      });

      eventSource.addEventListener("peer_count", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (isSubscribed && typeof data.count === "number") {
            setPeerCount(data.count);
          }
        } catch {
          // ignore
        }
      });

      eventSource.addEventListener("reaction", (event: MessageEvent) => {
        try {
          const reaction = JSON.parse(event.data);
          if (isSubscribed) {
            handleRemoteReaction(reaction);
          }
        } catch {
          // ignore
        }
      });
    } catch {
      // ignore SSE fail on static host
    }

    // D. Firebase RTDB (If configured by user)
    const unsubFirebase = subscribeFirebaseRoom(roomId, (fbState) => {
      if (isSubscribed && fbState) {
        handleRemoteStateUpdate(fbState);
        setConnectionMethod("firebase");
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
      if (webrtcManagerRef.current) {
        webrtcManagerRef.current.destroy();
        webrtcManagerRef.current = null;
      }
      if (publicRelayRef.current) {
        publicRelayRef.current.destroy();
        publicRelayRef.current = null;
      }
    };
  }, [roomId, role]);

  // Update room state (Used by Speaker or Listener)
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

      // 1. Broadcast via WebRTC P2P
      if (webrtcManagerRef.current) {
        try {
          webrtcManagerRef.current.broadcastState(nextState);
        } catch {
          // ignore
        }
      }

      // 2. Broadcast via Public WebSocket Relay
      if (publicRelayRef.current) {
        try {
          publicRelayRef.current.broadcast(nextState);
        } catch {
          // ignore
        }
      }

      // 3. Broadcast to other tabs on the same computer
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

      // 4. Sync with Firebase RTDB if configured
      if (getStoredFirebaseConfig()) {
        updateFirebaseRoom(roomId, nextState);
      }

      // 5. Sync to Node.js Backend API if available
      const customBackend = getStoredBackendUrl();
      const apiEndpoint = `${customBackend || ""}/api/rooms/${encodeURIComponent(roomId)}/update`;

      const sendToServer = () => {
        fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nextState),
        }).catch(() => {
          // quiet catch for static hosting
        });
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
        debounceTimerRef.current = setTimeout(sendToServer, 50);
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

      // WebRTC P2P
      if (webrtcManagerRef.current) {
        webrtcManagerRef.current.sendReaction(reactionPayload);
      }

      // Public Relay
      if (publicRelayRef.current) {
        publicRelayRef.current.sendReaction(reactionPayload);
      }

      // Broadcast channel
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

      const customBackend = getStoredBackendUrl();
      const apiEndpoint = `${customBackend || ""}/api/rooms/${encodeURIComponent(roomId)}/reaction`;

      try {
        await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, sender: senderName }),
        });
      } catch {
        // quiet catch
      }
    },
    [roomId]
  );

  return {
    state,
    peerCount,
    isConnected,
    connectionMethod,
    incomingReaction,
    updateEmotion,
    sendReaction,
    clearReaction: () => setIncomingReaction(null),
  };
}
