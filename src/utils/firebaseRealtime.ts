import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getDatabase, ref, set, onValue, off, Database } from "firebase/database";
import { EmotionState, FirebaseConfigOptions } from "../types";

const FIREBASE_CONFIG_STORAGE_KEY = "emotion_slider_firebase_config";

let activeApp: FirebaseApp | null = null;
let activeDb: Database | null = null;

export function getStoredFirebaseConfig(): FirebaseConfigOptions | null {
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveFirebaseConfig(config: FirebaseConfigOptions | null) {
  if (!config) {
    localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
    activeApp = null;
    activeDb = null;
    return;
  }
  localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
  initFirebaseRTDB(config);
}

export function initFirebaseRTDB(config?: FirebaseConfigOptions | null): Database | null {
  const cfg = config || getStoredFirebaseConfig();
  if (!cfg || !cfg.databaseURL) {
    return null;
  }

  try {
    const apps = getApps();
    if (apps.length === 0) {
      activeApp = initializeApp(cfg);
    } else {
      activeApp = apps[0];
    }
    activeDb = getDatabase(activeApp);
    return activeDb;
  } catch (err) {
    console.warn("Firebase RTDB init error:", err);
    return null;
  }
}

export function subscribeFirebaseRoom(
  roomId: string,
  onUpdate: (state: EmotionState) => void
): (() => void) | null {
  const db = activeDb || initFirebaseRTDB();
  if (!db) return null;

  try {
    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        onUpdate(data);
      }
    });

    return () => {
      off(roomRef);
    };
  } catch (err) {
    console.warn("Firebase subscription error:", err);
    return null;
  }
}

export async function updateFirebaseRoom(roomId: string, state: EmotionState): Promise<boolean> {
  const db = activeDb || initFirebaseRTDB();
  if (!db) return false;

  try {
    const roomRef = ref(db, `rooms/${roomId}`);
    await set(roomRef, state);
    return true;
  } catch (err) {
    console.warn("Firebase write error:", err);
    return false;
  }
}
