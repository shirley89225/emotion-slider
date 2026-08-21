import { EmotionState, ReactionMessage } from "../types";

/**
 * Public WebSocket / Relay Fallback for Instant Cross-Device Sync
 * Works without any registration or keys.
 */
export class PublicWebSocketRelay {
  private ws: WebSocket | null = null;
  private roomId: string = "";
  private onStateCallback?: (state: EmotionState) => void;
  private onReactionCallback?: (reaction: ReactionMessage) => void;
  private isDestroyed: boolean = false;
  private reconnectTimer: any = null;

  constructor(
    roomId: string,
    onState: (state: EmotionState) => void,
    onReaction?: (reaction: ReactionMessage) => void
  ) {
    this.roomId = roomId.toUpperCase().trim();
    this.onStateCallback = onState;
    this.onReactionCallback = onReaction;
    this.connect();
  }

  private connect() {
    if (typeof window === "undefined" || this.isDestroyed) return;

    // Use PieSocket / Public Open Echo Relay or Broadcast
    const channelId = `emotion_slider_${this.roomId.toLowerCase()}`;
    const url = `wss://free.blr2.piesocket.com/v3/${encodeURIComponent(channelId)}?api_key=VC3retWQBnoFtYsACekioQK52egUsDxOXNuQIpmRtA&notify_self=0`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "STATE_UPDATE" && data.payload && this.onStateCallback) {
            this.onStateCallback(data.payload);
          } else if (data.type === "REACTION" && data.payload && this.onReactionCallback) {
            this.onReactionCallback(data.payload);
          }
        } catch {
          // ignore non-json messages
        }
      };

      this.ws.onclose = () => {
        if (!this.isDestroyed) {
          this.reconnectTimer = setTimeout(() => this.connect(), 4000);
        }
      };

      this.ws.onerror = () => {
        try {
          this.ws?.close();
        } catch {
          // ignore
        }
      };
    } catch {
      // ignore
    }
  }

  public broadcast(state: EmotionState) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: "STATE_UPDATE", payload: state }));
      } catch {
        // ignore
      }
    }
  }

  public sendReaction(reaction: ReactionMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: "REACTION", payload: reaction }));
      } catch {
        // ignore
      }
    }
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // ignore
      }
    }
    this.ws = null;
  }
}
