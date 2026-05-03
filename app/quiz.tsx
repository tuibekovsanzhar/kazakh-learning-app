// app/quiz.tsx
// Quiz screen with hearts, XP, animated feedback bar, animated progress bar.

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '../utils/i18n';
import { greetings }   from '../data/greetings';
import { numbers }     from '../data/numbers';
import { colors }      from '../data/colors';
import { familyWords } from '../data/family';
import { foodWords }   from '../data/food';
import { animalWords } from '../data/animals';
import { saveQuizScore, loadQuizScores, updateStreak } from '../utils/storage';
import { auth } from '../utils/firebase';
import { saveProgress, loadProgress } from '../utils/firestore';
import {
  loadGameStats,
  saveGameStats,
  loseHeart,
  gainXP,
  msUntilNextHeart,
  applyRegen,
  MAX_HEARTS,
  XP_PER_CORRECT,
  XP_PER_QUIZ_BONUS,
} from '../utils/gameStats';
import { checkAndUnlockAchievements } from '../utils/achievements';
import LevelUpOverlay from '../components/LevelUpOverlay';
import BadgeModal from '../components/BadgeModal';

// ─── Types ────────────────────────────────────────────────────────────────────

type QuizCard = {
  kazakh: string;
  latin?: string;
  english: string;
  russian?: string;
};

type Question = {
  kazakh: string;
  latin?: string;
  correctAnswer: string;
  choices: string[];
};

type GameStats = {
  hearts: number;
  lastHeartLost: string | null;
  totalXP: number;
  level: number;
};

const DECK_EMOJIS: Record<string, string> = {
  greetings: '👋',
  numbers:   '🔢',
  colors:    '🎨',
  family:    '👨‍👩‍👧',
  food:      '🍽️',
  animals:   '🐴',
};

// ─── Data normalization ────────────────────────────────────────────────────────

function normalizeDeck(deckId: string): QuizCard[] {
  switch (deckId) {
    case 'greetings': return greetings.map((w) => ({ kazakh: w.kazakh, latin: w.latin, english: w.english, russian: w.russian }));
    case 'numbers':   return numbers.map((w) => ({ kazakh: w.cyrillic, latin: w.latin, english: w.english, russian: w.russian }));
    case 'colors':    return colors.map((w) => ({ kazakh: w.cyrillic, latin: w.latin, english: w.english, russian: w.russian }));
    case 'family':    return familyWords.map((w) => ({ kazakh: w.kazakh, latin: w.latin, english: w.english, russian: w.russian }));
    case 'food':      return foodWords.map((w) => ({ kazakh: w.kazakh, latin: w.latin, english: w.english, russian: w.russian }));
    case 'animals':   return animalWords.map((w) => ({ kazakh: w.kazakh, latin: w.latin, english: w.english, russian: w.russian }));
    default:          return [];
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuiz(cards: QuizCard[], lang: string = 'en'): Question[] {
  const pool = shuffle(cards).slice(0, Math.min(10, cards.length));
  return pool.map((item) => {
    const correctAnswer = lang === 'ru' ? (item.russian ?? item.english) : item.english;
    const wrongAnswers = shuffle(
      cards
        .filter((c) => (lang === 'ru' ? (c.russian ?? c.english) : c.english) !== correctAnswer)
        .map((c) => (lang === 'ru' ? (c.russian ?? c.english) : c.english))
    ).slice(0, 3);
    return { kazakh: item.kazakh, latin: item.latin, correctAnswer, choices: shuffle([correctAnswer, ...wrongAnswers]) };
  });
}

// ─── Heart countdown hook ─────────────────────────────────────────────────────

function useHeartCountdown(stats: GameStats | null) {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!stats || stats.hearts >= MAX_HEARTS) { setCountdown(''); return; }

    const tick = () => {
      const ms = msUntilNextHeart(stats);
      if (ms <= 0) { setCountdown(''); return; }
      const totalSec = Math.ceil(ms / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      setCountdown(`${m}:${s.toString().padStart(2, '0')}`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [stats]);

  return countdown;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function QuizScreen() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { deck = 'greetings', title = 'Greetings', from } =
    useLocalSearchParams<{ deck: string; title: string; from: string }>();

  const cards = normalizeDeck(deck);

  // ── Quiz state ──────────────────────────────────────────────────────────────
  const [questions, setQuestions] = useState<Question[]>(() => buildQuiz(cards, language));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [savedScores, setSavedScores] = useState<{ lastScore: number | null; bestScore: number | null; totalQuestions: number | null }>({ lastScore: null, bestScore: null, totalQuestions: null });

  // ── Game stats ──────────────────────────────────────────────────────────────
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [sessionXP, setSessionXP] = useState(0);
  const [outOfHearts, setOutOfHearts] = useState(false);

  // ── Level-up + badge state ──────────────────────────────────────────────────
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevelAchieved, setNewLevelAchieved] = useState(1);
  // badges waiting to show (queued behind level-up screen)
  const [badgeQueue, setBadgeQueue] = useState<any[]>([]);
  // badges currently being shown in sequence
  const [activeBadges, setActiveBadges] = useState<any[]>([]);
  const [badgeIndex, setBadgeIndex] = useState(0);
  const currentBadge = activeBadges[badgeIndex] ?? null;

  // ── Animations ──────────────────────────────────────────────────────────────
  const progressAnim = useRef(new Animated.Value(0)).current;
  const feedbackSlide = useRef(new Animated.Value(120)).current;  // slides up from bottom
  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const xpFloatAnim = useRef(new Animated.Value(0)).current;
  const xpFloatOpacity = useRef(new Animated.Value(0)).current;
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [showXPFloat, setShowXPFloat] = useState(false);

  const countdown = useHeartCountdown(gameStats);

  // ── Load game stats on mount ────────────────────────────────────────────────
  useEffect(() => {
    const userId = auth.currentUser?.uid ?? null;
    loadGameStats(userId).then((stats) => {
      setGameStats(stats);
      if (stats.hearts === 0) setOutOfHearts(true);
    });
  }, []);

  // ── Rebuild questions when deck/language changes ────────────────────────────
  useEffect(() => {
    setQuestions(buildQuiz(normalizeDeck(deck), language));
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResults(false);
    setShowFeedback(false);
    setSessionXP(0);
    progressAnim.setValue(0);
  }, [deck, language]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load saved quiz scores ──────────────────────────────────────────────────
  useEffect(() => {
    loadQuizScores(deck).then(setSavedScores);
    const userId = auth.currentUser?.uid;
    if (userId) {
      loadProgress(userId).then((data) => {
        if (data?.quizBestScores?.[deck] != null) {
          setSavedScores((prev) => ({ ...prev, bestScore: data.quizBestScores[deck] }));
        }
      });
    }
  }, [deck]);

  // ── Save results, award bonus XP, check level-up, check badges ─────────────
  useEffect(() => {
    if (!showResults || !gameStats) return;

    const userId = auth.currentUser?.uid ?? null;

    // Save quiz score
    saveQuizScore(deck, score, questions.length).then((updated) => {
      setSavedScores(updated);
      if (userId) saveProgress(userId, { quizBestScores: { [deck]: updated.bestScore } });
    });
    // Await the result so we can sync the updated streak count to Firestore
    // directly — index.jsx's state may not reflect this session's increment.
    updateStreak().then((result) => {
      if (userId) saveProgress(userId, { streakCount: result.count });
    });

    // Award bonus XP and detect level-up
    const oldLevel = gameStats.level;
    const withBonus = gainXP(gameStats, XP_PER_QUIZ_BONUS);
    setGameStats(withBonus);
    setSessionXP((x) => x + XP_PER_QUIZ_BONUS);
    saveGameStats(userId, withBonus);

    const isPerfect = score === questions.length && questions.length >= 5;

    // Check achievements async — store new badges before showing overlays
    checkAndUnlockAchievements(userId, {
      completedQuiz: true,
      isPerfectScore: isPerfect,
      gameStats: withBonus,
    }).then((newBadges) => {
      const leveledUp = withBonus.level > oldLevel;
      if (leveledUp) {
        setNewLevelAchieved(withBonus.level);
        setShowLevelUp(true);
        // Badges show after level-up is dismissed
        setBadgeQueue(newBadges);
      } else {
        // Show badges immediately
        setActiveBadges(newBadges);
        setBadgeIndex(0);
      }
    });
  }, [showResults]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLevelUpDismiss = () => {
    setShowLevelUp(false);
    setActiveBadges(badgeQueue);
    setBadgeQueue([]);
    setBadgeIndex(0);
  };

  const handleBadgeDismiss = () => {
    if (badgeIndex + 1 < activeBadges.length) {
      setBadgeIndex((i) => i + 1);
    } else {
      setActiveBadges([]);
      setBadgeIndex(0);
    }
  };

  // ── Animate progress bar ────────────────────────────────────────────────────
  useEffect(() => {
    const pct = questions.length > 0 ? currentIndex / questions.length : 0;
    Animated.timing(progressAnim, {
      toValue: pct,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentIndex, questions.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Show feedback bar ───────────────────────────────────────────────────────
  const showFeedbackBar = (correct: boolean) => {
    setLastCorrect(correct);
    setShowFeedback(true);
    feedbackSlide.setValue(120);
    feedbackOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(feedbackSlide, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.timing(feedbackOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const hideFeedbackBar = () => {
    Animated.parallel([
      Animated.timing(feedbackSlide, { toValue: 120, duration: 250, useNativeDriver: true }),
      Animated.timing(feedbackOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setShowFeedback(false));
  };

  // ── XP float animation ──────────────────────────────────────────────────────
  const triggerXPFloat = () => {
    setShowXPFloat(true);
    xpFloatAnim.setValue(0);
    xpFloatOpacity.setValue(1);
    Animated.parallel([
      Animated.timing(xpFloatAnim, { toValue: -60, duration: 800, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(xpFloatOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start(() => setShowXPFloat(false));
  };

  // ── Shake animation (wrong answer) ──────────────────────────────────────────
  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
    if (Platform.OS === 'android') Vibration.vibrate(200);
  };

  // ── Answer handler ──────────────────────────────────────────────────────────
  const handleAnswer = useCallback(
    (answer: string) => {
      if (selectedAnswer !== null || !gameStats) return;

      const correct = answer === questions[currentIndex].correctAnswer;
      setSelectedAnswer(answer);

      let newStats = gameStats;

      if (correct) {
        setScore((s) => s + 1);
        newStats = gainXP(gameStats, XP_PER_CORRECT);
        setSessionXP((x) => x + XP_PER_CORRECT);
        triggerXPFloat();
      } else {
        newStats = loseHeart(gameStats);
        triggerShake();
      }

      setGameStats(newStats);
      saveGameStats(auth.currentUser?.uid ?? null, newStats);
      showFeedbackBar(correct);

      setTimeout(() => {
        hideFeedbackBar();
        setTimeout(() => {
          if (!correct && newStats.hearts === 0) {
            setOutOfHearts(true);
            return;
          }
          if (currentIndex + 1 >= questions.length) {
            setShowResults(true);
          } else {
            setCurrentIndex((i) => i + 1);
            setSelectedAnswer(null);
          }
        }, 300);
      }, 1500);
    },
    [selectedAnswer, gameStats, questions, currentIndex] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const restart = () => {
    setQuestions(buildQuiz(cards, language));
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResults(false);
    setShowFeedback(false);
    setSessionXP(0);
    progressAnim.setValue(0);
  };

  // ─── Out of hearts screen ────────────────────────────────────────────────────

  if (outOfHearts && gameStats) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.outOfHeartsContainer}>
          <Animated.Text style={[styles.brokenHeart, { transform: [{ translateX: shakeAnim }] }]}>
            💔
          </Animated.Text>
          <Text style={styles.outTitle}>{t('outOfHearts')}</Text>
          <Text style={styles.outSubtext}>{t('outOfHeartsSubtext')}</Text>
          {countdown ? (
            <View style={styles.countdownBox}>
              <Text style={styles.countdownLabel}>{t('nextHeartIn')}</Text>
              <Text style={styles.countdownTimer}>{countdown}</Text>
            </View>
          ) : null}
          <TouchableOpacity
            style={styles.flashcardsButton}
            onPress={() => router.push({ pathname: '/flashcards', params: { deck, title, from: from ?? '/' } } as any)}
          >
            <Text style={styles.flashcardsButtonText}>{t('practiceFlashcards')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.waitButton} onPress={() => router.push((from ?? '/') as any)}>
            <Text style={styles.waitButtonText}>{t('waitForHearts')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Results screen ──────────────────────────────────────────────────────────

  if (showResults) {
    const perfect = score === questions.length;
    const good = score >= questions.length * 0.7;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsEmoji}>{perfect ? '🏆' : good ? '🎉' : '📚'}</Text>
          <Text style={styles.resultsTitle}>{t('quizComplete')}</Text>

          <View style={styles.scoreBox}>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreDivider}>/</Text>
            <Text style={styles.scoreTotal}>{questions.length}</Text>
          </View>

          <Text style={styles.scoreLabel}>
            {perfect ? t('perfectScoreMsg') : good ? t('greatJobMsg') : t('keepGoingMsg')}
          </Text>

          {/* XP earned this session */}
          <View style={styles.xpResultBox}>
            <Text style={styles.xpResultText}>+{sessionXP} {t('xpGained')}</Text>
            {gameStats && (
              <Text style={styles.xpTotalText}>{t('totalXP')}: {gameStats.totalXP} · {t('level')} {gameStats.level}</Text>
            )}
          </View>

          {savedScores.bestScore !== null && (
            <Text style={styles.bestScoreResult}>
              {t('personalBest')} {savedScores.bestScore}/{savedScores.totalQuestions}
            </Text>
          )}

          <View style={styles.scoreBarTrack}>
            <View style={[styles.scoreBarFill, { width: `${(score / questions.length) * 100}%` }]} />
          </View>

          <TouchableOpacity style={styles.tryAgainButton} onPress={restart}>
            <Text style={styles.tryAgainText}>{t('tryAgain')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backHomeButton} onPress={() => router.push((from ?? '/') as any)}>
            <Text style={styles.backHomeText}>{t('goBack')}</Text>
          </TouchableOpacity>
        </View>

        {/* Level-up overlay — appears on top of results */}
        {showLevelUp && gameStats && (
          <LevelUpOverlay
            newLevel={newLevelAchieved}
            totalXP={gameStats.totalXP}
            onDismiss={handleLevelUpDismiss}
          />
        )}

        {/* Badge modal — appears after level-up (or immediately if no level-up) */}
        <BadgeModal badge={currentBadge} onDismiss={handleBadgeDismiss} />
      </SafeAreaView>
    );
  }

  // ─── Quiz screen ──────────────────────────────────────────────────────────────

  const question = questions[currentIndex];
  const isAnswered = selectedAnswer !== null;

  const choiceStyle = (choice: string) => {
    if (!isAnswered) return styles.choiceDefault;
    if (choice === question.correctAnswer) return styles.choiceCorrect;
    if (choice === selectedAnswer) return styles.choiceWrong;
    return styles.choiceDimmed;
  };
  const choiceTextStyle = (choice: string) => {
    if (!isAnswered) return styles.choiceTextDefault;
    if (choice === question.correctAnswer) return styles.choiceTextCorrect;
    if (choice === selectedAnswer) return styles.choiceTextWrong;
    return styles.choiceTextDimmed;
  };

  const heartsDisplay = gameStats
    ? Array.from({ length: MAX_HEARTS }, (_, i) => (i < gameStats.hearts ? '❤️' : '🤍')).join('')
    : '❤️❤️❤️❤️❤️';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push((from ?? '/') as any)} style={styles.backButton}>
          <Text style={styles.backText}>{t('goBack')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title} {t('quiz')}</Text>
        {/* Hearts */}
        <Text style={styles.heartsText}>{heartsDisplay}</Text>
      </View>

      {/* Animated progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* Question counter + personal best */}
      <View style={styles.metaRow}>
        <Text style={styles.questionCounter}>{currentIndex + 1}/{questions.length}</Text>
        {savedScores.bestScore !== null && (
          <Text style={styles.bestScoreLabel}>{t('personalBest')} {savedScores.bestScore}/{savedScores.totalQuestions}</Text>
        )}
        {gameStats && (
          <Text style={styles.xpLabel}>{gameStats.totalXP} {t('xpGained')}</Text>
        )}
      </View>

      {/* Deck label */}
      <Text style={styles.deckLabel}>{DECK_EMOJIS[deck] ?? '📚'} {title}</Text>

      {/* Question card with shake animation */}
      <Animated.View style={[styles.questionCard, { transform: [{ translateX: shakeAnim }] }]}>
        <Text style={styles.prompt}>{t('whatDoesThisMean')}</Text>
        <Text style={styles.kazakhWord}>{question.kazakh}</Text>
        {question.latin && <Text style={styles.latinText}>({question.latin})</Text>}
      </Animated.View>

      {/* Answer choices */}
      <View style={styles.choicesContainer}>
        {question.choices.map((choice) => (
          <TouchableOpacity
            key={choice}
            style={[styles.choiceButton, choiceStyle(choice)]}
            onPress={() => handleAnswer(choice)}
            activeOpacity={isAnswered ? 1 : 0.7}
          >
            <Text style={[styles.choiceText, choiceTextStyle(choice)]}>{choice}</Text>
            {isAnswered && choice === question.correctAnswer && <Text style={styles.choiceIcon}>✓</Text>}
            {isAnswered && choice === selectedAnswer && choice !== question.correctAnswer && <Text style={styles.choiceIcon}>✗</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* XP float */}
      {showXPFloat && (
        <Animated.View
          style={[
            styles.xpFloat,
            { transform: [{ translateY: xpFloatAnim }], opacity: xpFloatOpacity },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.xpFloatText}>+{XP_PER_CORRECT} {t('xpGained')}</Text>
        </Animated.View>
      )}

      {/* Feedback bar — slides up from bottom */}
      {showFeedback && (
        <Animated.View
          style={[
            styles.feedbackBar,
            lastCorrect ? styles.feedbackCorrect : styles.feedbackWrong,
            { transform: [{ translateY: feedbackSlide }], opacity: feedbackOpacity },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.feedbackIcon}>{lastCorrect ? '✓' : '✗'}</Text>
          <View>
            <Text style={styles.feedbackTitle}>
              {lastCorrect ? t('correct') : t('incorrect')}
            </Text>
            {!lastCorrect && selectedAnswer && (
              <Text style={styles.feedbackHint}>
                {t('correctAnswer')} {question.correctAnswer}
              </Text>
            )}
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { padding: 8 },
  backText: { color: '#a78bfa', fontSize: 16 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  heartsText: { fontSize: 13, letterSpacing: 1 },

  // Progress bar
  progressTrack: {
    height: 8,
    backgroundColor: '#1e1e35',
    marginHorizontal: 16,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#a78bfa',
    borderRadius: 4,
  },

  // Meta row (counter + best + xp)
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 6,
  },
  questionCounter: { color: '#6b7280', fontSize: 12 },
  bestScoreLabel: { color: '#a78bfa', fontSize: 12 },
  xpLabel: { color: '#f59e0b', fontSize: 12 },

  // Deck label
  deckLabel: {
    color: '#6b7280',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },

  // Question card
  questionCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    marginHorizontal: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d2d4e',
    marginBottom: 20,
  },
  prompt: { color: '#6b7280', fontSize: 14, marginBottom: 16, letterSpacing: 0.3 },
  kazakhWord: { color: '#ffffff', fontSize: 40, fontWeight: 'bold', textAlign: 'center' },
  latinText: { color: '#888888', fontSize: 14, fontStyle: 'italic', textAlign: 'center', marginTop: 8 },

  // Choices
  choicesContainer: { paddingHorizontal: 16, gap: 10 },
  choiceButton: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  choiceText: { fontSize: 15, fontWeight: '500', flex: 1 },
  choiceIcon: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 },

  choiceDefault: { backgroundColor: '#1a1a2e', borderColor: '#2d2d4e' },
  choiceCorrect: { backgroundColor: '#14532d', borderColor: '#22c55e' },
  choiceWrong:   { backgroundColor: '#450a0a', borderColor: '#ef4444' },
  choiceDimmed:  { backgroundColor: '#111122', borderColor: '#1e1e35' },
  choiceTextDefault: { color: '#ffffff' },
  choiceTextCorrect: { color: '#22c55e' },
  choiceTextWrong:   { color: '#ef4444' },
  choiceTextDimmed:  { color: '#374151' },

  // XP float
  xpFloat: {
    position: 'absolute',
    alignSelf: 'center',
    top: '45%',
    backgroundColor: '#f59e0b22',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  xpFloatText: { color: '#f59e0b', fontWeight: 'bold', fontSize: 16 },

  // Feedback bar
  feedbackBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  feedbackCorrect: { backgroundColor: '#14532d' },
  feedbackWrong:   { backgroundColor: '#450a0a' },
  feedbackIcon:    { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
  feedbackTitle:   { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  feedbackHint:    { color: '#fca5a5', fontSize: 13, marginTop: 2 },

  // Out of hearts
  outOfHeartsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  brokenHeart: { fontSize: 80, marginBottom: 20 },
  outTitle:    { color: '#ffffff', fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  outSubtext:  { color: '#9ca3af', fontSize: 15, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  countdownBox: { alignItems: 'center', marginBottom: 32 },
  countdownLabel: { color: '#6b7280', fontSize: 13, marginBottom: 4 },
  countdownTimer: { color: '#a78bfa', fontSize: 36, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
  flashcardsButton: {
    backgroundColor: '#a78bfa',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    marginBottom: 14,
    width: '100%',
    alignItems: 'center',
  },
  flashcardsButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  waitButton: { padding: 12 },
  waitButtonText: { color: '#6b7280', fontSize: 15 },

  // Results
  resultsContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  resultsEmoji:  { fontSize: 64, marginBottom: 16 },
  resultsTitle:  { color: '#ffffff', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  scoreBox:      { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  scoreNumber:   { color: '#a78bfa', fontSize: 72, fontWeight: 'bold', lineHeight: 80 },
  scoreDivider:  { color: '#4b5563', fontSize: 40, marginHorizontal: 6 },
  scoreTotal:    { color: '#4b5563', fontSize: 40, fontWeight: 'bold' },
  scoreLabel:    { color: '#9ca3af', fontSize: 16, textAlign: 'center', marginBottom: 16 },
  xpResultBox:   { alignItems: 'center', marginBottom: 16 },
  xpResultText:  { color: '#f59e0b', fontSize: 20, fontWeight: 'bold' },
  xpTotalText:   { color: '#6b7280', fontSize: 13, marginTop: 4 },
  bestScoreResult: { color: '#a78bfa', fontSize: 14, marginBottom: 20 },
  scoreBarTrack: { width: '100%', height: 8, backgroundColor: '#1e1e35', borderRadius: 4, overflow: 'hidden', marginBottom: 32 },
  scoreBarFill:  { height: '100%', backgroundColor: '#a78bfa', borderRadius: 4 },
  tryAgainButton: {
    backgroundColor: '#a78bfa',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 14,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  tryAgainText:  { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  backHomeButton: { padding: 12 },
  backHomeText:   { color: '#6b7280', fontSize: 15 },
});
