import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
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

  return (
    <Stack screenOptions={{ headerShown: false }} />
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
