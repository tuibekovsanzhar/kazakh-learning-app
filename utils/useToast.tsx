import React, { useState, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';

export function useToast() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setMessage(msg);
    setVisible(true);
    translateY.setValue(-80);
    opacity.setValue(0);

    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 280, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();

    timerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -80, duration: 280, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]).start(() => setVisible(false));
    }, 3000);
  };

  const Toast = visible ? (
    <Animated.View style={[styles.toast, { transform: [{ translateY }], opacity }]}>
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  ) : null;

  return { showToast, Toast };
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 16,
    left: 20,
    right: 20,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#a78bfa',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
