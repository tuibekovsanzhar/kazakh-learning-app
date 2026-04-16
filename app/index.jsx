import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadStreak } from '../utils/storage';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { saveProgress, loadProgress } from '../utils/firestore';
import { useLanguage } from '../utils/i18n';
import {
  NOTIF_ASKED_KEY,
  getNotificationSettings,
  getPermissionStatus,
  requestPermission,
  scheduleDailyNotification,
  setupAndroidChannel,
} from '../utils/notifications';


export default function HomeScreen() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [streakCount, setStreakCount] = useState(0);
  const [totalMastered, setTotalMastered] = useState(0);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Show permission modal once on first launch; reschedule notifications on every open
  useEffect(() => {
    const initNotifications = async () => {
      const asked = await AsyncStorage.getItem(NOTIF_ASKED_KEY);
      if (!asked) {
        setShowPermissionModal(true);
        return;
      }
      // Already decided — reschedule with fresh random message if enabled + granted
      const settings = await getNotificationSettings();
      if (!settings.enabled) return;
      const status = await getPermissionStatus();
      if (status !== 'granted') return;
      await setupAndroidChannel();
      await scheduleDailyNotification(settings.hour, settings.minute, language);
    };
    initNotifications();
  }, []);

  const handleAllowNotifications = async () => {
    setShowPermissionModal(false);
    await AsyncStorage.setItem(NOTIF_ASKED_KEY, 'true');
    await setupAndroidChannel();
    const status = await requestPermission();
    if (status === 'granted') {
      const settings = await getNotificationSettings();
      await scheduleDailyNotification(settings.hour, settings.minute, language);
    }
  };

  const handleSkipNotifications = async () => {
    setShowPermissionModal(false);
    await AsyncStorage.setItem(NOTIF_ASKED_KEY, 'skipped');
  };

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

      {/* Permission modal — shown once on first launch */}
      <Modal visible={showPermissionModal} transparent animationType="fade">
        <View style={styles.permOverlay}>
          <View style={styles.permBox}>
            <Text style={styles.permEmoji}>🔥</Text>
            <Text style={styles.permTitle}>{t('notifPermissionTitle')}</Text>
            <Text style={styles.permBody}>{t('notifPermissionBody')}</Text>
            <TouchableOpacity style={styles.permAllowBtn} onPress={handleAllowNotifications}>
              <Text style={styles.permAllowText}>{t('notifPermissionAllow')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.permSkipBtn} onPress={handleSkipNotifications}>
              <Text style={styles.permSkipText}>{t('notifPermissionSkip')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <View style={styles.headerCenter}>
          <Text style={styles.appName}>{t('appName')}</Text>
          <Text style={styles.subtitle}>{t('appSubtitle')}</Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/settings')}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerSpacer: {
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  settingsBtn: {
    width: 40,
    alignItems: 'flex-end',
  },
  settingsIcon: {
    fontSize: 22,
  },

  // Permission modal
  permOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  permBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  permEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  permTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  permBody: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  permAllowBtn: {
    backgroundColor: '#a78bfa',
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  permAllowText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  permSkipBtn: {
    padding: 10,
  },
  permSkipText: {
    color: '#6b7280',
    fontSize: 14,
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
