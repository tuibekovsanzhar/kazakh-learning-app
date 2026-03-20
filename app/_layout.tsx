import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebase';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);

  // Listen for Firebase auth state changes once on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setChecking(false);
    });
    return unsubscribe; // clean up listener when component unmounts
  }, []);

  // Redirect whenever auth state or current route changes
  useEffect(() => {
    if (checking) return;

    const onAuthScreen = segments[0] === 'login' || segments[0] === 'signup';

    if (!user && !onAuthScreen) {
      // Not logged in and not already on login/signup → send to login
      router.replace('/login');
    } else if (user && onAuthScreen) {
      // Logged in but still on login/signup → send to home
      router.replace('/');
    }
  }, [user, checking, segments]);

  // Show a dark loading screen while Firebase checks the session
  if (checking) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#a78bfa" />
      </View>
    );
  }

  // Tab bar hidden for all non-main screens
  const hiddenScreen = { href: null as null, tabBarStyle: { display: 'none' as const } };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1a1a2e', borderTopColor: '#0f3460', borderTopWidth: 1 },
        tabBarActiveTintColor: '#a78bfa',
        tabBarInactiveTintColor: '#555555',
      }}
    >
      {/* ── Visible tabs ── */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📊</Text>,
        }}
      />

      {/* ── Hidden from tab bar ── */}
      <Tabs.Screen name="login"      options={hiddenScreen} />
      <Tabs.Screen name="signup"     options={hiddenScreen} />
      <Tabs.Screen name="alphabet"   options={hiddenScreen} />
      <Tabs.Screen name="greetings"  options={hiddenScreen} />
      <Tabs.Screen name="numbers"    options={hiddenScreen} />
      <Tabs.Screen name="colors"     options={hiddenScreen} />
      <Tabs.Screen name="flashcards" options={hiddenScreen} />
      <Tabs.Screen name="quiz"       options={hiddenScreen} />
      <Tabs.Screen name="family"     options={hiddenScreen} />
      <Tabs.Screen name="food"       options={hiddenScreen} />
      <Tabs.Screen name="animals"      options={hiddenScreen} />
      <Tabs.Screen name="ai-exercises" options={hiddenScreen} />
    </Tabs>
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
