import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { auth } from '../utils/firebase';
import { loadProgress } from '../utils/firestore';

// Deck definitions — must match the actual data file sizes
const DECKS = [
  { key: 'greetings', label: 'Greetings', emoji: '👋', total: 20 },
  { key: 'numbers',   label: 'Numbers',   emoji: '🔢', total: 21 },
  { key: 'colors',    label: 'Colors',    emoji: '🎨', total: 15 },
  { key: 'family',    label: 'Family',    emoji: '👨‍👩‍👧', total: 19 },
  { key: 'food',      label: 'Food',      emoji: '🍽️', total: 20 },
  { key: 'animals',   label: 'Animals',   emoji: '🐴', total: 20 },
];

type ProgressData = {
  streakCount?: number;
  masteredCards?: Record<string, number[]>;
  quizBestScores?: Record<string, number>;
};

export default function ProgressScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProgressData>({});

  // Load all progress from Firestore on mount
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) { setLoading(false); return; }
    loadProgress(userId)
      .then((d) => { setData(d ?? {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const streakCount    = data.streakCount    ?? 0;
  const masteredCards  = data.masteredCards  ?? {};
  const quizBestScores = data.quizBestScores ?? {};

  // Total words mastered across all decks
  const totalMastered = Object.values(masteredCards).reduce(
    (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0
  );

  // Best quiz score across all decks
  const allScores = Object.values(quizBestScores).filter(
    (s): s is number => typeof s === 'number'
  );
  const bestQuizScore = allScores.length > 0 ? Math.max(...allScores) : null;

  // Only show quiz section for decks that have a saved score
  const decksWithScores = DECKS.filter((d) => quizBestScores[d.key] != null);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#a78bfa" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar style="light" />

      {/* Header */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>My Progress</Text>

      {/* Stats row — streak / mastered / best quiz */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statNumber}>{streakCount}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>📚</Text>
          <Text style={styles.statNumber}>{totalMastered}</Text>
          <Text style={styles.statLabel}>Mastered</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🏆</Text>
          <Text style={styles.statNumber}>
            {bestQuizScore != null ? `${bestQuizScore}/10` : '—'}
          </Text>
          <Text style={styles.statLabel}>Best Quiz</Text>
        </View>
      </View>

      {/* Deck-by-deck breakdown */}
      <Text style={styles.sectionTitle}>Flashcard Decks</Text>
      {DECKS.map((deck) => {
        const mastered = masteredCards[deck.key]?.length ?? 0;
        const pct = deck.total > 0 ? Math.round((mastered / deck.total) * 100) : 0;
        return (
          <View key={deck.key} style={styles.deckCard}>
            <View style={styles.deckHeader}>
              <Text style={styles.deckLabel}>{deck.emoji}  {deck.label}</Text>
              <Text style={styles.deckCount}>{mastered} / {deck.total}</Text>
            </View>
            {/* Progress bar */}
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${pct}%` as `${number}%` }]} />
            </View>
          </View>
        );
      })}

      {/* Quiz best scores section */}
      <Text style={styles.sectionTitle}>Quiz Best Scores</Text>
      {decksWithScores.length > 0 ? (
        decksWithScores.map((deck) => (
          <View key={deck.key} style={styles.quizRow}>
            <Text style={styles.quizLabel}>{deck.emoji}  {deck.label} Quiz</Text>
            <View style={styles.quizBadge}>
              <Text style={styles.quizScore}>{quizBestScores[deck.key]} / 10</Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Complete a quiz to see your scores here.</Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    paddingBottom: 4,
    marginBottom: 8,
  },
  backBtnText: {
    color: '#a78bfa',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 28,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#a78bfa',
  },
  statLabel: {
    fontSize: 11,
    color: '#a0a0c0',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    marginTop: 4,
  },
  deckCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  deckLabel: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '500',
  },
  deckCount: {
    fontSize: 14,
    color: '#a78bfa',
    fontWeight: '600',
  },
  barBg: {
    height: 6,
    backgroundColor: '#0f3460',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    backgroundColor: '#a78bfa',
    borderRadius: 3,
  },
  quizRow: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  quizLabel: {
    fontSize: 15,
    color: '#ffffff',
  },
  quizBadge: {
    backgroundColor: '#2d1f5e',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  quizScore: {
    fontSize: 14,
    color: '#a78bfa',
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
});
