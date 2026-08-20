export type UserRole = "speaker" | "listener" | "none";

export interface EmotionState {
  value: number; // 0 to 100
  note: string;
  tag: string;
  selectedEmotions?: string[]; // Mood Meter emotion words
  customGuidance?: string; // Listener customizable notes & guidance
  isAdjusting: boolean;
  updatedAt: number;
  lastReaction?: ReactionMessage;
}

export interface EmotionHistoryEntry {
  id: string;
  timestamp: number;
  value: number;
  note?: string;
  selectedEmotions?: string[];
  isCheckInPrompt?: boolean;
}

export interface ReactionMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
}

export interface RoomMeta {
  roomId: string;
  peerCount: number;
  role: UserRole;
  isFirebaseActive?: boolean;
}

export interface EmotionStatusDefinition {
  range: [number, number];
  label: string;
  englishLabel: string;
  description: string;
  counselingAdvice: string;
  suggestedAction: string;
  suggestedTags: string[];
  pulseSpeed: number; // in seconds
}

export interface FirebaseConfigOptions {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}
