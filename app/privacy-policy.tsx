import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last updated: March 2026</Text>

        <Section title="1. Overview">
          Qazaq Tili ("the App", "we", "us") is a Kazakh language learning application.
          This Privacy Policy explains what information we collect, how we use it, and
          your rights regarding your data.
        </Section>

        <Section title="2. Data We Collect">
          We collect only the minimum data needed to provide the service:{'\n\n'}
          • <Text style={styles.bold}>Email address</Text> — collected when you create
          an account. Used solely for authentication and account recovery.{'\n\n'}
          • <Text style={styles.bold}>Learning progress data</Text> — includes your
          streak count, flashcard mastery marks, and quiz scores. This data is stored
          so your progress is preserved across sessions and synced across your devices.{'\n\n'}
          We do not collect your name, phone number, location, contacts, or any other
          personal information.
        </Section>

        <Section title="3. How We Use Your Data">
          • To create and authenticate your account{'\n'}
          • To save and sync your learning progress across devices{'\n'}
          • To display your streak and statistics inside the App{'\n\n'}
          We do not use your data for advertising, profiling, or any purpose beyond
          operating the App.
        </Section>

        <Section title="4. Third-Party Services">
          The App uses the following services provided by Google:{'\n\n'}
          • <Text style={styles.bold}>Firebase Authentication</Text> — handles secure
          sign-in and account management. Your email address is stored by Firebase.{'\n\n'}
          • <Text style={styles.bold}>Cloud Firestore</Text> — stores your learning
          progress data. Data is stored in Google's cloud infrastructure.{'\n\n'}
          Google's privacy practices are governed by Google's Privacy Policy at
          policies.google.com/privacy.
        </Section>

        <Section title="5. Data Sharing">
          We do not sell, rent, or share your personal data with any third parties
          for their own purposes. Your data is shared only with Firebase/Google as
          described above, solely to operate the App.
        </Section>

        <Section title="6. Data Retention">
          Your account and progress data are retained as long as your account exists.
          You may request deletion of your data at any time by contacting us at the
          email address below. We will delete your account and all associated data
          within 30 days of your request.
        </Section>

        <Section title="7. Security">
          We rely on Firebase's industry-standard security infrastructure. Passwords
          are never stored by us — Firebase handles authentication securely. We do
          not have access to your password.
        </Section>

        <Section title="8. Children's Privacy">
          The App is not directed at children under the age of 13. We do not knowingly
          collect personal information from children under 13. If you believe a child
          has provided us with personal information, please contact us and we will
          delete it promptly.
        </Section>

        <Section title="9. Changes to This Policy">
          We may update this Privacy Policy from time to time. Any changes will be
          reflected in the "Last updated" date above. Continued use of the App after
          changes constitutes acceptance of the updated policy.
        </Section>

        <Section title="10. Contact Us">
          If you have questions about this Privacy Policy or wish to request data
          deletion, please contact:{'\n\n'}
          <Text style={styles.email}>tuibekov.sanzhar@gmail.com</Text>
        </Section>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  backButton: { paddingRight: 12, paddingVertical: 4 },
  backText: { color: '#a78bfa', fontSize: 16, fontWeight: '600' },
  headerTitle: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 17, fontWeight: '700' },
  headerSpacer: { width: 52 },
  scroll: { flex: 1, paddingHorizontal: 24 },
  updated: { color: '#6b7280', fontSize: 13, marginTop: 20, marginBottom: 8 },
  section: { marginTop: 28 },
  sectionTitle: {
    color: '#a78bfa',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  sectionBody: { color: '#cbd5e1', fontSize: 14, lineHeight: 22 },
  bold: { color: '#e2e8f0', fontWeight: '600' },
  email: { color: '#a78bfa', fontWeight: '600' },
  bottomPad: { height: 48 },
});
