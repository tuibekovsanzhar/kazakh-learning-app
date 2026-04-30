import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// ─── Badge definitions ────────────────────────────────────────────────────────
// titleKey and descKey reference i18n keys in utils/i18n.js

export const BADGES = [
  // First steps
  { id: 'first_lesson',       icon: '🌱', titleKey: 'bdg_first_lesson',       descKey: 'bdg_first_lesson_d' },
  { id: 'quiz_rookie',        icon: '🎯', titleKey: 'bdg_quiz_rookie',        descKey: 'bdg_quiz_rookie_d' },
  { id: 'flashcard_fan',      icon: '📚', titleKey: 'bdg_flashcard_fan',      descKey: 'bdg_flashcard_fan_d' },
  // Streaks
  { id: 'streak_3',           icon: '🔥', titleKey: 'bdg_streak_3',           descKey: 'bdg_streak_3_d' },
  { id: 'streak_7',           icon: '🔥', titleKey: 'bdg_streak_7',           descKey: 'bdg_streak_7_d' },
  { id: 'streak_30',          icon: '👑', titleKey: 'bdg_streak_30',          descKey: 'bdg_streak_30_d' },
  // XP & levels
  { id: 'level_2',            icon: '⭐', titleKey: 'bdg_level_2',            descKey: 'bdg_level_2_d' },
  { id: 'level_5',            icon: '🌟', titleKey: 'bdg_level_5',            descKey: 'bdg_level_5_d' },
  { id: 'level_10',           icon: '💎', titleKey: 'bdg_level_10',           descKey: 'bdg_level_10_d' },
  { id: 'xp_1000',            icon: '💰', titleKey: 'bdg_xp_1000',            descKey: 'bdg_xp_1000_d' },
  // Quiz performance
  { id: 'perfect_score',      icon: '💯', titleKey: 'bdg_perfect_score',      descKey: 'bdg_perfect_score_d' },
  { id: 'quiz_master',        icon: '🏆', titleKey: 'bdg_quiz_master',        descKey: 'bdg_quiz_master_d' },
  // Vocabulary
  { id: 'word_collector',     icon: '📖', titleKey: 'bdg_word_collector',     descKey: 'bdg_word_collector_d' },
  { id: 'century',            icon: '🎖️', titleKey: 'bdg_century',            descKey: 'bdg_century_d' },
  // Alphabet
  { id: 'alphabet_explorer',  icon: '🔤', titleKey: 'bdg_alphabet_explorer',  descKey: 'bdg_alphabet_explorer_d' },
];

// ─── Firestore helpers ────────────────────────────────────────────────────────
// Path: users/{uid}/achievements/data
// Shape: { unlockedIds: { [id]: isoTimestamp }, quizzesCompleted: number }

export async function loadAchievements(userId) {
  if (!userId) return { unlockedIds: {}, quizzesCompleted: 0 };
  try {
    const ref = doc(db, 'users', userId, 'achievements', 'data');
    const snap = await getDoc(ref);
    if (!snap.exists()) return { unlockedIds: {}, quizzesCompleted: 0 };
    const d = snap.data();
    return {
      unlockedIds: d.unlockedIds ?? {},
      quizzesCompleted: d.quizzesCompleted ?? 0,
    };
  } catch {
    return { unlockedIds: {}, quizzesCompleted: 0 };
  }
}

export async function saveAchievements(userId, data) {
  if (!userId) return;
  try {
    const ref = doc(db, 'users', userId, 'achievements', 'data');
    await setDoc(ref, data, { merge: true });
  } catch {}
}

// ─── Check and unlock achievements ───────────────────────────────────────────
//
// context fields (all optional):
//   completedQuiz    boolean  — a quiz was just finished
//   isPerfectScore   boolean  — that quiz was 10/10
//   gameStats        object   — current { totalXP, level } after XP award
//   streakCount      number   — current day streak
//   totalMastered    number   — total words mastered across all flashcard decks
//   isFirstLesson    boolean  — a vocabulary screen was just opened
//   isAlphabetOpened boolean  — alphabet screen was just opened
//   isFirstFlashcard boolean  — a flashcard deck was just completed
//
// Returns: array of newly unlocked Badge objects (to show in the modal)

export async function checkAndUnlockAchievements(userId, context = {}) {
  const data = await loadAchievements(userId);
  let { unlockedIds, quizzesCompleted } = data;

  const {
    completedQuiz    = false,
    isPerfectScore   = false,
    gameStats        = null,
    streakCount      = 0,
    totalMastered    = 0,
    isFirstLesson    = false,
    isAlphabetOpened = false,
    isFirstFlashcard = false,
  } = context;

  // Increment counters FIRST so badge conditions see the updated values
  if (completedQuiz) quizzesCompleted += 1;

  const conditions = {
    first_lesson:       isFirstLesson,
    quiz_rookie:        quizzesCompleted >= 1,
    flashcard_fan:      isFirstFlashcard,
    streak_3:           streakCount >= 3,
    streak_7:           streakCount >= 7,
    streak_30:          streakCount >= 30,
    level_2:            (gameStats?.level ?? 0) >= 2,
    level_5:            (gameStats?.level ?? 0) >= 5,
    level_10:           (gameStats?.level ?? 0) >= 10,
    xp_1000:            (gameStats?.totalXP ?? 0) >= 1000,
    perfect_score:      isPerfectScore,
    quiz_master:        quizzesCompleted >= 10,
    word_collector:     totalMastered >= 50,
    century:            totalMastered >= 100,
    alphabet_explorer:  isAlphabetOpened,
  };

  const newBadges = [];
  const newUnlocked = { ...unlockedIds };

  for (const badge of BADGES) {
    if (!newUnlocked[badge.id] && conditions[badge.id]) {
      newUnlocked[badge.id] = new Date().toISOString();
      newBadges.push(badge);
    }
  }

  const changed = newBadges.length > 0 || completedQuiz;
  if (changed) {
    await saveAchievements(userId, { unlockedIds: newUnlocked, quizzesCompleted });
  }

  return newBadges;
}
