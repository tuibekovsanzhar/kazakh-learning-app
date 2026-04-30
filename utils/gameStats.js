import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const MAX_HEARTS = 5;
const HEART_REGEN_MS = 20 * 60 * 1000; // 20 minutes
const XP_PER_CORRECT = 10;
const XP_PER_QUIZ_BONUS = 50;

// XP required to reach each level (index = level - 1)
export const LEVEL_THRESHOLDS = [0, 500, 1000, 1500, 2500, 4000, 6000, 9000, 13000, 20000];

function xpToLevel(xp) {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return Math.min(level, LEVEL_THRESHOLDS.length);
}

/** XP threshold for the NEXT level after `currentLevel`. Returns null at max level. */
export function nextLevelThreshold(currentLevel) {
  return LEVEL_THRESHOLDS[currentLevel] ?? null;
}

const STORAGE_KEY = 'gameStats';

// ─── Local cache helpers ──────────────────────────────────────────────────────

async function readLocal() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function writeLocal(stats) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

// ─── Default stats object ─────────────────────────────────────────────────────

function defaultStats() {
  return {
    hearts: MAX_HEARTS,
    lastHeartLost: null, // ISO string or null
    totalXP: 0,
    level: 1,
  };
}

// ─── Heart regeneration ───────────────────────────────────────────────────────

/**
 * Given a stats object, compute how many hearts have regenerated since
 * lastHeartLost and return an updated stats object (not yet saved).
 */
export function applyRegen(stats) {
  if (stats.hearts >= MAX_HEARTS || !stats.lastHeartLost) return stats;

  const now = Date.now();
  const elapsed = now - new Date(stats.lastHeartLost).getTime();
  const heartsToAdd = Math.floor(elapsed / HEART_REGEN_MS);

  if (heartsToAdd <= 0) return stats;

  const newHearts = Math.min(MAX_HEARTS, stats.hearts + heartsToAdd);
  // Move lastHeartLost forward by the consumed regen intervals
  const consumed = heartsToAdd * HEART_REGEN_MS;
  const newLastLost = newHearts >= MAX_HEARTS
    ? null
    : new Date(new Date(stats.lastHeartLost).getTime() + consumed).toISOString();

  return { ...stats, hearts: newHearts, lastHeartLost: newLastLost };
}

/**
 * Milliseconds until the next heart regenerates.
 * Returns 0 if already full.
 */
export function msUntilNextHeart(stats) {
  if (stats.hearts >= MAX_HEARTS || !stats.lastHeartLost) return 0;
  const elapsed = Date.now() - new Date(stats.lastHeartLost).getTime();
  return Math.max(0, HEART_REGEN_MS - (elapsed % HEART_REGEN_MS));
}

// ─── Load ─────────────────────────────────────────────────────────────────────

export async function loadGameStats(userId) {
  let stats = defaultStats();

  // Try Firestore first
  if (userId) {
    try {
      const ref = doc(db, 'users', userId, 'gameStats', 'data');
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const d = snap.data();
        stats = {
          hearts: d.hearts ?? MAX_HEARTS,
          lastHeartLost: d.lastHeartLost?.toDate?.()?.toISOString() ?? d.lastHeartLost ?? null,
          totalXP: d.totalXP ?? 0,
          level: d.level ?? 1,
        };
      }
    } catch {
      // fall through to local
      const local = await readLocal();
      if (local) stats = local;
    }
  } else {
    const local = await readLocal();
    if (local) stats = local;
  }

  // Apply any regen that happened since last save
  const updated = applyRegen(stats);
  await writeLocal(updated);
  return updated;
}

// ─── Save ─────────────────────────────────────────────────────────────────────

export async function saveGameStats(userId, stats) {
  await writeLocal(stats);
  if (!userId) return;
  try {
    const ref = doc(db, 'users', userId, 'gameStats', 'data');
    await setDoc(ref, {
      hearts: stats.hearts,
      lastHeartLost: stats.lastHeartLost,
      totalXP: stats.totalXP,
      level: stats.level,
    }, { merge: true });
  } catch {
    // local already saved, ignore Firestore error
  }
}

// ─── Lose a heart ─────────────────────────────────────────────────────────────

export function loseHeart(stats) {
  const newHearts = Math.max(0, stats.hearts - 1);
  const lastHeartLost = newHearts < MAX_HEARTS ? new Date().toISOString() : stats.lastHeartLost;
  return { ...stats, hearts: newHearts, lastHeartLost };
}

// ─── Gain XP ──────────────────────────────────────────────────────────────────

export function gainXP(stats, amount) {
  const newXP = stats.totalXP + amount;
  const newLevel = xpToLevel(newXP);
  return { ...stats, totalXP: newXP, level: newLevel };
}

export { XP_PER_CORRECT, XP_PER_QUIZ_BONUS };
