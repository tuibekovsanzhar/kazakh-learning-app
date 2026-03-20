import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { loadStreak } from '../utils/storage';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { saveProgress, loadProgress } from '../utils/firestore';


export default function HomeScreen() {
  const router = useRouter();
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
      console.log('Syncing streakCount to Firestore:', streakCount);
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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>Kazakh Learn</Text>
        <Text style={styles.subtitle}>Қазақша үйрен</Text>
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

      {/* Streak card */}
      <View style={styles.streakCard}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <Text style={styles.streakNumber}>{streakCount}</Text>
        <Text style={styles.streakLabel}>Day Streak</Text>
      </View>

      {/* Words mastered summary */}
      {totalMastered > 0 && (
        <Text style={styles.masteredSummary}>📚 {totalMastered} words mastered</Text>
      )}

      {/* Lesson buttons */}
      <ScrollView style={styles.lessonsSection} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Start Learning</Text>

        <TouchableOpacity style={styles.lessonButton} onPress={() => router.push('/alphabet')}>
        <Text style={styles.lessonEmoji}>🔤</Text>
        <Text style={styles.lessonText}>Kazakh Alphabet</Text>
        <Text style={styles.lessonArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.lessonButton} onPress={() => router.push('/greetings')}>
        <Text style={styles.lessonEmoji}>👋</Text>
        <Text style={styles.lessonText}>Greetings</Text>
        <Text style={styles.lessonArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.lessonButton} onPress={() => router.push('/numbers')}>
          <Text style={styles.lessonEmoji}>🔢</Text>
          <Text style={styles.lessonText}>Numbers</Text>
          <Text style={styles.lessonArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.lessonButton} onPress={() => router.push('/colors')}>
          <Text style={styles.lessonEmoji}>🎨</Text>
          <Text style={styles.lessonText}>Colors</Text>
          <Text style={styles.lessonArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.lessonButton} onPress={() => router.push('/family')}>
          <Text style={styles.lessonEmoji}>👨‍👩‍👧</Text>
          <Text style={styles.lessonText}>Family</Text>
          <Text style={styles.lessonArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.lessonButton} onPress={() => router.push('/food')}>
          <Text style={styles.lessonEmoji}>🍽️</Text>
          <Text style={styles.lessonText}>Food</Text>
          <Text style={styles.lessonArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.lessonButton} onPress={() => router.push('/animals')}>
          <Text style={styles.lessonEmoji}>🐴</Text>
          <Text style={styles.lessonText}>Animals</Text>
          <Text style={styles.lessonArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.lessonButton, styles.aiButton]} onPress={() => router.push('/ai-exercises')}>
          <Text style={styles.lessonEmoji}>✨</Text>
          <Text style={[styles.lessonText, styles.aiButtonText]}>AI Exercises</Text>
          <Text style={styles.lessonArrow}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
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
    color: '#a0a0c0',
    marginTop: 4,
  },
  streakCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  streakEmoji: {
    fontSize: 40,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#e94560',
    marginTop: 8,
  },
  streakLabel: {
    fontSize: 14,
    color: '#a0a0c0',
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
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  lessonEmoji: {
    fontSize: 24,
    marginRight: 14,
  },
  lessonText: {
    fontSize: 16,
    color: '#ffffff',
    flex: 1,
    fontWeight: '500',
  },
  lessonArrow: {
    fontSize: 18,
    color: '#e94560',
  },
  logoutBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#a78bfa',
    marginBottom: 12,
  },
  logoutText: {
    color: '#a78bfa',
    fontSize: 13,
  },
  masteredSummary: {
    color: '#a78bfa',
    fontSize: 13,
    textAlign: 'center',
    marginTop: -18,
    marginBottom: 20,
  },
  aiButton: {
    borderColor: '#a78bfa',
    backgroundColor: '#1a1040',
  },
  aiButtonText: {
    color: '#a78bfa',
  },
});