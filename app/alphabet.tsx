import { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  FlatList, Modal, SafeAreaView, Pressable
} from 'react-native';
import { kazakhAlphabet } from '../data/alphabet';

export default function AlphabetScreen() {
  const [selectedLetter, setSelectedLetter] = useState<typeof kazakhAlphabet[0] | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Kazakh Alphabet</Text>
        <Text style={styles.subtitle}>{kazakhAlphabet.length} letters • tap any to learn</Text>
      </View>

      {/* Grid */}
      <FlatList
        data={kazakhAlphabet}
        keyExtractor={(item) => item.cyrillic}
        numColumns={4}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => setSelectedLetter(item)}
          >
            <Text style={styles.cardCyrillic}>{item.cyrillic}</Text>
            <Text style={styles.cardLatin}>{item.latin}</Text>
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
                {/* Big letters */}
                <View style={styles.modalLetters}>
                  <Text style={styles.modalCyrillic}>{selectedLetter.cyrillic}</Text>
                  <Text style={styles.modalDivider}>·</Text>
                  <Text style={styles.modalLatin}>{selectedLetter.latin}</Text>
                </View>

                {/* Pronunciation */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>PRONUNCIATION</Text>
                  <Text style={styles.modalValue}>"{selectedLetter.pronunciation}"</Text>
                </View>

                {/* Example word */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>EXAMPLE WORD</Text>
                  <Text style={styles.modalExample}>{selectedLetter.example}</Text>
                  <Text style={styles.modalExampleLatin}>{selectedLetter.exampleLatin}</Text>
                  <Text style={styles.modalMeaning}>{selectedLetter.meaning}</Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedLetter(null)}
                >
                  <Text style={styles.closeButtonText}>Got it</Text>
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
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 13,
    color: '#a0a0c0',
    marginTop: 4,
  },
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: '#16213e',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  cardCyrillic: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardLatin: {
    fontSize: 12,
    color: '#e94560',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 28,
    width: '82%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  modalLetters: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
    color: '#e94560',
  },
  modalSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 11,
    color: '#a0a0c0',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  modalValue: {
    fontSize: 18,
    color: '#ffffff',
    fontStyle: 'italic',
  },
  modalExample: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  modalExampleLatin: {
    fontSize: 16,
    color: '#e94560',
    marginBottom: 4,
  },
  modalMeaning: {
    fontSize: 14,
    color: '#a0a0c0',
  },
  closeButton: {
    marginTop: 8,
    backgroundColor: '#e94560',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});