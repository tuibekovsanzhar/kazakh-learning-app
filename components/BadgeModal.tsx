// Slide-up badge unlock modal — spring animation, auto-dismiss after 4s.

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  StyleSheet,
} from 'react-native';
import { useLanguage } from '../utils/i18n';

type Badge = { id: string; icon: string; titleKey: string; descKey: string };

type Props = {
  badge: Badge | null;
  onDismiss: () => void;
};

export default function BadgeModal({ badge, onDismiss }: Props) {
  const { t } = useLanguage();
  const slideAnim   = useRef(new Animated.Value(400)).current;
  const glowAnim    = useRef(new Animated.Value(0.3)).current;
  const iconScale   = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!badge) return;

    // Reset
    slideAnim.setValue(400);
    iconScale.setValue(0);

    // Slide up
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 80,
      friction: 12,
      useNativeDriver: true,
    }).start();

    // Icon pop
    Animated.spring(iconScale, {
      toValue: 1,
      tension: 200,
      friction: 8,
      delay: 150,
      useNativeDriver: true,
    }).start();

    // Glow pulse loop
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    );
    glowLoop.start();

    // Auto-dismiss after 4 s
    dismissTimer.current = setTimeout(() => {
      glowLoop.stop();
      onDismiss();
    }, 4000);

    return () => {
      glowLoop.stop();
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [badge?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!badge) return null;

  const handleDismiss = () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    onDismiss();
  };

  return (
    <Modal transparent animationType="none" visible={!!badge} statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View style={[styles.modal, { transform: [{ translateY: slideAnim }] }]}>
          {/* Glow ring */}
          <Animated.View style={[styles.glowRing, { opacity: glowAnim }]} />

          {/* Icon */}
          <Animated.Text style={[styles.icon, { transform: [{ scale: iconScale }] }]}>
            {badge.icon}
          </Animated.Text>

          <Text style={styles.header}>{t('achievementUnlocked')}</Text>
          <Text style={styles.title}>{t(badge.titleKey as any)}</Text>
          <Text style={styles.desc}>{t(badge.descKey as any)}</Text>

          <TouchableOpacity style={styles.button} onPress={handleDismiss} activeOpacity={0.8}>
            <Text style={styles.buttonText}>{t('awesome')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  glowRing: {
    position: 'absolute',
    top: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(245,158,11,0.18)',
    borderWidth: 2,
    borderColor: 'rgba(245,158,11,0.5)',
  },
  icon: {
    fontSize: 80,
    marginBottom: 8,
  },
  header: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  title: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  desc: {
    color: '#9ca3af',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#a78bfa',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
