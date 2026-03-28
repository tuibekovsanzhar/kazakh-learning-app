import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Modal, SafeAreaView, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { animalWords } from '../data/animals';
import { useLanguage } from '../utils/i18n';

type WordItem = { kazakh: string; latin: string; english: string; note: string };

export default function AnimalsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [selected, setSelected] = useState<WordItem | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>{t('goBack')}</Text>
      </TouchableOpacity>
      <Text style={styles.title}>🐴 {t('animals')}</Text>
      <Text style={styles.subtitle}>{animalWords.length} {t('words')}</Text>

      <View style={styles.practiceRow}>
        <TouchableOpacity
          style={styles.flashcardsBtn}
          onPress={() => router.push({ pathname: '/flashcards' as any, params: { deck: 'animals', title: t('animals'), from: '/animals' } })}
        >
          <Text style={styles.flashcardsBtnText}>🃏 {t('flashcards')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quizBtn}
          onPress={() => router.push({ pathname: '/quiz' as any, params: { deck: 'animals', title: t('animals'), from: '/animals' } })}
        >
          <Text style={styles.quizBtnText}>🧠 {t('takeQuiz')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={animalWords}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => setSelected(item)}>
            <View style={styles.rowLeft}>
              <Text style={styles.kazakh}>{item.kazakh}</Text>
              <Text style={styles.latin}>{item.latin}</Text>
            </View>
            <Text style={styles.english}>{item.english}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      <Modal visible={!!selected} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalKazakh}>{selected?.kazakh}</Text>
            <Text style={styles.modalLatin}>{selected?.latin}</Text>
            <Text style={styles.modalEnglish}>{selected?.english}</Text>
            <View style={styles.divider} />
            <Text style={styles.noteLabel}>💡 Note</Text>
            <Text style={styles.noteText}>{selected?.note}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
              <Text style={styles.closeBtnText}>{t('gotIt')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', textAlign: 'center', marginTop: 20 },
  subtitle: { fontSize: 14, color: '#a78bfa', textAlign: 'center', marginBottom: 16 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1a1a2e', marginHorizontal: 16, marginBottom: 8,
    borderRadius: 12, padding: 14,
  },
  rowLeft: { flex: 1 },
  kazakh: { fontSize: 18, fontWeight: '600', color: '#fff' },
  latin: { fontSize: 13, color: '#a78bfa', marginTop: 2 },
  english: { fontSize: 15, color: '#94a3b8', fontStyle: 'italic' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modal: {
    backgroundColor: '#1a1a2e', borderRadius: 20, padding: 28,
    width: '85%', alignItems: 'center', borderWidth: 1, borderColor: '#a78bfa33',
  },
  modalKazakh: { fontSize: 36, fontWeight: '700', color: '#fff', marginBottom: 6 },
  modalLatin: { fontSize: 18, color: '#a78bfa', marginBottom: 4 },
  modalEnglish: { fontSize: 20, color: '#e2e8f0', marginBottom: 16 },
  divider: { height: 1, backgroundColor: '#ffffff22', width: '100%', marginBottom: 16 },
  noteLabel: { fontSize: 13, color: '#a78bfa', fontWeight: '600', marginBottom: 6 },
  noteText: { fontSize: 15, color: '#94a3b8', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  closeBtn: { backgroundColor: '#a78bfa', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32 },
  closeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  backBtn: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  backBtnText: { color: '#a78bfa', fontSize: 16, fontWeight: '600' },
  practiceRow: { flexDirection: 'row' as const, marginHorizontal: 16, marginBottom: 12, gap: 8 },
  flashcardsBtn: {
    flex: 1, backgroundColor: '#1a1a2e', borderRadius: 12,
    paddingVertical: 13, alignItems: 'center' as const, borderWidth: 1, borderColor: '#a78bfa',
  },
  flashcardsBtnText: { color: '#a78bfa', fontWeight: '600' as const, fontSize: 13 },
  quizBtn: {
    flex: 1, backgroundColor: '#1a1a2e', borderRadius: 12,
    paddingVertical: 13, alignItems: 'center' as const, borderWidth: 1, borderColor: '#a78bfa',
  },
  quizBtnText: { color: '#a78bfa', fontWeight: '600' as const, fontSize: 13 },
});
