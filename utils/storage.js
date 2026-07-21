// utils/storage.js
// Reusable AsyncStorage helpers for flashcard progress, quiz scores, and streak tracking.

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Storage keys ─────────────────────────────────────────────────────────────

const FLASHCARD_KEY = (deckId) => `flashcard_progress_${deckId}`;
const QUIZ_KEY      = (deckId) => `quiz_scores_${deckId}`;
const STREAK_KEY    = 'streak';

export const MAX_STREAK_FREEZES = 2;
const FREEZE_MILESTONE_INTERVAL = 7; // earn 1 freeze every 7-day streak milestone

// ─── Date helpers ─────────────────────────────────────────────────────────────

// Returns today's date as a 'YYYY-MM-DD' string (local time)
function getToday() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Whole calendar days between two 'YYYY-MM-DD' strings (b - a).
function daysBetween(dateStrA, dateStrB) {
  const a = new Date(`${dateStrA}T00:00:00`);
  const b = new Date(`${dateStrB}T00:00:00`);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

// ─── Flashcard Progress ───────────────────────────────────────────────────────

/**
 * Save the user's mastery marks for a flashcard deck.
 * @param {string} deckId  - e.g. 'greetings'
 * @param {Set<number>} known         - indices the user marked "I know this"
 * @param {Set<number>} stillLearning - indices the user marked "Still learning"
 */
export async function saveFlashcardProgress(deckId, known, stillLearning) {
  const data = {
    known:         [...known],
    stillLearning: [...stillLearning],
  };
  await AsyncStorage.setItem(FLASHCARD_KEY(deckId), JSON.stringify(data));
}

/**
 * Load saved mastery marks for a flashcard deck.
 * Returns Sets of card indices.
 * If no saved data exists, returns empty Sets.
 */
export async function loadFlashcardProgress(deckId) {
  try {
    const raw = await AsyncStorage.getItem(FLASHCARD_KEY(deckId));
    if (!raw) return { known: new Set(), stillLearning: new Set() };
    const { known, stillLearning } = JSON.parse(raw);
    return {
      known:         new Set(known),
      stillLearning: new Set(stillLearning),
    };
  } catch {
    return { known: new Set(), stillLearning: new Set() };
  }
}

// ─── Quiz Scores ──────────────────────────────────────────────────────────────

/**
 * Save a quiz result. Automatically updates the best score if the new score is higher.
 * Returns the updated score data object.
 * @param {string} deckId
 * @param {number} score         - number of correct answers this session
 * @param {number} totalQuestions
 */
export async function saveQuizScore(deckId, score, totalQuestions) {
  const existing = await loadQuizScores(deckId);
  const bestScore = Math.max(existing.bestScore ?? 0, score);
  const data = { lastScore: score, bestScore, totalQuestions };
  await AsyncStorage.setItem(QUIZ_KEY(deckId), JSON.stringify(data));
  return data;
}

/**
 * Load saved quiz scores for a deck.
 * Returns { lastScore, bestScore, totalQuestions } — all null if no data saved yet.
 */
export async function loadQuizScores(deckId) {
  try {
    const raw = await AsyncStorage.getItem(QUIZ_KEY(deckId));
    if (!raw) return { lastScore: null, bestScore: null, totalQuestions: null };
    return JSON.parse(raw);
  } catch {
    return { lastScore: null, bestScore: null, totalQuestions: null };
  }
}

// ─── Streak ───────────────────────────────────────────────────────────────────

/**
 * Load the current streak data.
 * Returns { count, lastActiveDate, freezesAvailable, freezeMilestone } —
 * count/freezes are 0 and date is null if no streak saved yet.
 */
export async function loadStreak() {
  const defaults = { count: 0, lastActiveDate: null, freezesAvailable: 0, freezeMilestone: 0 };
  try {
    const raw = await AsyncStorage.getItem(STREAK_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

/**
 * Call this when the user completes a quiz or flashcard session.
 * - Same day as last active → no change (streak already counted today)
 * - Consecutive day → streak + 1
 * - Gap of missed days → each missed day consumes one streak freeze (if held);
 *   if freezes don't cover the whole gap, they're used up anyway and streak resets to 1
 * - Every FREEZE_MILESTONE_INTERVAL-day milestone reached awards 1 freeze, up to MAX_STREAK_FREEZES held
 *
 * Returns the updated { count, lastActiveDate, freezesAvailable, freezeMilestone }
 * plus { freezeUsed, freezesConsumed, freezeEarned } describing what happened this call.
 */
export async function updateStreak() {
  const today  = getToday();
  const streak = await loadStreak();

  // Already counted today — return unchanged
  if (streak.lastActiveDate === today) {
    return { ...streak, freezeUsed: false, freezesConsumed: 0, freezeEarned: 0 };
  }

  let newCount;
  let freezeUsed = false;
  let freezesConsumed = 0;
  let freezesAvailable = streak.freezesAvailable;

  if (!streak.lastActiveDate) {
    newCount = 1; // first ever session
  } else {
    const missedDays = daysBetween(streak.lastActiveDate, today) - 1;

    if (missedDays <= 0) {
      newCount = streak.count + 1; // consecutive day
    } else if (missedDays <= freezesAvailable) {
      // Freezes cover every missed day — streak survives intact
      freezesConsumed = missedDays;
      freezesAvailable -= freezesConsumed;
      freezeUsed = true;
      newCount = streak.count + 1;
    } else {
      // Not enough freezes to cover the gap — they still get used up, streak resets
      freezesConsumed = freezesAvailable;
      freezeUsed = freezesConsumed > 0;
      freezesAvailable = 0;
      newCount = 1;
    }
  }

  // Award a freeze at every milestone crossed, capped at MAX_STREAK_FREEZES held
  let freezeMilestone = streak.freezeMilestone;
  let freezeEarned = 0;
  while (newCount >= freezeMilestone + FREEZE_MILESTONE_INTERVAL) {
    freezeMilestone += FREEZE_MILESTONE_INTERVAL;
    if (freezesAvailable < MAX_STREAK_FREEZES) {
      freezesAvailable += 1;
      freezeEarned += 1;
    }
  }

  const updated = { count: newCount, lastActiveDate: today, freezesAvailable, freezeMilestone };
  await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(updated));
  return { ...updated, freezeUsed, freezesConsumed, freezeEarned };
}
