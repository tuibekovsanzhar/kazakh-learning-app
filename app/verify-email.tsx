import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { sendEmailVerification, signOut, reload } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { useLanguage } from '../utils/i18n';

const COOLDOWN_SECONDS = 30;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const user = auth.currentUser;
  const email = user?.email ?? '';

  const [checking, setChecking]       = useState(false);
  const [checkError, setCheckError]   = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  // Start countdown immediately — verification email was just sent by signup
  const [cooldown, setCooldown]       = useState(COOLDOWN_SECONDS);

  // Count down the resend timer every second
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown(c => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  // Reload Firebase user data, then check emailVerified flag
  const handleCheckVerification = async () => {
    if (!user) { router.replace('/login' as any); return; }
    setChecking(true);
    setCheckError('');
    setResendSuccess(false);
    try {
      await reload(user);
      if (auth.currentUser?.emailVerified) {
        router.replace('/' as any);
      } else {
        setCheckError(t('notVerifiedError'));
      }
    } catch {
      setCheckError(t('verificationCheckFailed'));
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    if (!user || cooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setResendSuccess(false);
    setCheckError('');
    try {
      await sendEmailVerification(user);
      setResendSuccess(true);
      setCooldown(COOLDOWN_SECONDS);
    } catch {
      // Firebase may rate-limit; silently reset so user can try again
    } finally {
      setResendLoading(false);
    }
  };

  const handleUseDifferentEmail = async () => {
    await signOut(auth);
    router.replace('/signup' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.inner}>
        <Text style={styles.emoji}>📧</Text>

        <Text style={styles.title}>{t('verifyEmailTitle')}</Text>

        <Text style={styles.subtitle}>
          {t('verifyEmailSubtitle')}
        </Text>
        <Text style={styles.emailText}>{email}</Text>

        <Text style={styles.instructions}>{t('verifyEmailInstructions')}</Text>

        {/* Feedback messages */}
        {checkError ? (
          <Text style={styles.errorText}>{checkError}</Text>
        ) : null}
        {resendSuccess ? (
          <Text style={styles.successText}>{t('verificationSent')}</Text>
        ) : null}

        {/* Primary action — check if user clicked the link */}
        <TouchableOpacity
          style={[styles.btn, checking && styles.btnDisabled]}
          onPress={handleCheckVerification}
          disabled={checking}
        >
          {checking
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>{t('iHaveVerified')}</Text>}
        </TouchableOpacity>

        {/* Resend button with countdown */}
        <TouchableOpacity
          style={[styles.resendBtn, (cooldown > 0 || resendLoading) && styles.resendDisabled]}
          onPress={handleResend}
          disabled={cooldown > 0 || resendLoading}
        >
          {resendLoading ? (
            <ActivityIndicator color="#a78bfa" size="small" />
          ) : cooldown > 0 ? (
            <Text style={styles.resendTextDim}>
              {t('resendIn')} {cooldown}s
            </Text>
          ) : (
            <Text style={styles.resendTextActive}>{t('resendEmail')}</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.spamHint}>{t('checkSpamHint')}</Text>

        {/* Escape hatch — sign out and go back to signup */}
        <TouchableOpacity style={styles.cancelRow} onPress={handleUseDifferentEmail}>
          <Text style={styles.cancelText}>{t('useDifferentEmail')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 15,
    color: '#a78bfa',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  successText: {
    color: '#22c55e',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  btn: {
    backgroundColor: '#a78bfa',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  resendBtn: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#2a2a4a',
    backgroundColor: '#1a1a2e',
    marginBottom: 32,
  },
  resendDisabled: {
    opacity: 0.5,
  },
  resendTextActive: {
    color: '#a78bfa',
    fontWeight: '600',
    fontSize: 15,
  },
  resendTextDim: {
    color: '#6b7280',
    fontSize: 15,
  },
  spamHint: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  cancelRow: {
    padding: 12,
  },
  cancelText: {
    color: '#4b5563',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
