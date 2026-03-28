import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { loadStreak } from '../utils/storage';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { saveProgress, loadProgress } from '../utils/firestore';
import { useLanguage } from '../utils/i18n';


export default function HomeScreen() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [streakCount, setStreakCount] = useState(0);
  const [totalMastered, setTotalMastered] = useState(0);

  // Load streak from local storage, then pull any cloud-saved progress
  useEffect(() => {
    loadStreak().then(({ count }) => setStreakCount(count));

    const userId = auth.currentUser?.uid;
    if (userId) {
      loadProgress(userId).then((data) => {
        if (data?.streakCount != null) setStreakCount(data.streakCount);
        if (data?.masteredCards) {
          const total = Object.values(data.masteredCards).reduce(
            (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0
          );
          setTotalMastered(total);
        }
      });
    }
  }, []);

  // Sync streak to Firestore whenever it changes
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      saveProgress(userId, { streakCount });
    }
  }, [streakCount]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const lessons = [
    { emoji: '🔤', label: t('kazakhAlphabet'), route: '/alphabet' },
    { emoji: '👋', label: t('greetings'),       route: '/greetings' },
    { emoji: '🔢', label: t('numbers'),          route: '/numbers' },
    { emoji: '🎨', label: t('colors'),           route: '/colors' },
    { emoji: '👨‍👩‍👧', label: t('family'),        route: '/family' },
    { emoji: '🍽️', label: t('food'),             route: '/food' },
    { emoji: '🐴', label: t('animals'),          route: '/animals' },
  ];

  return (
    <LinearGradient colors={['#0f0f1a', '#130f2a']} style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>{t('appName')}</Text>
        <Text style={styles.subtitle}>{t('appSubtitle')}</Text>
      </View>

      {/* Streak card */}
      <LinearGradient colors={['#1a1a3e', '#2d1b69']} style={styles.streakCard}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <Text style={styles.streakNumber}>{streakCount}</Text>
        <Text style={styles.streakLabel}>{t('dayStreak')}</Text>
      </LinearGradient>

      {/* Words mastered summary */}
      {totalMastered > 0 && (
        <Text style={styles.masteredSummary}>
          📚 {totalMastered} {t('wordsMastered')}
        </Text>
      )}

      {/* Lesson buttons */}
      <ScrollView style={styles.lessonsSection} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{t('startLearning')}</Text>

        {lessons.map(({ emoji, label, route }) => (
          <TouchableOpacity key={route} activeOpacity={0.8} onPress={() => router.push(route)}>
            <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.lessonButton}>
              <View style={styles.emojiPill}>
                <Text style={styles.lessonEmoji}>{emoji}</Text>
              </View>
              <Text style={styles.lessonText}>{label}</Text>
              <Text style={styles.lessonArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/ai-exercises')}>
          <LinearGradient colors={['#1a1040', '#2d1b69']} style={[styles.lessonButton, styles.aiButton]}>
            <View style={[styles.emojiPill, styles.aiEmojiPill]}>
              <Text style={styles.lessonEmoji}>✨</Text>
            </View>
            <Text style={[styles.lessonText, styles.aiButtonText]}>{t('aiExercises')}</Text>
            <Text style={[styles.lessonArrow, styles.aiButtonText]}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Language switcher */}
        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setLanguage(language === 'en' ? 'ru' : 'en')}
        >
          <Text style={styles.langText}>
            {language === 'en' ? '🇷🇺 Русский' : '🇬🇧 English'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
          <Text style={styles.signOutText}>{t('signOut')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#a78bfa',
    marginTop: 4,
  },
  streakCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#a78bfa',
    overflow: 'hidden',
  },
  streakEmoji: {
    fontSize: 40,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
  },
  streakLabel: {
    fontSize: 14,
    color: '#c4b5fd',
    marginTop: 4,
  },
  lessonsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  lessonButton: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#a78bfa',
    overflow: 'hidden',
  },
  emojiPill: {
    backgroundColor: '#2d1b69',
    borderRadius: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  lessonEmoji: {
    fontSize: 22,
  },
  lessonText: {
    fontSize: 16,
    color: '#ffffff',
    flex: 1,
    fontWeight: '500',
  },
  lessonArrow: {
    fontSize: 18,
    color: '#a78bfa',
  },
  masteredSummary: {
    color: '#a78bfa',
    fontSize: 13,
    textAlign: 'center',
    marginTop: -18,
    marginBottom: 20,
  },
  aiButton: {
    borderLeftColor: '#c4b5fd',
  },
  aiEmojiPill: {
    backgroundColor: '#3d1f8a',
  },
  aiButtonText: {
    color: '#c4b5fd',
  },
  langBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  langText: {
    color: '#6b7280',
    fontSize: 14,
  },
  signOutBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  signOutText: {
    color: '#6b7280',
    fontSize: 14,
  },
});
