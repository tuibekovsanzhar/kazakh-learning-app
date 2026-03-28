import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  StyleSheet, Text, View, TouchableOpacity,
  FlatList, Modal, SafeAreaView, Pressable
} from 'react-native';
import { kazakhAlphabet } from '../data/alphabet';
import { playSound } from '../utils/audio';
import { useLanguage } from '../utils/i18n';

export default function AlphabetScreen() {
  const [selectedLetter, setSelectedLetter] = useState<typeof kazakhAlphabet[0] | null>(null);
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('kazakhAlphabet')}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <Text style={styles.subtitle}>{t('lettersSubtitle')}</Text>

      {/* Grid */}
      <FlatList
        data={kazakhAlphabet}
        keyExtractor={(item) => item.cyrillic}
        numColumns={4}
        contentContainerStyle={styles.grid}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => setSelectedLetter(item)}
          >
            <Text style={styles.cardCyrillic}>{item.cyrillic}</Text>
            <Text style={styles.cardLatin}>{item.latin}</Text>
            <TouchableOpacity
              style={styles.speakerBtn}
              onPress={() => playSound(`letter_${String(index + 1).padStart(2, '0')}.mp3`)}
            >
              <Text style={styles.speakerIcon}>🔊</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* Modal popup */}
      <Modal
        visible={selectedLetter !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedLetter(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedLetter(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {selectedLetter && (
              <>
                {/* Hero: big letter display */}
                <View style={styles.modalLetters}>
                  <Text style={styles.modalCyrillic}>{selectedLetter.cyrillic}</Text>
                  <Text style={styles.modalDivider}>·</Text>
                  <Text style={styles.modalLatin}>{selectedLetter.latin}</Text>
                </View>

                {/* Pronunciation + 🔊 */}
                <View style={styles.modalPronSection}>
                  <Text style={styles.modalLabel}>{t('pronunciation')}</Text>
                  <View style={styles.modalPronRow}>
                    <Text style={styles.modalValue}>"{selectedLetter.pronunciation}"</Text>
                    <TouchableOpacity
                      style={styles.modalSpeakerBtn}
                      onPress={() => {
                        const idx = kazakhAlphabet.findIndex(l => l.cyrillic === selectedLetter.cyrillic);
                        playSound(`letter_${String(idx + 1).padStart(2, '0')}.mp3`);
                      }}
                    >
                      <Text style={styles.modalSpeakerIcon}>🔊</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Section divider */}
                <View style={styles.modalSectionDivider} />

                {/* noSound notice for ъ and ь */}
                {selectedLetter.noSound ? (
                  <View style={styles.noSoundBox}>
                    <Text style={styles.noSoundText}>{t('noSoundNotice')}</Text>
                  </View>
                ) : null}

                {/* Example word */}
                <View style={styles.modalExampleSection}>
                  <Text style={styles.modalExampleWord}>{selectedLetter.example}</Text>
                  <Text style={styles.modalExampleLatin}>{selectedLetter.exampleLatin}</Text>
                  <Text style={styles.modalExampleMeaning}>{selectedLetter.meaning}</Text>
                  {selectedLetter.note ? (
                    <Text style={styles.modalNote}>{selectedLetter.note}</Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedLetter(null)}
                >
                  <Text style={styles.closeButtonText}>{t('gotIt')}</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#a78bfa',
    fontSize: 16,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 60,
  },
  subtitle: {
    fontSize: 13,
    color: '#a0a0c0',
    textAlign: 'center',
    marginBottom: 8,
  },
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  cardCyrillic: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardLatin: {
    fontSize: 12,
    color: '#a78bfa',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 28,
    width: '82%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  modalLetters: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  modalCyrillic: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalDivider: {
    fontSize: 40,
    color: '#a0a0c0',
    marginHorizontal: 12,
  },
  modalLatin: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#a78bfa',
  },
  modalLabel: {
    fontSize: 11,
    color: '#a0a0c0',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  modalPronSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 28,
  },
  modalPronRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalValue: {
    fontSize: 17,
    color: '#ffffff',
    fontStyle: 'italic',
  },
  modalSpeakerBtn: {
    padding: 4,
  },
  modalSpeakerIcon: {
    fontSize: 16,
  },
  modalSectionDivider: {
    height: 1,
    backgroundColor: '#ffffff15',
    width: '100%',
    marginBottom: 20,
  },
  modalExampleSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalExampleWord: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 3,
  },
  modalExampleLatin: {
    fontSize: 13,
    color: '#a78bfa',
    marginBottom: 3,
  },
  modalExampleMeaning: {
    fontSize: 13,
    color: '#9ca3af',
  },
  modalNote: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  closeButton: {
    marginTop: 4,
    backgroundColor: '#a78bfa',
    borderRadius: 12,
    paddingVertical: 13,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noSoundBox: {
    backgroundColor: '#1e1e3a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    width: '100%',
  },
  noSoundText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
  speakerBtn: {
    marginTop: 6,
    padding: 2,
  },
  speakerIcon: {
    fontSize: 11,
  },
});
