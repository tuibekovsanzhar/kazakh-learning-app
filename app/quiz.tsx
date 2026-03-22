// app/quiz.tsx
// Quiz screen — works with any vocabulary deck.
// The caller passes { deck, title } as route params.
// Shows Kazakh Cyrillic word, 4 English answer choices, instant feedback, 10 questions per session.

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { greetings }   from '../data/greetings';
import { numbers }     from '../data/numbers';
import { colors }      from '../data/colors';
import { familyWords } from '../data/family';
import { foodWords }   from '../data/food';
import { animalWords } from '../data/animals';
import { saveQuizScore, loadQuizScores, updateStreak } from '../utils/storage';
import { auth } from '../utils/firebase';
import { saveProgress, loadProgress } from '../utils/firestore';

// ─── Types ────────────────────────────────────────────────────────────────────

// Minimal normalized card — quiz only needs the Kazakh word, Latin, and English meaning
type QuizCard = {
  kazakh: string;
  latin?: string;
  english: string;
};

type Question = {
  kazakh: string;
  latin?: string;
  correctAnswer: string;
  choices: string[]; // 4 shuffled choices
};

// Emoji shown in the deck label
const DECK_EMOJIS: Record<string, string> = {
  greetings: '👋',
  numbers:   '🔢',
  colors:    '🎨',
  family:    '👨‍👩‍👧',
  food:      '🍽️',
  animals:   '🐴',
};

// ─── Data normalization ────────────────────────────────────────────────────────

// Convert each deck's raw data to { kazakh, latin, english } for quiz use
function normalizeDeck(deckId: string): QuizCard[] {
  switch (deckId) {
    case 'greetings':
      return greetings.map((w) => ({ kazakh: w.kazakh, latin: w.latin, english: w.english }));
    case 'numbers':
      return numbers.map((w) => ({ kazakh: w.cyrillic, latin: w.latin, english: w.english }));
    case 'colors':
      return colors.map((w) => ({ kazakh: w.cyrillic, latin: w.latin, english: w.english }));
    case 'family':
      return familyWords.map((w) => ({ kazakh: w.kazakh, latin: w.latin, english: w.english }));
    case 'food':
      return foodWords.map((w) => ({ kazakh: w.kazakh, latin: w.latin, english: w.english }));
    case 'animals':
      return animalWords.map((w) => ({ kazakh: w.kazakh, latin: w.latin, english: w.english }));
    default:
      return [];
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Shuffle an array in-place (Fisher-Yates) and return it. */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Build up to 10 random questions from the given card array. */
function buildQuiz(cards: QuizCard[]): Question[] {
  const pool = shuffle(cards).slice(0, Math.min(10, cards.length));

  return pool.map((item) => {
    const correctAnswer = item.english;

    // Wrong answers: all other english values, shuffled, pick 3
    const wrongAnswers = shuffle(
      cards.filter((c) => c.english !== correctAnswer).map((c) => c.english)
    ).slice(0, 3);

    const choices = shuffle([correctAnswer, ...wrongAnswers]);

    return { kazakh: item.kazakh, latin: item.latin, correctAnswer, choices };
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function QuizScreen() {
  const router = useRouter();

  // Read deck key and display title from navigation params.
  // Defaults keep the screen usable if opened without params.
  const { deck = 'greetings', title = 'Greetings', from } =
    useLocalSearchParams<{ deck: string; title: string; from: string }>();

  // Normalize the deck once — stable during the component's lifetime
  const cards = normalizeDeck(deck);

  const [questions, setQuestions] = useState<Question[]>(() => buildQuiz(cards));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Persisted best/last scores loaded from storage
  const [savedScores, setSavedScores] = useState<{
    lastScore: number | null;
    bestScore: number | null;
    totalQuestions: number | null;
  }>({ lastScore: null, bestScore: null, totalQuestions: null });

  // Load saved scores when screen opens.
  // AsyncStorage loads first. Firestore loads second and overwrites bestScore
  // if cloud data exists — keeps best score in sync across devices.
  useEffect(() => {
    loadQuizScores(deck).then(setSavedScores);

    const userId = auth.currentUser?.uid;
    if (userId) {
      loadProgress(userId).then((data) => {
        if (data?.quizBestScores?.[deck] != null) {
          setSavedScores((prev) => ({
            ...prev,
            bestScore: data.quizBestScores[deck],
          }));
        }
      });
    }
  }, [deck]);

  // When quiz ends: save the score, update best if needed, update streak,
  // then sync the best score to Firestore.
  useEffect(() => {
    if (showResults) {
      saveQuizScore(deck, score, questions.length).then((updated) => {
        setSavedScores(updated);
        // Sync best score to Firestore using the dynamic deck key
        const userId = auth.currentUser?.uid;
        if (userId) {
          saveProgress(userId, { quizBestScores: { [deck]: updated.bestScore } });
        }
      });
      updateStreak();
    }
  }, [showResults]); // eslint-disable-line react-hooks/exhaustive-deps

  const question = questions[currentIndex];
  const totalQuestions = questions.length;
  const isAnswered = selectedAnswer !== null;

  // ─── Answer handler ─────────────────────────────────────────────────────────

  const handleAnswer = useCallback(
    (answer: string) => {
      if (isAnswered) return; // ignore taps during feedback delay

      const correct = answer === question.correctAnswer;
      if (correct) setScore((s) => s + 1);
      setSelectedAnswer(answer);

      // Auto-advance after 1.5 s
      setTimeout(() => {
        if (currentIndex + 1 >= totalQuestions) {
          setShowResults(true);
        } else {
          setCurrentIndex((i) => i + 1);
          setSelectedAnswer(null);
        }
      }, 1500);
    },
    [isAnswered, question, currentIndex, totalQuestions]
  );

  // ─── Restart ────────────────────────────────────────────────────────────────

  const restart = () => {
    setQuestions(buildQuiz(cards));
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResults(false);
  };

  // ─── Button color logic ─────────────────────────────────────────────────────

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

  // ─── Results screen ──────────────────────────────────────────────────────────

  if (showResults) {
    const perfect = score === totalQuestions;
    const good = score >= totalQuestions * 0.7;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsEmoji}>
            {perfect ? '🏆' : good ? '🎉' : '📚'}
          </Text>
          <Text style={styles.resultsTitle}>Quiz Complete!</Text>

          <View style={styles.scoreBox}>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreDivider}>/</Text>
            <Text style={styles.scoreTotal}>{totalQuestions}</Text>
          </View>

          <Text style={styles.scoreLabel}>
            {perfect
              ? 'Perfect score! Amazing!'
              : good
              ? 'Great job! Keep practicing.'
              : 'Keep going — you\'ll get there!'}
          </Text>

          {/* Personal best */}
          {savedScores.bestScore !== null && (
            <Text style={styles.bestScoreResult}>
              Personal best: {savedScores.bestScore}/{savedScores.totalQuestions}
            </Text>
          )}

          {/* Score breakdown bar */}
          <View style={styles.scoreBarTrack}>
            <View
              style={[
                styles.scoreBarFill,
                { width: `${(score / totalQuestions) * 100}%` },
              ]}
            />
          </View>

          <TouchableOpacity style={styles.tryAgainButton} onPress={restart}>
            <Text style={styles.tryAgainText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backHomeButton} onPress={() => router.push((from ?? '/') as any)}>
            <Text style={styles.backHomeText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Quiz screen ─────────────────────────────────────────────────────────────

  const progressPercent = currentIndex / totalQuestions;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push((from ?? '/') as any)} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title} Quiz</Text>
        <Text style={styles.questionCounter}>
          {currentIndex + 1}/{totalQuestions}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent * 100}%` }]} />
      </View>

      {/* Personal best — only shown if a score has been saved before */}
      {savedScores.bestScore !== null && (
        <Text style={styles.bestScoreLabel}>
          Personal best: {savedScores.bestScore}/{savedScores.totalQuestions}
        </Text>
      )}

      {/* Deck label — shows emoji + title */}
      <Text style={styles.deckLabel}>{DECK_EMOJIS[deck] ?? '📚'} {title}</Text>

      {/* Question card */}
      <View style={styles.questionCard}>
        <Text style={styles.prompt}>What does this mean?</Text>
        <Text style={styles.kazakhWord}>{question.kazakh}</Text>
        {question.latin && (
          <Text style={styles.latinText}>({question.latin})</Text>
        )}
      </View>

      {/* Answer choices */}
      <View style={styles.choicesContainer}>
        {question.choices.map((choice) => (
          <TouchableOpacity
            key={choice}
            style={[styles.choiceButton, choiceStyle(choice)]}
            onPress={() => handleAnswer(choice)}
            activeOpacity={isAnswered ? 1 : 0.7}
          >
            <Text style={[styles.choiceText, choiceTextStyle(choice)]}>
              {choice}
            </Text>

            {/* Icon shown after answering */}
            {isAnswered && choice === question.correctAnswer && (
              <Text style={styles.choiceIcon}>✓</Text>
            )}
            {isAnswered &&
              choice === selectedAnswer &&
              choice !== question.correctAnswer && (
                <Text style={styles.choiceIcon}>✗</Text>
              )}
          </TouchableOpacity>
        ))}
      </View>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },

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
    fontSize: 20,
    fontWeight: 'bold',
  },
  questionCounter: {
    color: '#6b7280',
    fontSize: 14,
    width: 60,
    textAlign: 'right',
  },

  // Progress bar
  progressTrack: {
    height: 6,
    backgroundColor: '#1e1e35',
    marginHorizontal: 16,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#a78bfa',
    borderRadius: 3,
  },

  // Personal best (quiz screen, below progress bar)
  bestScoreLabel: {
    color: '#a78bfa',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },

  // Personal best (results screen)
  bestScoreResult: {
    color: '#a78bfa',
    fontSize: 14,
    marginBottom: 20,
  },

  // Deck label
  deckLabel: {
    color: '#6b7280',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },

  // Question card
  questionCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    marginHorizontal: 16,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d2d4e',
    marginBottom: 28,
  },
  prompt: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  kazakhWord: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  latinText: {
    color: '#888888',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },

  // Choices
  choicesContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  choiceButton: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  choiceText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  choiceIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Choice states
  choiceDefault: {
    backgroundColor: '#1a1a2e',
    borderColor: '#2d2d4e',
  },
  choiceCorrect: {
    backgroundColor: '#14532d',
    borderColor: '#22c55e',
  },
  choiceWrong: {
    backgroundColor: '#450a0a',
    borderColor: '#ef4444',
  },
  choiceDimmed: {
    backgroundColor: '#111122',
    borderColor: '#1e1e35',
  },

  // Choice text states
  choiceTextDefault: { color: '#ffffff' },
  choiceTextCorrect: { color: '#22c55e' },
  choiceTextWrong: { color: '#ef4444' },
  choiceTextDimmed: { color: '#374151' },

  // ── Results screen ──
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  resultsEmoji: { fontSize: 64, marginBottom: 16 },
  resultsTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  scoreNumber: {
    color: '#a78bfa',
    fontSize: 72,
    fontWeight: 'bold',
    lineHeight: 80,
  },
  scoreDivider: {
    color: '#4b5563',
    fontSize: 40,
    marginHorizontal: 6,
  },
  scoreTotal: {
    color: '#4b5563',
    fontSize: 40,
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  scoreBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#1e1e35',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 40,
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: '#a78bfa',
    borderRadius: 4,
  },
  tryAgainButton: {
    backgroundColor: '#a78bfa',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 14,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  tryAgainText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backHomeButton: { padding: 12 },
  backHomeText: { color: '#6b7280', fontSize: 15 },
});
