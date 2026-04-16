import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../utils/firebase';
import {
  LanguageProvider, useLanguage,
  LANGUAGE_KEY, HAS_CHOSEN_LANGUAGE_KEY,
} from '../utils/i18n';

// ─── AppContent ───────────────────────────────────────────────────────────────
// Lives inside LanguageProvider — reads hasChosenLanguage from context directly.
// This means when language-picker calls markLanguageChosen(), the context state
// updates synchronously in React and the redirect effect here fires with the
// correct value — no AsyncStorage re-read race condition.

function AppContent({ user, checking }: { user: any; checking: boolean }) {
  const router = useRouter();
  const segments = useSegments();
  const { t, hasChosenLanguage } = useLanguage();

  useEffect(() => {
    if (checking) return;

    const onAuthScreen =
      segments[0] === 'login' ||
      segments[0] === 'signup' ||
      segments[0] === 'privacy-policy';
    const onLanguagePicker = segments[0] === 'language-picker';
    const onVerifyScreen   = segments[0] === 'verify-email';

    if (!user && !onAuthScreen) {
      // Not logged in → login (covers verify-email too — can't be there without an account)
      router.replace('/login');
    } else if (user && !user.emailVerified && !onVerifyScreen) {
      // Logged in but email not verified → always send to verify screen
      router.replace('/verify-email');
    } else if (user && user.emailVerified && (onAuthScreen || onVerifyScreen)) {
      // Fully verified, no need to be on auth/verify screens → enter app
      router.replace(!hasChosenLanguage ? '/language-picker' : '/');
    } else if (user && user.emailVerified && !hasChosenLanguage && !onLanguagePicker) {
      router.replace('/language-picker');
    }
  }, [user, checking, segments, hasChosenLanguage]);

  const hiddenScreen = { href: null as null, tabBarStyle: { display: 'none' as const } };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1a1a2e', borderTopColor: '#a78bfa', borderTopWidth: 1 },
        tabBarActiveTintColor: '#a78bfa',
        tabBarInactiveTintColor: '#555555',
      }}
    >
      {/* ── Visible tabs ── */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: t('home'),
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarLabel: t('progress'),
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📊</Text>,
        }}
      />

      {/* ── Hidden from tab bar ── */}
      <Tabs.Screen name="login"           options={hiddenScreen} />
      <Tabs.Screen name="signup"          options={hiddenScreen} />
      <Tabs.Screen name="alphabet"        options={hiddenScreen} />
      <Tabs.Screen name="greetings"       options={hiddenScreen} />
      <Tabs.Screen name="numbers"         options={hiddenScreen} />
      <Tabs.Screen name="colors"          options={hiddenScreen} />
      <Tabs.Screen name="flashcards"      options={hiddenScreen} />
      <Tabs.Screen name="quiz"            options={hiddenScreen} />
      <Tabs.Screen name="family"          options={hiddenScreen} />
      <Tabs.Screen name="food"            options={hiddenScreen} />
      <Tabs.Screen name="animals"         options={hiddenScreen} />
      <Tabs.Screen name="ai-exercises"    options={hiddenScreen} />
      <Tabs.Screen name="privacy-policy"  options={hiddenScreen} />
      <Tabs.Screen name="language-picker" options={hiddenScreen} />
      <Tabs.Screen name="verify-email"    options={hiddenScreen} />
    </Tabs>
  );
}

// ─── Root layout ──────────────────────────────────────────────────────────────

export default function RootLayout() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [initialData, setInitialData] = useState<{
    language: string;
    hasChosen: boolean;
  } | null>(null);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setChecking(false);
    });
    return unsubscribe;
  }, []);

  // Read both AsyncStorage values once on mount
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(LANGUAGE_KEY),
      AsyncStorage.getItem(HAS_CHOSEN_LANGUAGE_KEY),
    ]).then(([lang, chosen]) => {
      setInitialData({
        language: lang === 'ru' ? 'ru' : 'en',
        hasChosen: chosen === 'true',
      });
    });
  }, []);

  // Show spinner until both Firebase and AsyncStorage are ready
  if (checking || initialData === null) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#a78bfa" />
      </View>
    );
  }

  return (
    <LanguageProvider
      initialLanguage={initialData.language}
      initialHasChosen={initialData.hasChosen}
    >
      <AppContent user={user} checking={checking} />
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
