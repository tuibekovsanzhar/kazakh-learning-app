import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Switch, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../utils/i18n';
import {
  getNotificationSettings,
  saveNotificationSettings,
  scheduleDailyNotification,
  cancelAllNotifications,
  getPermissionStatus,
  requestPermission,
  setupAndroidChannel,
} from '../utils/notifications';

export default function SettingsScreen() {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [enabled, setEnabled]   = useState(true);
  const [hour, setHour]         = useState(9);
  const [minute, setMinute]     = useState(0);
  const [saved, setSaved]       = useState(false);
  const [permDenied, setPermDenied] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    getNotificationSettings().then(({ enabled, hour, minute }) => {
      setEnabled(enabled);
      setHour(hour);
      setMinute(minute);
    });
    getPermissionStatus().then((status) => {
      if (status === 'denied') setPermDenied(true);
    });
  }, []);

  // ── Time picker helpers ───────────────────────────────────────────────────

  const changeHour = (delta: number) => {
    setHour(h => (h + delta + 24) % 24);
    setSaved(false);
  };

  const changeMinute = (delta: number) => {
    // 5-minute steps, wrap at 0/55
    setMinute(m => (m + delta + 60) % 60);
    setSaved(false);
  };

  const formatTwo = (n: number) => String(n).padStart(2, '0');

  // ── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    await saveNotificationSettings({ enabled, hour, minute });

    if (enabled) {
      // Request permission if not yet granted
      const status = await getPermissionStatus();
      let finalStatus = status;
      if (status === 'undetermined') {
        await setupAndroidChannel();
        finalStatus = await requestPermission();
      }
      if (finalStatus === 'granted') {
        await setupAndroidChannel();
        await scheduleDailyNotification(hour, minute, language);
        setPermDenied(false);
      } else {
        setPermDenied(true);
      }
    } else {
      await cancelAllNotifications();
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{t('goBack')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚙️ {t('settings')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>

        {/* ── Notifications section ── */}
        <Text style={styles.sectionLabel}>{t('notifications')}</Text>

        <View style={styles.card}>
          {/* Toggle row */}
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleTitle}>{t('dailyReminder')}</Text>
              <Text style={styles.toggleSubtitle}>
                {enabled ? t('notifEnabled') : t('notifDisabled')}
              </Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={(v) => { setEnabled(v); setSaved(false); }}
              trackColor={{ false: '#2a2a4a', true: '#7c3aed' }}
              thumbColor={enabled ? '#a78bfa' : '#555577'}
            />
          </View>

          {/* Time picker — only shown when enabled */}
          {enabled && (
            <>
              <View style={styles.divider} />

              <Text style={styles.timeLabel}>{t('reminderTime')}</Text>

              <View style={styles.timePicker}>
                {/* Hour */}
                <View style={styles.timeUnit}>
                  <TouchableOpacity style={styles.arrowBtn} onPress={() => changeHour(1)}>
                    <Text style={styles.arrowText}>▲</Text>
                  </TouchableOpacity>
                  <Text style={styles.timeValue}>{formatTwo(hour)}</Text>
                  <TouchableOpacity style={styles.arrowBtn} onPress={() => changeHour(-1)}>
                    <Text style={styles.arrowText}>▼</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.timeSeparator}>:</Text>

                {/* Minute — steps of 5 */}
                <View style={styles.timeUnit}>
                  <TouchableOpacity style={styles.arrowBtn} onPress={() => changeMinute(5)}>
                    <Text style={styles.arrowText}>▲</Text>
                  </TouchableOpacity>
                  <Text style={styles.timeValue}>{formatTwo(minute)}</Text>
                  <TouchableOpacity style={styles.arrowBtn} onPress={() => changeMinute(-5)}>
                    <Text style={styles.arrowText}>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Permission denied notice */}
        {permDenied && (
          <Text style={styles.permDeniedText}>
            {Platform.OS === 'ios'
              ? '⚠️ Notifications are blocked. Go to Settings → Qazaq Tili → Notifications to enable.'
              : '⚠️ Notifications are blocked. Go to phone Settings → Apps → Qazaq Tili → Notifications to enable.'}
          </Text>
        )}

        {/* Save button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{t('saveSettings')}</Text>
        </TouchableOpacity>

        {saved && (
          <Text style={styles.savedText}>✓ {t('settingsSaved')}</Text>
        )}

      </View>
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
  backButton: { padding: 8 },
  backText: { color: '#a78bfa', fontSize: 16 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSpacer: { width: 60 },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  sectionLabel: {
    color: '#a78bfa',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },

  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },

  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleSubtitle: {
    color: '#6b7280',
    fontSize: 13,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: '#2a2a4a',
    marginVertical: 16,
  },

  timeLabel: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },

  timePicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  timeUnit: {
    alignItems: 'center',
    gap: 8,
  },
  arrowBtn: {
    backgroundColor: '#2a2a4a',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  arrowText: {
    color: '#a78bfa',
    fontSize: 16,
  },
  timeValue: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    minWidth: 60,
    textAlign: 'center',
  },
  timeSeparator: {
    color: '#a78bfa',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
  },

  permDeniedText: {
    color: '#f87171',
    fontSize: 13,
    marginTop: 16,
    lineHeight: 20,
    textAlign: 'center',
  },

  saveBtn: {
    backgroundColor: '#a78bfa',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 32,
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },

  savedText: {
    color: '#22c55e',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
});
