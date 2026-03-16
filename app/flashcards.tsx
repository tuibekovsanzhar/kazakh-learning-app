// app/flashcards.tsx
// Flashcard screen — Greetings deck
// Front: Kazakh Cyrillic. Tap to flip → Latin + English.
// "I know this" / "Still learning" buttons track mastery.

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { greetings } from '../data/greetings';
import {
  saveFlashcardProgress,
  loadFlashcardProgress,
  updateStreak,
} from '../utils/storage';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - 48;

// ─── Types ───────────────────────────────────────────────────────────────────

type Card = typeof greetings[0];

// ─── Component ───────────────────────────────────────────────────────────────

export default function FlashcardsScreen() {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Sets of indices — known vs still learning
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [stillLearning, setStillLearning] = useState<Set<number>>(new Set());

  // Whether we've shown a "summary" after going through all cards
  const [showSummary, setShowSummary] = useState(false);

  // Load saved mastery marks from storage when the screen first opens
  useEffect(() => {
    loadFlashcardProgress('greetings').then(({ known, stillLearning }) => {
      setKnown(known);
      setStillLearning(stillLearning);
    });
  }, []);

  // Update streak whenever the deck summary appears (session completed)
  useEffect(() => {
    if (showSummary) updateStreak();
  }, [showSummary]);

  // Animated value: 0 = front, 180 = back
  const flipAnim = useRef(new Animated.Value(0)).current;

  // Derived
  const card: Card = greetings[currentIndex];
  const total = greetings.length;
  const knownCount = known.size;
  const progressPercent = total > 0 ? knownCount / total : 0;

  // ─── Flip animation ────────────────────────────────────────────────────────

  const flipToBack = useCallback(() => {
    Animated.spring(flipAnim, {
      toValue: 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(true);
  }, [flipAnim]);

  const flipToFront = useCallback(() => {
    Animated.spring(flipAnim, {
      toValue: 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(false);
  }, [flipAnim]);

  const resetFlip = useCallback(() => {
    Animated.timing(flipAnim, {
      toValue: 0,
      duration: 0, // instant reset when changing cards
      useNativeDriver: true,
    }).start();
    setIsFlipped(false);
  }, [flipAnim]);

  const handleCardPress = () => {
    if (isFlipped) flipToFront();
    else flipToBack();
  };

  // Front face rotates 0 → 90 (disappears sideways)
  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 90, 180],
    outputRange: ['0deg', '90deg', '90deg'],
  });

  // Back face starts rotated 90 (hidden) → 0 (appears)
  const backRotate = flipAnim.interpolate({
    inputRange: [0, 90, 180],
    outputRange: ['-90deg', '-90deg', '0deg'],
  });

  // Hide each face when it's "behind"
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 89, 90],
    outputRange: [1, 1, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 89, 90],
    outputRange: [0, 0, 1],
  });

  // ─── Navigation ───────────────────────────────────────────────────────────

  const goTo = (index: number) => {
    resetFlip();
    setCurrentIndex(index);
  };

  const goNext = () => {
    if (currentIndex < total - 1) {
      goTo(currentIndex + 1);
    } else {
      // Reached end of deck
      setShowSummary(true);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) goTo(currentIndex - 1);
  };

  // ─── Mastery buttons ──────────────────────────────────────────────────────

  const markKnown = () => {
    const newKnown = new Set(known).add(currentIndex);
    const newStillLearning = new Set(stillLearning);
    newStillLearning.delete(currentIndex);
    setKnown(newKnown);
    setStillLearning(newStillLearning);
    saveFlashcardProgress('greetings', newKnown, newStillLearning);
    goNext();
  };

  const markStillLearning = () => {
    const newStillLearning = new Set(stillLearning).add(currentIndex);
    const newKnown = new Set(known);
    newKnown.delete(currentIndex);
    setStillLearning(newStillLearning);
    setKnown(newKnown);
    saveFlashcardProgress('greetings', newKnown, newStillLearning);
    goNext();
  };

  // Status of current card (for button highlight)
  const cardStatus = known.has(currentIndex)
    ? 'known'
    : stillLearning.has(currentIndex)
    ? 'learning'
    : 'unseen';

  // ─── Summary screen ───────────────────────────────────────────────────────

  if (showSummary) {
    const learningCount = stillLearning.size;
    const unseenCount = total - known.size - stillLearning.size;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryEmoji}>🎉</Text>
          <Text style={styles.summaryTitle}>Deck Complete!</Text>
          <Text style={styles.summarySubtitle}>Greetings — {total} cards</Text>

          <View style={styles.summaryStats}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{knownCount}</Text>
              <Text style={styles.statLabel}>I know this</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{learningCount}</Text>
              <Text style={styles.statLabel}>Still learning</Text>
            </View>
            {unseenCount > 0 && (
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: '#6b7280' }]}>{unseenCount}</Text>
                <Text style={styles.statLabel}>Not marked</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.restartButton}
            onPress={() => {
              setCurrentIndex(0);
              setKnown(new Set());
              setStillLearning(new Set());
              setShowSummary(false);
              resetFlip();
            }}
          >
            <Text style={styles.restartButtonText}>Practice Again</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backHomeButton} onPress={() => router.back()}>
            <Text style={styles.backHomeText}>← Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main flashcard screen ────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flashcards</Text>
        <Text style={styles.counter}>{currentIndex + 1}/{total}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progressPercent * 100}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{knownCount} of {total} mastered</Text>

      {/* Deck label */}
      <Text style={styles.deckLabel}>👋 Greetings</Text>

      {/* ── Card ── */}
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={handleCardPress}
        style={styles.cardWrapper}
      >
        {/* Front face */}
        <Animated.View
          style={[
            styles.card,
            styles.cardFront,
            { transform: [{ rotateY: frontRotate }], opacity: frontOpacity },
          ]}
        >
          <Text style={styles.frontKazakh}>{card.kazakh}</Text>
          <Text style={styles.tapHint}>tap to reveal →</Text>
        </Animated.View>

        {/* Back face */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            { transform: [{ rotateY: backRotate }], opacity: backOpacity },
          ]}
        >
          <Text style={styles.backLatin}>{card.latin}</Text>
          <Text style={styles.backEnglish}>{card.english}</Text>
          <View style={styles.divider} />
          <Text style={styles.usageLabel}>WHEN TO USE</Text>
          <Text style={styles.usageText}>{card.usage}</Text>
        </Animated.View>
      </TouchableOpacity>

      {/* ── Mastery buttons — only visible after flip ── */}
      <View style={styles.masteryRow}>
        <TouchableOpacity
          style={[
            styles.masteryButton,
            styles.stillLearningButton,
            cardStatus === 'learning' && styles.masteryButtonActiveAmber,
          ]}
          onPress={markStillLearning}
        >
          <Text style={styles.masteryButtonText}>Still learning</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.masteryButton,
            styles.knownButton,
            cardStatus === 'known' && styles.masteryButtonActiveGreen,
          ]}
          onPress={markKnown}
        >
          <Text style={styles.masteryButtonText}>I know this ✓</Text>
        </TouchableOpacity>
      </View>

      {/* ── Previous / Next ── */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          onPress={goPrev}
          disabled={currentIndex === 0}
        >
          <Text style={[styles.navButtonText, currentIndex === 0 && styles.navButtonTextDisabled]}>
            ← Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navButton, styles.navButtonNext]} onPress={goNext}>
          <Text style={styles.navButtonText}>
            {currentIndex === total - 1 ? 'Finish →' : 'Next →'}
          </Text>
        </TouchableOpacity>
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
  counter: {
    color: '#6b7280',
    fontSize: 14,
    width: 60,
    textAlign: 'right',
  },

  // Progress
  progressBarTrack: {
    height: 6,
    backgroundColor: '#1e1e35',
    marginHorizontal: 16,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 3,
  },
  progressLabel: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 4,
  },

  // Deck label
  deckLabel: {
    color: '#a78bfa',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },

  // Card wrapper (holds both faces, same space)
  cardWrapper: {
    width: CARD_WIDTH,
    height: 260,
    alignSelf: 'center',
  },

  // Shared card styles
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    padding: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    borderWidth: 1,
  },
  cardFront: {
    backgroundColor: '#1a1a2e',
    borderColor: '#a78bfa',
  },
  cardBack: {
    backgroundColor: '#16213e',
    borderColor: '#22c55e',
  },

  // Front face content
  frontKazakh: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  tapHint: {
    color: '#4b5563',
    fontSize: 13,
  },

  // Back face content
  backLatin: {
    color: '#a78bfa',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  backEnglish: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: '#1e3a5f',
    marginBottom: 12,
  },
  usageLabel: {
    color: '#4b5563',
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  usageText: {
    color: '#9ca3af',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },

  // Mastery buttons
  masteryRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    paddingHorizontal: 16,
  },
  masteryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  stillLearningButton: {
    backgroundColor: '#1c1c2e',
    borderColor: '#f59e0b',
  },
  knownButton: {
    backgroundColor: '#1c1c2e',
    borderColor: '#22c55e',
  },
  masteryButtonActiveAmber: {
    backgroundColor: '#78350f',
    borderColor: '#f59e0b',
  },
  masteryButtonActiveGreen: {
    backgroundColor: '#14532d',
    borderColor: '#22c55e',
  },
  masteryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Previous / Next
  navRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#2d2d4e',
  },
  navButtonNext: {
    borderColor: '#a78bfa',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    color: '#a78bfa',
    fontWeight: '600',
    fontSize: 15,
  },
  navButtonTextDisabled: {
    color: '#4b5563',
  },

  // ── Summary screen ──
  summaryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  summaryEmoji: { fontSize: 64, marginBottom: 16 },
  summaryTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  summarySubtitle: {
    color: '#6b7280',
    fontSize: 15,
    marginBottom: 32,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#2d2d4e',
  },
  statNumber: {
    color: '#22c55e',
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  restartButton: {
    backgroundColor: '#a78bfa',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 14,
    marginBottom: 16,
  },
  restartButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backHomeButton: { padding: 12 },
  backHomeText: { color: '#6b7280', fontSize: 15 },
});
