// utils/storage.js
// Reusable AsyncStorage helpers for flashcard progress, quiz scores, and streak tracking.

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Storage keys ─────────────────────────────────────────────────────────────

const FLASHCARD_KEY = (deckId) => `flashcard_progress_${deckId}`;
const QUIZ_KEY      = (deckId) => `quiz_scores_${deckId}`;
const STREAK_KEY    = 'streak';

// ─── Date helpers ─────────────────────────────────────────────────────────────

// Returns today's date as a 'YYYY-MM-DD' string (local time)
function getToday() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Returns yesterday's date as a 'YYYY-MM-DD' string
function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
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
 * Returns { count, lastActiveDate } — count is 0 and date is null if no streak saved.
 */
export async function loadStreak() {
  try {
    const raw = await AsyncStorage.getItem(STREAK_KEY);
    if (!raw) return { count: 0, lastActiveDate: null };
    return JSON.parse(raw);
  } catch {
    return { count: 0, lastActiveDate: null };
  }
}

/**
 * Call this when the user completes a quiz or flashcard session.
 * - Same day as last active → no change (streak already counted today)
 * - Consecutive day → streak + 1
 * - Gap of 2+ days → reset to 1
 * Returns the updated { count, lastActiveDate }.
 */
export async function updateStreak() {
  const today     = getToday();
  const yesterday = getYesterday();
  const streak    = await loadStreak();

  // Already counted today — return unchanged
  if (streak.lastActiveDate === today) return streak;

  const newCount = streak.lastActiveDate === yesterday
    ? (streak.count || 0) + 1  // consecutive day
    : 1;                        // gap or first time

  const updated = { count: newCount, lastActiveDate: today };
  await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(updated));
  return updated;
}
