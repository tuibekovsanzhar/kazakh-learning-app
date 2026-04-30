// Badges screen — 3-column grid of all achievement badges.
// Unlocked: full color + unlock date. Locked: dimmed + 🔒.

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../utils/i18n';
import { auth } from '../utils/firebase';
import { BADGES, loadAchievements } from '../utils/achievements';

type UnlockedIds = Record<string, string>; // { badgeId: isoTimestamp }

export default function BadgesScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [unlockedIds, setUnlockedIds] = useState<UnlockedIds>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<typeof BADGES[0] | null>(null);

  useEffect(() => {
    const userId = auth.currentUser?.uid ?? null;
    loadAchievements(userId).then((data) => {
      setUnlockedIds(data.unlockedIds);
      setLoading(false);
    });
  }, []);

  const unlockedCount = BADGES.filter((b) => !!unlockedIds[b.id]).length;

  const renderBadge = ({ item }: { item: typeof BADGES[0] }) => {
    const isUnlocked = !!unlockedIds[item.id];
    return (
      <TouchableOpacity
        style={[styles.badge, isUnlocked ? styles.badgeUnlocked : styles.badgeLocked]}
        onPress={() => setSelected(item)}
        activeOpacity={0.75}
      >
        <Text style={[styles.badgeIcon, !isUnlocked && styles.badgeIconLocked]}>
          {item.icon}
        </Text>
        <Text
          style={[styles.badgeTitle, !isUnlocked && styles.badgeTitleLocked]}
          numberOfLines={2}
        >
          {isUnlocked ? t(item.titleKey as any) : '🔒'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{t('goBack')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('badges')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress count */}
      <Text style={styles.progressText}>
        {unlockedCount} / {BADGES.length} {t('badgesProgress')}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#a78bfa" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={BADGES}
          keyExtractor={(b) => b.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          renderItem={renderBadge}
        />
      )}

      {/* Detail modal */}
      <Modal
        transparent
        animationType="fade"
        visible={!!selected}
        onRequestClose={() => setSelected(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelected(null)}
        >
          {selected && (() => {
            const isUnlocked = !!unlockedIds[selected.id];
            const ts = unlockedIds[selected.id];
            const dateStr = ts
              ? new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
              : null;
            return (
              <View style={styles.detailCard}>
                <Text style={[styles.detailIcon, !isUnlocked && styles.badgeIconLocked]}>
                  {isUnlocked ? selected.icon : '🔒'}
                </Text>
                <Text style={styles.detailTitle}>
                  {isUnlocked ? t(selected.titleKey as any) : t('locked')}
                </Text>
                <Text style={styles.detailDesc}>
                  {t(selected.descKey as any)}
                </Text>
                {isUnlocked && dateStr && (
                  <Text style={styles.detailDate}>
                    {t('unlockedOn')}: {dateStr}
                  </Text>
                )}
              </View>
            );
          })()}
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { padding: 8 },
  backText: { color: '#a78bfa', fontSize: 16 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSpacer: { width: 60 },

  progressText: {
    color: '#a78bfa',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },

  grid: {
    paddingHorizontal: 12,
    paddingBottom: 32,
  },

  badge: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 110,
    justifyContent: 'center',
  },
  badgeUnlocked: {
    backgroundColor: '#1a1a2e',
    borderColor: '#a78bfa',
  },
  badgeLocked: {
    backgroundColor: '#111120',
    borderColor: '#2a2a3a',
  },
  badgeIcon: {
    fontSize: 38,
    marginBottom: 8,
  },
  badgeIconLocked: {
    opacity: 0.25,
  },
  badgeTitle: {
    color: '#c4b5fd',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 15,
  },
  badgeTitleLocked: {
    color: '#374151',
    fontSize: 20,
  },

  // Detail modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  detailCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  detailIcon: { fontSize: 72, marginBottom: 16 },
  detailTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  detailDesc: {
    color: '#9ca3af',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  detailDate: {
    color: '#a78bfa',
    fontSize: 13,
    marginTop: 16,
  },
});
