// app/colors.tsx
// Colors lesson screen — same pattern as numbers.tsx

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
import { colors } from '../data/colors';

type ColorItem = {
  id: string;
  cyrillic: string;
  latin: string;
  english: string;
  hex: string;
};

export default function ColorsScreen() {
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState<ColorItem | null>(null);

  const handlePress = (item: ColorItem) => {
    setSelectedColor(item);
  };

  const handleClose = () => {
    setSelectedColor(null);
  };

  const renderItem = ({ item }: { item: ColorItem }) => (
    <TouchableOpacity style={styles.row} onPress={() => handlePress(item)}>
      {/* Color swatch */}
      <View style={[styles.swatch, { backgroundColor: item.hex }]} />

      {/* Kazakh word */}
      <View style={styles.kazakhContainer}>
        <Text style={styles.cyrillic}>{item.cyrillic}</Text>
        <Text style={styles.latin}>{item.latin}</Text>
      </View>

      {/* English */}
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
        <Text style={styles.headerTitle}>Colors</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Tap any color to learn more</Text>

      {/* List of colors */}
      <FlatList
        data={colors}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      {/* Modal — shows when user taps a color */}
      <Modal
        visible={selectedColor !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        {/* Dark overlay */}
        <TouchableOpacity style={styles.overlay} onPress={handleClose}>
          {/* Card — activeOpacity 1 so tapping inside doesn't close it */}
          <TouchableOpacity style={styles.modalCard} activeOpacity={1}>

            {/* Big color circle */}
            <View style={[styles.modalSwatch, { backgroundColor: selectedColor?.hex }]} />

            {/* Kazakh word */}
            <Text style={styles.modalCyrillic}>{selectedColor?.cyrillic}</Text>
            <Text style={styles.modalLatin}>{selectedColor?.latin}</Text>
            <Text style={styles.modalEnglish}>{selectedColor?.english}</Text>

            {/* Close button — colored to match the selected color */}
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: selectedColor?.hex }]}
              onPress={handleClose}
            >
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
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  kazakhContainer: {
    flex: 1,
    paddingHorizontal: 14,
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
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalSwatch: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modalCyrillic: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
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
