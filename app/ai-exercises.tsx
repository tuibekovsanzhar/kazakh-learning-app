// app/ai-exercises.tsx
// AI-powered exercise generator — calls the Claude API to produce
// 5 Kazakh sentences for the chosen topic and level.
//
// SETUP: Create a file called .env in the project root and add:
//   EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-your-key-here
// Then restart Expo (npx expo start).

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ActivityIndicator, ScrollView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../utils/i18n';

// ─── Types ────────────────────────────────────────────────────────────────────

type Exercise = {
  kazakh: string;   // Kazakh sentence in Cyrillic
  latin: string;    // Latin transliteration
  english: string;  // English meaning
};

// ─── Constants ────────────────────────────────────────────────────────────────

const TOPICS = ['Greetings', 'Travel', 'Food', 'Business', 'Family'];
const LEVELS = ['Beginner', 'Intermediate'];

// The API key is stored in .env as EXPO_PUBLIC_ANTHROPIC_API_KEY.
// EXPO_PUBLIC_ prefix makes it available in the app bundle.
const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

// Set to true when the Claude API key is configured and ready.
const AI_ENABLED = false;

// ─── Component ────────────────────────────────────────────────────────────────

export default function AIExercisesScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const [topic, setTopic] = useState('Greetings');
  const [level, setLevel] = useState('Beginner');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ─── API call ──────────────────────────────────────────────────────────────

  const generate = async () => {
    setLoading(true);
    setError('');
    setExercises([]);

    const requestBody = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Generate 5 Kazakh language exercises about the topic "${topic}" for a ${level} level learner. Return ONLY a JSON array with no markdown, no explanation, just the raw JSON. Each item must have: kazakh (Cyrillic), latin (Latin transliteration following these rules: Ж→J, Ғ→ġ, Ө→Ö, Ү→Ü, Сау→Sau), english (English translation). Example format: [{"kazakh":"...","latin":"...","english":"..."}]`,
      }],
    };

    console.log('[AI] API key length:', API_KEY.length);
    console.log('[AI] Request body:', JSON.stringify(requestBody, null, 2));

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.log('[AI] HTTP error status:', response.status);
        console.log('[AI] HTTP error body:', errorBody);
        throw new Error(`API returned status ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      console.log('[AI] Raw response:', JSON.stringify(data, null, 2));

      // Claude returns the text in data.content[0].text
      const text: string = data.content[0].text;
      console.log('[AI] Extracted text:', text);

      const parsed: Exercise[] = JSON.parse(text);
      setExercises(parsed);

    } catch (e: any) {
      console.log('[AI] Error message:', e.message);
      console.log('[AI] Full error:', e);
      setError('Could not generate exercises. Check your internet connection and API key, then try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!AI_ENABLED) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/' as any)}>
          <Text style={styles.backBtnText}>{t('goBack')}</Text>
        </TouchableOpacity>
        <View style={styles.comingSoonContainer}>
          <Text style={styles.comingSoonEmoji}>✨</Text>
          <Text style={styles.comingSoonTitle}>{t('comingSoonTitle')}</Text>
          <Text style={styles.comingSoonText}>{t('comingSoonText')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/' as any)}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.title}>✨ AI Exercises</Text>
        <Text style={styles.subtitle}>Generated by Claude AI</Text>

        {/* ── Topic selector ── */}
        <Text style={styles.sectionLabel}>Topic</Text>
        <View style={styles.pillRow}>
          {TOPICS.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.pill, topic === t && styles.pillActive]}
              onPress={() => setTopic(t)}
            >
              <Text style={[styles.pillText, topic === t && styles.pillTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Level selector ── */}
        <Text style={styles.sectionLabel}>Level</Text>
        <View style={styles.pillRow}>
          {LEVELS.map((l) => (
            <TouchableOpacity
              key={l}
              style={[styles.pill, level === l && styles.pillActive]}
              onPress={() => setLevel(l)}
            >
              <Text style={[styles.pillText, level === l && styles.pillTextActive]}>
                {l}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Generate button ── */}
        <TouchableOpacity
          style={[styles.generateBtn, loading && styles.generateBtnDisabled]}
          onPress={generate}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.generateBtnText}>Generate Exercises</Text>}
        </TouchableOpacity>

        {/* ── Error message ── */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ── Exercise cards ── */}
        {exercises.map((ex, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardNumber}>#{i + 1}</Text>
            <Text style={styles.cardKazakh}>{ex.kazakh}</Text>
            <Text style={styles.cardLatin}>{ex.latin}</Text>
            <View style={styles.cardDivider} />
            <Text style={styles.cardEnglish}>{ex.english}</Text>
          </View>
        ))}

        {/* ── Regenerate button (shown after first generation) ── */}
        {exercises.length > 0 && (
          <TouchableOpacity
            style={styles.regenerateBtn}
            onPress={generate}
            disabled={loading}
          >
            <Text style={styles.regenerateBtnText}>Generate New Exercises</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    marginTop: Platform.OS === 'android' ? 40 : 0,
  },
  backBtnText: {
    color: '#a78bfa',
    fontSize: 16,
    fontWeight: '600',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Header
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#a78bfa',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 28,
  },

  // Section labels
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  // Topic / Level pill buttons
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2d2d4e',
    backgroundColor: '#1a1a2e',
  },
  pillActive: {
    borderColor: '#a78bfa',
    backgroundColor: '#2e1f5e',
  },
  pillText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#a78bfa',
    fontWeight: '700',
  },

  // Generate button
  generateBtn: {
    backgroundColor: '#a78bfa',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  generateBtnDisabled: {
    opacity: 0.6,
  },
  generateBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  // Error box
  errorBox: {
    backgroundColor: '#f8717122',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f8717144',
  },
  errorText: {
    color: '#f87171',
    fontSize: 14,
    lineHeight: 20,
  },

  // Exercise cards
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2d2d4e',
  },
  cardNumber: {
    color: '#a78bfa',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  cardKazakh: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardLatin: {
    color: '#a78bfa',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#ffffff11',
    marginBottom: 12,
  },
  cardEnglish: {
    color: '#94a3b8',
    fontSize: 15,
    fontStyle: 'italic',
  },

  // Regenerate button
  regenerateBtn: {
    borderWidth: 1,
    borderColor: '#a78bfa',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  regenerateBtnText: {
    color: '#a78bfa',
    fontWeight: '600',
    fontSize: 15,
  },

  bottomPadding: {
    height: 40,
  },

  // Coming Soon screen
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  comingSoonEmoji: {
    fontSize: 56,
    marginBottom: 20,
  },
  comingSoonTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
  },
});
