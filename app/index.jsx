import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';


export default function HomeScreen() {
  const router = useRouter(); 
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>Kazakh Learn</Text>
        <Text style={styles.subtitle}>Қазақша үйрен</Text>
      </View>

      {/* Streak card */}
      <View style={styles.streakCard}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <Text style={styles.streakNumber}>0</Text>
        <Text style={styles.streakLabel}>Day Streak</Text>
      </View>

      {/* Lesson buttons */}
      <View style={styles.lessonsSection}>
        <Text style={styles.sectionTitle}>Start Learning</Text>

        <TouchableOpacity style={styles.lessonButton} onPress={() => router.push('/alphabet')}>
        <Text style={styles.lessonEmoji}>🔤</Text>
        <Text style={styles.lessonText}>Kazakh Alphabet</Text>
        <Text style={styles.lessonArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.lessonButton}>
          <Text style={styles.lessonEmoji}>👋</Text>
          <Text style={styles.lessonText}>Greetings</Text>
          <Text style={styles.lessonArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.lessonButton}>
          <Text style={styles.lessonEmoji}>🔢</Text>
          <Text style={styles.lessonText}>Numbers</Text>
          <Text style={styles.lessonArrow}>→</Text>
        </TouchableOpacity>
      </View>
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
});