import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface RoomState {
  value: number; // 0 - 100
  note: string;
  tag: string;
  selectedEmotions?: string[];
  customGuidance?: string;
  isAdjusting: boolean;
  updatedAt: number;
  lastReaction?: {
    id: string;
    text: string;
    sender: string;
    timestamp: number;
  };
}

interface ClientConnection {
  res: express.Response;
  role: string;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory room storage & active SSE clients
const rooms = new Map<string, RoomState>();
const roomClients = new Map<string, Set<ClientConnection>>();

function getOrCreateRoom(roomId: string): RoomState {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      value: 50,
      note: "",
      tag: "平穩",
      isAdjusting: false,
      updatedAt: Date.now(),
    });
  }
  return rooms.get(roomId)!;
}

function broadcastToRoom(roomId: string, eventName: string, data: any) {
  const clients = roomClients.get(roomId);
  if (!clients || clients.size === 0) return;
  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try {
      client.res.write(payload);
    } catch {
      clients.delete(client);
    }
  }
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", activeRooms: rooms.size });
});

// Get room details
app.get("/api/rooms/:roomId", (req, res) => {
  const { roomId } = req.params;
  const room = getOrCreateRoom(roomId);
  const clients = roomClients.get(roomId);
  const totalPeers = clients ? clients.size : 0;
  res.json({ ...room, peerCount: totalPeers });
});

// Update room emotion state
app.post("/api/rooms/:roomId/update", (req, res) => {
  const { roomId } = req.params;
  const { value, note, tag, selectedEmotions, customGuidance, isAdjusting } = req.body;
  const room = getOrCreateRoom(roomId);

  if (typeof value === "number") {
    room.value = Math.max(0, Math.min(100, Math.round(value)));
  }
  if (typeof note === "string") {
    room.note = note.slice(0, 300);
  }
  if (typeof tag === "string") {
    room.tag = tag.slice(0, 50);
  }
  if (Array.isArray(selectedEmotions)) {
    room.selectedEmotions = selectedEmotions.slice(0, 10);
  }
  if (typeof customGuidance === "string") {
    room.customGuidance = customGuidance.slice(0, 1000);
  }
  if (typeof isAdjusting === "boolean") {
    room.isAdjusting = isAdjusting;
  }
  room.updatedAt = Date.now();

  broadcastToRoom(roomId, "state_update", room);
  res.json({ success: true, state: room });
});

// Send reaction from Listener to Speaker
app.post("/api/rooms/:roomId/reaction", (req, res) => {
  const { roomId } = req.params;
  const { text, sender } = req.body;
  const room = getOrCreateRoom(roomId);

  const reaction = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    text: String(text || "我在這裡傾聽").slice(0, 50),
    sender: String(sender || "陪伴者").slice(0, 30),
    timestamp: Date.now(),
  };

  room.lastReaction = reaction;
  broadcastToRoom(roomId, "reaction", reaction);
  res.json({ success: true, reaction });
});

// Server-Sent Events (SSE) stream for real-time room sync
app.get("/api/rooms/:roomId/events", (req, res) => {
  const { roomId } = req.params;
  const role = String(req.query.role || "viewer");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const connection: ClientConnection = { res, role };

  if (!roomClients.has(roomId)) {
    roomClients.set(roomId, new Set());
  }
  const clients = roomClients.get(roomId)!;
  clients.add(connection);

  const currentRoom = getOrCreateRoom(roomId);
  // Send initial state & peer connection event
  res.write(`event: init\ndata: ${JSON.stringify({ ...currentRoom, peerCount: clients.size })}\n\n`);
  broadcastToRoom(roomId, "peer_count", { count: clients.size });

  // Keep-alive heartbeat every 15 seconds
  const heartbeatTimer = setInterval(() => {
    try {
      res.write(": heartbeat\n\n");
    } catch {
      clearInterval(heartbeatTimer);
    }
  }, 15000);

  req.on("close", () => {
    clearInterval(heartbeatTimer);
    clients.delete(connection);
    if (clients.size === 0) {
      roomClients.delete(roomId);
    } else {
      broadcastToRoom(roomId, "peer_count", { count: clients.size });
    }
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Emotion Slider Server running on http://localhost:${PORT}`);
  });
}

startServer();
