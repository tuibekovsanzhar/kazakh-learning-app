// app/numbers.tsx
// Numbers lesson screen — same pattern as greetings.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { numbers } from '../data/numbers';

// TypeScript type — describes what shape each number object has
type NumberItem = {
  id: string;
  cyrillic: string;
  latin: string;
  english: string;
  digit: string;
};

export default function NumbersScreen() {
  const router = useRouter();

  // selectedNumber holds whichever number the user tapped (or null if none)
  const [selectedNumber, setSelectedNumber] = useState<NumberItem | null>(null);

  // Called when user taps a row — opens the modal
  const handlePress = (item: NumberItem) => {
    setSelectedNumber(item);
  };

  // Called when user taps the X or outside the modal — closes it
  const handleClose = () => {
    setSelectedNumber(null);
  };

  // Renders each row in the list
  const renderItem = ({ item }: { item: NumberItem }) => (
    <TouchableOpacity style={styles.row} onPress={() => handlePress(item)}>
      {/* Left: the digit (0, 1, 2...) */}
      <Text style={styles.digit}>{item.digit}</Text>

      {/* Middle: Kazakh word */}
      <View style={styles.kazakhContainer}>
        <Text style={styles.cyrillic}>{item.cyrillic}</Text>
        <Text style={styles.latin}>{item.latin}</Text>
      </View>

      {/* Right: English */}
      <Text style={styles.english}>{item.english}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Numbers</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Tap any number to learn more</Text>

      {/* Practice shortcuts row */}
      <View style={styles.practiceRow}>
        <TouchableOpacity
          style={styles.flashcardsBtn}
          onPress={() => router.push({ pathname: '/flashcards' as any, params: { deck: 'numbers', title: 'Numbers', from: '/numbers' } })}
        >
          <Text style={styles.flashcardsBtnText}>🃏 Flashcards</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quizBtn}
          onPress={() => router.push({ pathname: '/quiz' as any, params: { deck: 'numbers', title: 'Numbers', from: '/numbers' } })}
        >
          <Text style={styles.quizBtnText}>🧠 Take Quiz</Text>
        </TouchableOpacity>
      </View>

      {/* The list of numbers */}
      <FlatList
        data={numbers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      {/* Modal — shows when user taps a number */}
      <Modal
        visible={selectedNumber !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        {/* Dark overlay behind the modal */}
        <TouchableOpacity style={styles.overlay} onPress={handleClose}>
          {/* The white card — stopPropagation prevents tap from closing modal */}
          <TouchableOpacity style={styles.modalCard} activeOpacity={1}>

            {/* Big digit display */}
            <Text style={styles.modalDigit}>{selectedNumber?.digit}</Text>

            {/* Kazakh word in big text */}
            <Text style={styles.modalCyrillic}>{selectedNumber?.cyrillic}</Text>
            <Text style={styles.modalLatin}>{selectedNumber?.latin}</Text>
            <Text style={styles.modalEnglish}>{selectedNumber?.english}</Text>

            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>Got it ✓</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a', // same dark theme as your other screens
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
    color: '#a78bfa', // purple accent — matches your home screen
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
    width: 60, // balances the back button so title stays centered
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  digit: {
    color: '#a78bfa',
    fontSize: 20,
    fontWeight: 'bold',
    width: 70, // fixed width so all words line up
    textAlign: 'center',
  },
  kazakhContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  cyrillic: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  latin: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 2,
  },
  english: {
    color: '#6b7280',
    fontSize: 14,
    width: 80,
    textAlign: 'right',
  },
  practiceRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  flashcardsBtn: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a78bfa',
  },
  flashcardsBtnText: {
    color: '#a78bfa',
    fontWeight: '600',
    fontSize: 13,
  },
  quizBtn: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a78bfa',
  },
  quizBtnText: {
    color: '#a78bfa',
    fontWeight: '600',
    fontSize: 13,
  },

  // Modal styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 32,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a78bfa',
  },
  modalDigit: {
    color: '#a78bfa',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalCyrillic: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalLatin: {
    color: '#9ca3af',
    fontSize: 18,
    marginBottom: 8,
  },
  modalEnglish: {
    color: '#6b7280',
    fontSize: 16,
    marginBottom: 24,
  },
  closeButton: {
    backgroundColor: '#a78bfa',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});