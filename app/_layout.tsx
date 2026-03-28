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

// ─── Inner component — can safely call useLanguage() inside LanguageProvider ──

function AppTabs({ hiddenScreen }: { hiddenScreen: any }) {
  const { t } = useLanguage();
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
    </Tabs>
  );
}

// ─── Root layout ──────────────────────────────────────────────────────────────

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [hasChosenLanguage, setHasChosenLanguage] = useState<boolean | null>(null);
  const [savedLanguage, setSavedLanguage] = useState<string>('en');

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setChecking(false);
    });
    return unsubscribe;
  }, []);

  // Read language preference and hasChosenLanguage from AsyncStorage once
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(HAS_CHOSEN_LANGUAGE_KEY),
      AsyncStorage.getItem(LANGUAGE_KEY),
    ]).then(([chosen, lang]) => {
      setHasChosenLanguage(chosen === 'true');
      setSavedLanguage(lang === 'ru' ? 'ru' : 'en');
    });
  }, []);

  // Redirect whenever auth state, language choice, or route changes
  useEffect(() => {
    if (checking || hasChosenLanguage === null) return;

    const onAuthScreen =
      segments[0] === 'login' ||
      segments[0] === 'signup' ||
      segments[0] === 'privacy-policy';
    const onLanguagePicker = segments[0] === 'language-picker';

    if (!user && !onAuthScreen) {
      router.replace('/login');
    } else if (user && onAuthScreen) {
      // Logged in but still on an auth screen — decide where to go
      router.replace(!hasChosenLanguage ? '/language-picker' : '/');
    } else if (user && !hasChosenLanguage && !onLanguagePicker) {
      // Logged in, no language chosen yet
      router.replace('/language-picker');
    }
  }, [user, checking, segments, hasChosenLanguage]);

  // Show spinner until both auth and AsyncStorage checks complete
  if (checking || hasChosenLanguage === null) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#a78bfa" />
      </View>
    );
  }

  const hiddenScreen = { href: null as null, tabBarStyle: { display: 'none' as const } };

  return (
    <LanguageProvider initialLanguage={savedLanguage}>
      <AppTabs hiddenScreen={hiddenScreen} />
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
