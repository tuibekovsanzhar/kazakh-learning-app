import { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  FlatList, Modal, SafeAreaView, Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import { greetings } from '../data/greetings';

export default function GreetingsScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<typeof greetings[0] | null>(null);

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>👋 Greetings</Text>
        <View style={styles.headerSpacer} />
      </View>
      <Text style={styles.subtitle}>{greetings.length} phrases • tap any to learn</Text>

      {/* List */}
      <FlatList
        data={greetings}
        keyExtractor={(item) => item.kazakh}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => setSelected(item)}
          >
            <View style={styles.rowLeft}>
              <Text style={styles.rowKazakh}>{item.kazakh}</Text>
              <Text style={styles.rowLatin}>{item.latin}</Text>
            </View>
            <Text style={styles.rowEnglish}>{item.english}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Modal */}
      <Modal
        visible={selected !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.overlay} onPress={() => setSelected(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {selected && (
              <>
                <Text style={styles.modalKazakh}>{selected.kazakh}</Text>
                <Text style={styles.modalLatin}>{selected.latin}</Text>
                <Text style={styles.modalEnglish}>{selected.english}</Text>

                <View style={styles.divider} />

                <Text style={styles.usageLabel}>WHEN TO USE</Text>
                <Text style={styles.usageText}>{selected.usage}</Text>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelected(null)}
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
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  rowLeft: {
    flex: 1,
  },
  rowKazakh: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  rowLatin: {
    fontSize: 13,
    color: '#a78bfa',
    marginTop: 2,
  },
  rowEnglish: {
    fontSize: 14,
    color: '#a0a0c0',
    textAlign: 'right',
    maxWidth: '40%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 28,
    width: '85%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  modalKazakh: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  modalLatin: {
    fontSize: 18,
    color: '#a78bfa',
    marginTop: 6,
  },
  modalEnglish: {
    fontSize: 16,
    color: '#a0a0c0',
    marginTop: 4,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#2a2a4a',
    marginVertical: 20,
  },
  usageLabel: {
    fontSize: 11,
    color: '#a0a0c0',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  usageText: {
    fontSize: 15,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 22,
  },
  closeButton: {
    marginTop: 24,
    backgroundColor: '#a78bfa',
    borderRadius: 12,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});