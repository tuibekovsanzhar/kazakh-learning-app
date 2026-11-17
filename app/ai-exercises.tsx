// app/ai-exercises.tsx
// AI exercises: "say it in Kazakh", the answer is checked by AI.
//
// Everything goes through the Qazaq Tili server (utils/api.js) with the user's
// Firebase ID token. The app holds no AI keys and never calls an AI provider.
// The server enforces the 16+ consent, 5 answer checks per day and the shared
// daily budget; this screen only explains them.

import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ActivityIndicator, ScrollView, Platform, TextInput, KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useLanguage } from '../utils/i18n';
import { api, errorKey } from '../utils/api';

const PRIVACY_URL = 'https://tuibekovsanzhar.github.io/kazakh-learning-app/privacy-policy.html';

const TOPICS = ['greetings', 'travel', 'food', 'business', 'family'] as const;
const LEVELS = ['beginner', 'intermediate'] as const;

type Status = { consented: boolean; checksUsedToday: number; checksAllowed: number; available: boolean };
type Item = { prompt: string; answer: string; answerLatin: string };
type ExerciseSet = { id: string; items: Item[]; reviewed: boolean };
type Correction = { said: string; corrected: string; explanation: string; confidence: 'high' | 'medium' | 'low' };
type CheckResult = { verdict: 'correct' | 'almost' | 'wrong'; corrections: Correction[]; comment: string; answer: string; answerLatin: string; checksLeft: number };

export default function AIExercisesScreen() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const lang = language === 'ru' ? 'ru' : 'en';

  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState('');
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>('greetings');
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('beginner');
  const [set, setSet] = useState<ExerciseSet | null>(null);
  const [loadingSet, setLoadingSet] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, CheckResult>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [checking, setChecking] = useState<number | null>(null);
  const [reporting, setReporting] = useState<number | null>(null);
  const [reported, setReported] = useState<Record<number, boolean>>({});

  const loadStatus = useCallback(async () => {
    setError('');
    try {
      setStatus(await api.exerciseStatus());
    } catch (e) {
      setError(t(errorKey(e)));
    }
  }, [t]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const back = () => router.push('/' as any);
  const checksLeft = status ? Math.max(status.checksAllowed - status.checksUsedToday, 0) : 0;

  const getSet = async () => {
    setLoadingSet(true);
    setError('');
    try {
      const r = await api.exerciseSet(topic, level, lang);
      setSet(r.set);
      setAnswers({});
      setResults({});
      setRevealed({});
      setReported({});
    } catch (e) {
      setError(t(errorKey(e)));
    } finally {
      setLoadingSet(false);
    }
  };

  const check = async (index: number) => {
    const text = (answers[index] ?? '').trim();
    if (!set || !text || checking !== null) return;
    setChecking(index);
    setError('');
    try {
      const r: CheckResult = await api.checkExercise(set.id, index, text, lang);
      setResults((prev) => ({ ...prev, [index]: r }));
      setStatus((s) => (s ? { ...s, checksUsedToday: s.checksAllowed - r.checksLeft } : s));
    } catch (e: any) {
      setError(t(errorKey(e)));
      if (e?.code === 'daily_limit') setStatus((s) => (s ? { ...s, checksUsedToday: s.checksAllowed } : s));
      if (e?.code === 'rest_until_tomorrow') setStatus((s) => (s ? { ...s, available: false } : s));
    } finally {
      setChecking(null);
    }
  };

  const report = async (index: number, reason: 'wrong' | 'offensive' | 'other') => {
    if (!set) return;
    setReporting(null);
    try {
      await api.reportExercise(set.id, index, reason);
      setReported((prev) => ({ ...prev, [index]: true }));
    } catch (e) {
      setError(t(errorKey(e)));
    }
  };

  // ─── Loading / consent ────────────────────────────────────────────────────

  if (!status) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <TouchableOpacity style={styles.backBtn} onPress={back}>
          <Text style={styles.backBtnText}>{t('goBack')}</Text>
        </TouchableOpacity>
        <View style={styles.center}>
          {error ? (
            <>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={[styles.primaryBtn, { marginTop: 16, alignSelf: 'stretch' }]} onPress={loadStatus}>
                <Text style={styles.primaryBtnText}>{t('tryAgain')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <ActivityIndicator color="#a78bfa" />
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (!status.consented) {
    return <ConsentScreen onBack={back} onAccepted={setStatus} />;
  }

  // ─── Exercises ────────────────────────────────────────────────────────────

  const noChecks = checksLeft === 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <TouchableOpacity style={styles.backBtn} onPress={back}>
        <Text style={styles.backBtnText}>{t('goBack')}</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>✨ {t('aiTitle')}</Text>
          <Text style={styles.subtitle}>{t('aiSubtitle')}</Text>

          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {t('aiChecksLeft').replace('{n}', String(checksLeft)).replace('{total}', String(status.checksAllowed))}
            </Text>
          </View>
          {!status.available ? <Notice text={t('aiResting')} /> : noChecks ? <Notice text={t('aiNoChecksLeft')} /> : null}

          <Text style={styles.sectionLabel}>{t('aiTopic')}</Text>
          <View style={styles.pillRow}>
            {TOPICS.map((k) => (
              <Pill key={k} label={t(`aiTopic_${k}`)} active={topic === k} onPress={() => setTopic(k)} />
            ))}
          </View>

          <Text style={styles.sectionLabel}>{t('aiLevel')}</Text>
          <View style={styles.pillRow}>
            {LEVELS.map((k) => (
              <Pill key={k} label={t(`aiLevel_${k}`)} active={level === k} onPress={() => setLevel(k)} />
            ))}
          </View>

          <TouchableOpacity style={[styles.primaryBtn, loadingSet && styles.disabled]} onPress={getSet} disabled={loadingSet}>
            {loadingSet ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{set ? t('aiNewSet') : t('aiGetExercises')}</Text>}
          </TouchableOpacity>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {set && !set.reviewed ? <Text style={styles.label}>{t('aiNotReviewed')}</Text> : null}

          {set?.items.map((item, i) => {
            const r = results[i];
            const showAnswer = Boolean(r) || revealed[i];
            return (
              <View key={`${set.id}-${i}`} style={styles.card}>
                <Text style={styles.cardNumber}>#{i + 1} · {t('aiSayInKazakh')}</Text>
                <Text style={styles.cardPrompt}>{item.prompt}</Text>

                <TextInput
                  style={styles.input}
                  value={answers[i] ?? ''}
                  onChangeText={(v) => setAnswers((prev) => ({ ...prev, [i]: v }))}
                  placeholder={t('aiPlaceholder')}
                  placeholderTextColor="#6b7280"
                  maxLength={300}
                  autoCorrect={false}
                  autoCapitalize="sentences"
                  editable={checking !== i}
                />
                <TouchableOpacity
                  style={[styles.checkBtn, (noChecks || !status.available || checking !== null || !(answers[i] ?? '').trim()) && styles.disabled]}
                  onPress={() => check(i)}
                  disabled={noChecks || !status.available || checking !== null || !(answers[i] ?? '').trim()}
                >
                  {checking === i ? <ActivityIndicator color="#fff" /> : <Text style={styles.checkBtnText}>{t('aiCheck')}</Text>}
                </TouchableOpacity>

                {r ? (
                  <View style={[styles.result, r.verdict === 'correct' ? styles.resultOk : r.verdict === 'almost' ? styles.resultAlmost : styles.resultWrong]}>
                    <Text style={styles.resultTitle}>{r.verdict === 'correct' ? `✓ ${t('aiCorrect')}` : r.verdict === 'almost' ? t('aiAlmost') : t('aiWrong')}</Text>
                    {r.corrections.map((c) => (
                      <View key={`${c.said}-${c.corrected}`} style={{ marginTop: 6 }}>
                        <Text style={styles.correction}>
                          <Text style={styles.said}>{c.said}</Text> → <Text style={styles.fixed}>{c.corrected}</Text>
                        </Text>
                        {c.explanation ? <Text style={styles.explanation}>{c.explanation}</Text> : null}
                      </View>
                    ))}
                    {r.comment ? <Text style={styles.comment}>{r.comment}</Text> : null}
                  </View>
                ) : null}

                {showAnswer ? (
                  <View style={styles.answerBox}>
                    <Text style={styles.answerLabel}>{t('aiGoodAnswer')}</Text>
                    <Text style={styles.cardKazakh}>{item.answer}</Text>
                    <Text style={styles.cardLatin}>{item.answerLatin}</Text>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => setRevealed((prev) => ({ ...prev, [i]: true }))}>
                    <Text style={styles.link}>{t('aiShowAnswer')}</Text>
                  </TouchableOpacity>
                )}

                {reported[i] ? (
                  <Text style={styles.reportThanks}>{t('aiReportThanks')}</Text>
                ) : reporting === i ? (
                  <View style={styles.reportBox}>
                    <Text style={styles.reportTitle}>{t('aiReportTitle')}</Text>
                    {(['wrong', 'offensive', 'other'] as const).map((reason) => (
                      <TouchableOpacity key={reason} style={styles.reportOption} onPress={() => report(i, reason)}>
                        <Text style={styles.reportOptionText}>
                          {t(reason === 'wrong' ? 'aiReportWrong' : reason === 'offensive' ? 'aiReportOffensive' : 'aiReportOther')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity onPress={() => setReporting(null)}>
                      <Text style={styles.link}>{t('aiCancel')}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => setReporting(i)} accessibilityRole="button">
                    <Text style={styles.reportLink}>⚑ {t('aiReport')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          <Text style={styles.footNote}>{t('aiNote')}</Text>
          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── One-time 16+ and AI consent ──────────────────────────────────────────────

function ConsentScreen({ onBack, onAccepted }: { onBack: () => void; onAccepted: (s: Status) => void }) {
  const { t } = useLanguage();
  const [age, setAge] = useState(false);
  const [ai, setAi] = useState(false);
  const [under16, setUnder16] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const accept = async () => {
    setBusy(true);
    setError('');
    try {
      onAccepted(await api.exerciseConsent());
    } catch (e) {
      setError(t(errorKey(e)));
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>{t('goBack')}</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>✨ {t('aiConsentTitle')}</Text>
        {under16 ? (
          <>
            <Notice text={t('aiUnder16')} />
            <TouchableOpacity style={styles.primaryBtn} onPress={onBack}>
              <Text style={styles.primaryBtnText}>{t('goBack')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.consentText}>{t('aiConsentText')}</Text>
            <Check label={t('aiConsentAge')} checked={age} onToggle={() => setAge((v) => !v)} />
            <Check label={t('aiConsentAi')} checked={ai} onToggle={() => setAi((v) => !v)} />
            <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync(PRIVACY_URL)}>
              <Text style={styles.link}>{t('aiConsentPrivacy')} ↗</Text>
            </TouchableOpacity>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            <TouchableOpacity style={[styles.primaryBtn, { marginTop: 20 }, (!age || !ai || busy) && styles.disabled]} onPress={accept} disabled={!age || !ai || busy}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{t('aiConsentContinue')}</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setUnder16(true)}>
              <Text style={[styles.link, { textAlign: 'center', marginTop: 16 }]}>{t('aiUnder16Btn')}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Small pieces ─────────────────────────────────────────────────────────────

function Pill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.pill, active && styles.pillActive]} onPress={onPress} accessibilityState={{ selected: active }}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Check({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity style={styles.checkRow} onPress={onToggle} accessibilityRole="checkbox" accessibilityState={{ checked }}>
      <View style={[styles.checkbox, checked && styles.checkboxOn]}>{checked ? <Text style={styles.checkmark}>✓</Text> : null}</View>
      <Text style={styles.checkLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeText}>{text}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  backBtn: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4, marginTop: Platform.OS === 'android' ? 40 : 0 },
  backBtnText: { color: '#a78bfa', fontSize: 16, fontWeight: '600' },
  scroll: { paddingHorizontal: 20, paddingTop: 8 },

  title: { fontSize: 26, fontWeight: '700', color: '#fff', textAlign: 'center', marginTop: 8 },
  subtitle: { fontSize: 14, color: '#a78bfa', textAlign: 'center', marginTop: 4, marginBottom: 16 },

  counter: { alignSelf: 'center', backgroundColor: '#1a1a2e', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 16, borderWidth: 1, borderColor: '#2d2d4e' },
  counterText: { color: '#cbd5e1', fontSize: 13, fontWeight: '600' },

  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#6b7280', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#2d2d4e', backgroundColor: '#1a1a2e' },
  pillActive: { borderColor: '#a78bfa', backgroundColor: '#2e1f5e' },
  pillText: { color: '#9ca3af', fontSize: 14, fontWeight: '500' },
  pillTextActive: { color: '#a78bfa', fontWeight: '700' },

  primaryBtn: { backgroundColor: '#a78bfa', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 20 },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  disabled: { opacity: 0.5 },

  errorBox: { backgroundColor: '#f8717122', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#f8717144' },
  errorText: { color: '#f87171', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  notice: { backgroundColor: '#fbbf2418', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#fbbf2455' },
  noticeText: { color: '#fde68a', fontSize: 14, lineHeight: 20 },
  label: { alignSelf: 'flex-start', color: '#fbbf24', backgroundColor: '#fbbf2418', fontSize: 12, fontWeight: '700', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12, overflow: 'hidden' },

  card: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#2d2d4e' },
  cardNumber: { color: '#a78bfa', fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6 },
  cardPrompt: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 12, lineHeight: 24 },
  input: { backgroundColor: '#0f0f1a', borderRadius: 12, borderWidth: 1, borderColor: '#2d2d4e', color: '#fff', fontSize: 17, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10 },
  checkBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 10 },
  checkBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  result: { borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1 },
  resultOk: { backgroundColor: '#22c55e18', borderColor: '#22c55e55' },
  resultAlmost: { backgroundColor: '#fbbf2418', borderColor: '#fbbf2455' },
  resultWrong: { backgroundColor: '#f8717118', borderColor: '#f8717155' },
  resultTitle: { color: '#fff', fontWeight: '700', fontSize: 15 },
  correction: { color: '#e5e7eb', fontSize: 15 },
  said: { color: '#f87171', textDecorationLine: 'line-through' },
  fixed: { color: '#4ade80', fontWeight: '700' },
  explanation: { color: '#cbd5e1', fontSize: 13, marginTop: 2 },
  comment: { color: '#cbd5e1', fontSize: 14, marginTop: 8, fontStyle: 'italic' },

  answerBox: { borderTopWidth: 1, borderTopColor: '#ffffff11', paddingTop: 10, marginBottom: 8 },
  answerLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 2 },
  cardKazakh: { color: '#ffffff', fontSize: 20, fontWeight: '700' },
  cardLatin: { color: '#a78bfa', fontSize: 14, fontWeight: '500', marginTop: 2 },

  link: { color: '#a78bfa', fontSize: 14, fontWeight: '600', paddingVertical: 6 },
  reportLink: { color: '#6b7280', fontSize: 13, paddingTop: 6 },
  reportThanks: { color: '#94a3b8', fontSize: 13, paddingTop: 6 },
  reportBox: { borderTopWidth: 1, borderTopColor: '#ffffff11', paddingTop: 10 },
  reportTitle: { color: '#e5e7eb', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  reportOption: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#0f0f1a', marginBottom: 6 },
  reportOptionText: { color: '#e5e7eb', fontSize: 14 },

  consentText: { color: '#cbd5e1', fontSize: 15, lineHeight: 22, marginTop: 16, marginBottom: 20 },
  checkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  checkbox: { width: 26, height: 26, borderRadius: 7, borderWidth: 2, borderColor: '#a78bfa', marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: '#a78bfa' },
  checkmark: { color: '#fff', fontWeight: '800' },
  checkLabel: { flex: 1, color: '#fff', fontSize: 15, lineHeight: 21 },

  footNote: { color: '#6b7280', fontSize: 12, textAlign: 'center', marginTop: 4 },
  bottomPadding: { height: 40 },
});
