// Full-screen level-up celebration overlay.
// Appears on top of whatever screen triggered it.
// Sequence: fade-in → star burst → title slide → confetti → continue button.

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useLanguage } from '../utils/i18n';
import { LEVEL_THRESHOLDS, nextLevelThreshold } from '../utils/gameStats';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Confetti particle data ───────────────────────────────────────────────────

const CONFETTI_COLORS = ['#a78bfa', '#f59e0b', '#22c55e', '#ef4444', '#3b82f6', '#ec4899', '#f97316'];
const N_PARTICLES = 22;

function makeParticles() {
  return Array.from({ length: N_PARTICLES }, (_, i) => ({
    id: i,
    x: (Math.random() * SCREEN_WIDTH * 1.2) - SCREEN_WIDTH * 0.1,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    width: 6 + Math.random() * 10,
    height: 10 + Math.random() * 14,
    delay: Math.floor(Math.random() * 600),
    duration: 1600 + Math.floor(Math.random() * 1200),
    startRotate: Math.random() * 360,
  }));
}

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  newLevel: number;
  totalXP: number;
  onDismiss: () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function LevelUpOverlay({ newLevel, totalXP, onDismiss }: Props) {
  const { t } = useLanguage();

  // Counted-up level display (ticks from 1 → newLevel)
  const [displayLevel, setDisplayLevel] = useState(1);

  // Animations
  const fadeAnim     = useRef(new Animated.Value(0)).current;
  const starScale    = useRef(new Animated.Value(0)).current;
  const titleY       = useRef(new Animated.Value(-80)).current;
  const buttonOpac   = useRef(new Animated.Value(0)).current;

  // Confetti — created once, stable across renders
  const particles    = useRef(makeParticles()).current;
  const particleAnims = useRef(particles.map(() => new Animated.Value(0))).current;

  const nextXP = nextLevelThreshold(newLevel);

  useEffect(() => {
    // 1. Fade screen in
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    // 2. Star burst
    Animated.sequence([
      Animated.spring(starScale, { toValue: 1.25, tension: 220, friction: 5, useNativeDriver: true }),
      Animated.spring(starScale, { toValue: 1.0,  tension: 220, friction: 8, useNativeDriver: true }),
    ]).start();

    // 3. Title slides down from top
    Animated.spring(titleY, {
      toValue: 0,
      tension: 80,
      friction: 12,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // 4. Confetti
    Animated.parallel(
      particles.map((p, i) =>
        Animated.sequence([
          Animated.delay(p.delay),
          Animated.timing(particleAnims[i], {
            toValue: 1,
            duration: p.duration,
            useNativeDriver: true,
          }),
        ])
      )
    ).start();

    // 5. Continue button fades in after 1 s
    Animated.timing(buttonOpac, {
      toValue: 1,
      duration: 400,
      delay: 1000,
      useNativeDriver: true,
    }).start();

    // 6. Level count-up animation
    let current = 1;
    const step = () => {
      current += 1;
      if (current >= newLevel) {
        setDisplayLevel(newLevel);
      } else {
        setDisplayLevel(current);
        setTimeout(step, 80);
      }
    };
    if (newLevel > 1) setTimeout(step, 400);
    else setDisplayLevel(newLevel);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      {/* Confetti particles */}
      {particles.map((p, i) => (
        <Animated.View
          key={p.id}
          pointerEvents="none"
          style={[
            styles.particle,
            {
              left: p.x,
              width: p.width,
              height: p.height,
              backgroundColor: p.color,
              borderRadius: p.width / 3,
              transform: [
                {
                  translateY: particleAnims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [-40, SCREEN_HEIGHT + 60],
                  }),
                },
                {
                  rotate: particleAnims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [`${p.startRotate}deg`, `${p.startRotate + 540}deg`],
                  }),
                },
              ],
              opacity: particleAnims[i].interpolate({
                inputRange: [0, 0.75, 1],
                outputRange: [1, 1, 0],
              }),
            },
          ]}
        />
      ))}

      {/* Content */}
      <View style={styles.content}>
        {/* "LEVEL UP!" title */}
        <Animated.Text style={[styles.levelUpText, { transform: [{ translateY: titleY }] }]}>
          {t('levelUpTitle')}
        </Animated.Text>

        {/* Star with level number */}
        <Animated.View style={[styles.starContainer, { transform: [{ scale: starScale }] }]}>
          <Text style={styles.starEmoji}>⭐</Text>
          <Text style={styles.levelNumber}>{displayLevel}</Text>
        </Animated.View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {t('youReachedLevel')} {newLevel}
        </Text>

        {/* XP progress info */}
        <View style={styles.xpBox}>
          <Text style={styles.xpCurrent}>{totalXP} XP</Text>
          {nextXP !== null && (
            <Text style={styles.xpNext}>
              {t('nextLevelAt')} {nextXP} XP
            </Text>
          )}
        </View>

        {/* Continue button (fades in after 1s) */}
        <Animated.View style={{ opacity: buttonOpac, width: '100%' }}>
          <TouchableOpacity style={styles.continueButton} onPress={onDismiss} activeOpacity={0.85}>
            <Text style={styles.continueText}>{t('levelUpContinue')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0a18',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  particle: {
    position: 'absolute',
    top: 0,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    width: '100%',
  },
  levelUpText: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 32,
    textShadowColor: '#a78bfa',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  starContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  starEmoji: {
    fontSize: 120,
    lineHeight: 130,
  },
  levelNumber: {
    position: 'absolute',
    color: '#1a0a00',
    fontSize: 48,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 130,
  },
  subtitle: {
    color: '#c4b5fd',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  xpBox: {
    alignItems: 'center',
    marginBottom: 48,
  },
  xpCurrent: {
    color: '#f59e0b',
    fontSize: 24,
    fontWeight: 'bold',
  },
  xpNext: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 6,
  },
  continueButton: {
    backgroundColor: '#a78bfa',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  continueText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
