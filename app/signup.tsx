import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { useToast } from '../utils/useToast';
import { useLanguage } from '../utils/i18n';

export default function SignupScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const { showToast, Toast } = useToast();

  const clearAllErrors = () => {
    setEmailError('');
    setPasswordError('');
    setConfirmError('');
    setGeneralError('');
  };

  const handleSignup = async () => {
    clearAllErrors();

    if (!email.trim() || !password || !confirmPassword) {
      setGeneralError(t('fillAllFields'));
      return;
    }
    if (password.length < 6) {
      setPasswordError(t('passwordTooShort'));
      return;
    }
    if (password !== confirmPassword) {
      setConfirmError(t('passwordsNoMatch'));
      return;
    }

    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await sendEmailVerification(credential.user);
      router.replace('/verify-email' as any);
    } catch (e: any) {
      switch (e.code) {
        case 'auth/email-already-in-use':
          setEmailError(t('emailAlreadyRegistered'));
          break;
        case 'auth/invalid-email':
          setEmailError(t('invalidEmail'));
          break;
        case 'auth/weak-password':
          setPasswordError(t('passwordTooShort'));
          break;
        default:
          showToast(t('signupFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {Toast}

      <View style={styles.inner}>
        <Text style={styles.title}>{t('createAccount')}</Text>
        <Text style={styles.subtitle}>{t('signupSubtitle')}</Text>

        {/* Email */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t('email')}</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#4a4a6a"
            value={email}
            onChangeText={(v) => { setEmail(v); setEmailError(''); setGeneralError(''); }}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
        </View>

        {/* Create Password */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t('createPassword')}</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              placeholder="••••••"
              placeholderTextColor="#4a4a6a"
              value={password}
              onChangeText={(v) => { setPassword(v); setPasswordError(''); setGeneralError(''); }}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              textContentType="newPassword"
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
              <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}
        </View>

        {/* Confirm Password */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t('confirmPassword')}</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              placeholder="••••••"
              placeholderTextColor="#4a4a6a"
              value={confirmPassword}
              onChangeText={(v) => { setConfirmPassword(v); setConfirmError(''); setGeneralError(''); }}
              secureTextEntry={!showConfirmPassword}
              autoComplete="new-password"
              textContentType="newPassword"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(v => !v)} style={styles.eyeBtn}>
              <Text style={styles.eyeText}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          {confirmError ? <Text style={styles.fieldError}>{confirmError}</Text> : null}
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>{t('createAccountBtn')}</Text>}
        </TouchableOpacity>
        {generalError ? <Text style={styles.generalError}>{generalError}</Text> : null}

        <TouchableOpacity style={styles.switchRow} onPress={() => router.push('/login' as any)}>
          <Text style={styles.switchText}>
            {t('alreadyHaveAccount')}{' '}
            <Text style={styles.switchLink}>{t('logInLink')}</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.privacyRow} onPress={() => router.push('/privacy-policy' as any)}>
          <Text style={styles.privacyText}>
            {t('byContinuing')}{' '}
            <Text style={styles.privacyLink}>{t('privacyPolicy')}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  inner: { flex: 1, paddingHorizontal: 28, justifyContent: 'center' },
  title: { fontSize: 30, fontWeight: '700', color: '#fff', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#94a3b8', marginBottom: 32 },
  fieldGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: '#a78bfa', marginBottom: 6 },
  input: {
    backgroundColor: '#1a1a2e', color: '#fff', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
    borderWidth: 1, borderColor: '#2a2a4a',
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a1a2e', borderRadius: 12,
    borderWidth: 1, borderColor: '#2a2a4a',
  },
  inputFlex: {
    flex: 1, color: '#fff',
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
  },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 14 },
  eyeText: { color: '#a78bfa', fontSize: 13, fontWeight: '600' },
  fieldError: { color: '#f87171', fontSize: 12, marginTop: 4 },
  generalError: { color: '#f87171', fontSize: 12, textAlign: 'center', marginTop: 8 },
  btn: {
    backgroundColor: '#a78bfa', borderRadius: 12,
    paddingVertical: 15, alignItems: 'center', marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  switchRow: { alignItems: 'center', marginTop: 24 },
  switchText: { color: '#94a3b8', fontSize: 14 },
  switchLink: { color: '#a78bfa', fontWeight: '600' },
  privacyRow: { alignItems: 'center', marginTop: 20 },
  privacyText: { color: '#4b5563', fontSize: 12 },
  privacyLink: { color: '#6b7280', textDecorationLine: 'underline' },
});
