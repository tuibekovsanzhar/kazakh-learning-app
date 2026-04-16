import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ─── Storage keys ─────────────────────────────────────────────────────────────

export const NOTIF_ASKED_KEY   = 'notifAsked';    // 'true' | 'skipped'
export const NOTIF_ENABLED_KEY = 'notifEnabled';  // 'true' | 'false'
export const NOTIF_HOUR_KEY    = 'notifHour';     // '0'-'23'
export const NOTIF_MINUTE_KEY  = 'notifMinute';   // '0'-'55'

export const DEFAULT_HOUR   = 9;
export const DEFAULT_MINUTE = 0;

// ─── Notification messages ────────────────────────────────────────────────────

const MESSAGES = {
  en: [
    "Your Kazakh streak is waiting! 🔥 Keep it going",
    "5 minutes of Kazakh today keeps forgetting away 🇰🇿",
    "Don't break your streak! Open Qazaq Tili now",
    "New day, new Kazakh words waiting for you 📚",
    "Сәлем! Time for your daily Kazakh practice",
  ],
  ru: [
    "Твоя серия ждёт! 🔥 Не прерывай streak",
    "5 минут казахского в день — и язык твой 🇰🇿",
    "Не теряй серию! Открой Qazaq Tili",
    "Новый день — новые казахские слова 📚",
    "Сәлем! Время для ежедневной практики",
  ],
};

function pickMessage(language) {
  const pool = MESSAGES[language] ?? MESSAGES.en;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Configure foreground notification display ────────────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// ─── Android channel ──────────────────────────────────────────────────────────

export async function setupAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('daily-reminder', {
    name: 'Daily Practice Reminder',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

// ─── Permissions ──────────────────────────────────────────────────────────────

export async function getPermissionStatus() {
  const { status } = await Notifications.getPermissionsAsync();
  return status; // 'granted' | 'denied' | 'undetermined'
}

export async function requestPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status;
}

// ─── Schedule / cancel ────────────────────────────────────────────────────────

export async function scheduleDailyNotification(hour, minute, language) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Qazaq Tili',
      body: pickMessage(language),
      data: { screen: 'home' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: 'daily-reminder', // Android only, ignored on iOS
    },
  });
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ─── Settings persistence ─────────────────────────────────────────────────────

export async function getNotificationSettings() {
  const [enabled, hour, minute] = await Promise.all([
    AsyncStorage.getItem(NOTIF_ENABLED_KEY),
    AsyncStorage.getItem(NOTIF_HOUR_KEY),
    AsyncStorage.getItem(NOTIF_MINUTE_KEY),
  ]);
  return {
    enabled: enabled !== 'false',                          // default: true
    hour:    hour   != null ? parseInt(hour)   : DEFAULT_HOUR,
    minute:  minute != null ? parseInt(minute) : DEFAULT_MINUTE,
  };
}

export async function saveNotificationSettings({ enabled, hour, minute }) {
  await Promise.all([
    AsyncStorage.setItem(NOTIF_ENABLED_KEY, String(enabled)),
    AsyncStorage.setItem(NOTIF_HOUR_KEY,    String(hour)),
    AsyncStorage.setItem(NOTIF_MINUTE_KEY,  String(minute)),
  ]);
}
