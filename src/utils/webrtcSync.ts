import Peer, { DataConnection } from "peerjs";
import { EmotionState, ReactionMessage } from "../types";

export type WebRTCConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export class WebRTCRoomManager {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private roomId: string = "";
  private role: "speaker" | "listener" = "speaker";
  private onStateCallback?: (state: EmotionState) => void;
  private onReactionCallback?: (reaction: ReactionMessage) => void;
  private onStatusChangeCallback?: (status: WebRTCConnectionStatus, peerCount: number) => void;
  private retryTimer: any = null;
  private isDestroyed: boolean = false;

  constructor(
    roomId: string,
    role: "speaker" | "listener",
    onState: (state: EmotionState) => void,
    onReaction?: (reaction: ReactionMessage) => void,
    onStatusChange?: (status: WebRTCConnectionStatus, peerCount: number) => void
  ) {
    this.roomId = roomId.toUpperCase().trim();
    this.role = role;
    this.onStateCallback = onState;
    this.onReactionCallback = onReaction;
    this.onStatusChangeCallback = onStatusChange;

    this.init();
  }

  private getSpeakerPeerId(): string {
    return `emoslider-${this.roomId}-speaker`.toLowerCase();
  }

  private init() {
    if (typeof window === "undefined") return;

    this.notifyStatus("connecting", 0);

    try {
      if (this.role === "speaker") {
        // Speaker creates authoritative peer ID
        const myPeerId = this.getSpeakerPeerId();
        this.peer = new Peer(myPeerId, {
          debug: 0,
        });

        this.peer.on("open", () => {
          if (this.isDestroyed) return;
          this.notifyStatus("connected", this.connections.size + 1);
        });

        this.peer.on("connection", (conn) => {
          this.setupConnection(conn);
        });

        this.peer.on("error", (err: any) => {
          if (err.type === "unavailable-id") {
            // Another speaker tab is open, connect with fallback ID
            const fallbackId = `${myPeerId}-${Math.random().toString(36).substr(2, 4)}`;
            this.peer?.destroy();
            this.peer = new Peer(fallbackId, { debug: 0 });
            this.peer.on("open", () => this.notifyStatus("connected", 1));
            this.peer.on("connection", (conn) => this.setupConnection(conn));
          } else {
            console.warn("PeerJS speaker error:", err);
            this.notifyStatus("error", 0);
          }
        });
      } else {
        // Listener creates random listener ID and connects to Speaker
        const listenerId = `emoslider-${this.roomId}-lis-${Math.random().toString(36).substr(2, 6)}`;
        this.peer = new Peer(listenerId, {
          debug: 0,
        });

        this.peer.on("open", () => {
          if (this.isDestroyed) return;
          this.connectToSpeaker();
        });

        this.peer.on("error", (err: any) => {
          console.warn("PeerJS listener error:", err);
          this.notifyStatus("error", 0);
        });
      }
    } catch (err) {
      console.warn("PeerJS init failed:", err);
      this.notifyStatus("error", 0);
    }
  }

  private connectToSpeaker() {
    if (!this.peer || this.peer.destroyed || this.isDestroyed) return;

    const speakerPeerId = this.getSpeakerPeerId();
    const conn = this.peer.connect(speakerPeerId, {
      reliable: true,
    });

    this.setupConnection(conn);

    // If speaker is not online yet, retry connecting
    conn.on("error", () => {
      this.scheduleRetry();
    });
  }

  private scheduleRetry() {
    if (this.isDestroyed || this.role !== "listener") return;
    if (this.retryTimer) clearTimeout(this.retryTimer);

    this.notifyStatus("connecting", 0);
    this.retryTimer = setTimeout(() => {
      if (!this.isDestroyed && this.connections.size === 0) {
        this.connectToSpeaker();
      }
    }, 3500);
  }

  private setupConnection(conn: DataConnection) {
    conn.on("open", () => {
      if (this.isDestroyed) return;
      this.connections.set(conn.peer, conn);
      this.notifyStatus("connected", this.connections.size + 1);

      // Listener request state or ping
      conn.send({ type: "PING", role: this.role });
    });

    conn.on("data", (data: any) => {
      if (!data || typeof data !== "object") return;

      if (data.type === "STATE_UPDATE" && data.payload) {
        if (this.onStateCallback) {
          this.onStateCallback(data.payload);
        }
      } else if (data.type === "REACTION" && data.payload) {
        if (this.onReactionCallback) {
          this.onReactionCallback(data.payload);
        }
      } else if (data.type === "PING" && this.role === "speaker") {
        // Speaker responds with connected count
        this.notifyStatus("connected", this.connections.size + 1);
      }
    });

    conn.on("close", () => {
      this.connections.delete(conn.peer);
      this.notifyStatus(
        this.connections.size > 0 ? "connected" : "connecting",
        this.connections.size + 1
      );
      if (this.role === "listener") {
        this.scheduleRetry();
      }
    });

    conn.on("error", () => {
      this.connections.delete(conn.peer);
      if (this.role === "listener") {
        this.scheduleRetry();
      }
    });
  }

  public broadcastState(state: EmotionState) {
    const msg = { type: "STATE_UPDATE", payload: state };
    this.connections.forEach((conn) => {
      if (conn.open) {
        try {
          conn.send(msg);
        } catch {
          // ignore
        }
      }
    });
  }

  public sendReaction(reaction: ReactionMessage) {
    const msg = { type: "REACTION", payload: reaction };
    this.connections.forEach((conn) => {
      if (conn.open) {
        try {
          conn.send(msg);
        } catch {
          // ignore
        }
      }
    });
  }

  private notifyStatus(status: WebRTCConnectionStatus, peerCount: number) {
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status, peerCount);
    }
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
    this.connections.forEach((conn) => {
      try {
        conn.close();
      } catch {
        // ignore
      }
    });
    this.connections.clear();
    if (this.peer && !this.peer.destroyed) {
      try {
        this.peer.destroy();
      } catch {
        // ignore
      }
    }
    this.peer = null;
  }
}
