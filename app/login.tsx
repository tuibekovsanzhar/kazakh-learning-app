import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Modal,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { useToast } from '../utils/useToast';
import { useLanguage } from '../utils/i18n';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const { showToast, Toast } = useToast();

  const handlePasswordReset = async () => {
    if (!resetEmail.trim()) {
      setResetError(t('fillAllFields'));
      return;
    }
    setResetLoading(true);
    setResetError('');
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetSuccess(true);
    } catch (e: any) {
      if (
        e.code === 'auth/user-not-found' ||
        e.code === 'auth/invalid-email' ||
        e.code === 'auth/invalid-credential'
      ) {
        setResetError(t('noAccountFound'));
      } else {
        setResetError(t('loginFailed'));
      }
    } finally {
      setResetLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setResetEmail('');
    setResetError('');
    setResetSuccess(false);
  };

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    if (!email.trim() || !password) {
      setGeneralError(t('fillAllFields'));
      return;
    }
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!credential.user.emailVerified) {
        await signOut(auth);
        setPasswordError(t('emailNotVerified'));
        return;
      }
      router.replace('/' as any);
    } catch (e: any) {
      switch (e.code) {
        // Firebase v12 collapses wrong-password + user-not-found into invalid-credential.
        // Keep the old codes as fallback for older SDK versions.
        case 'auth/wrong-password':
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
          setPasswordError(t('incorrectEmailOrPassword'));
          break;
        case 'auth/invalid-email':
          setEmailError(t('invalidEmail'));
          break;
        case 'auth/too-many-requests':
          setPasswordError(t('tooManyAttempts'));
          break;
        default:
          showToast(t('loginFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {Toast}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{t('welcomeBack')}</Text>
        <Text style={styles.subtitle}>{t('loginSubtitle')}</Text>

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

        {/* Password */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t('password')}</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              placeholder="••••••••"
              placeholderTextColor="#4a4a6a"
              value={password}
              onChangeText={(v) => { setPassword(v); setPasswordError(''); setGeneralError(''); }}
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
              <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}
        </View>

        <TouchableOpacity style={styles.forgotRow} onPress={() => setShowForgotModal(true)}>
          <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>{t('logIn')}</Text>}
        </TouchableOpacity>
        {generalError ? <Text style={styles.generalError}>{generalError}</Text> : null}

        <TouchableOpacity style={styles.switchRow} onPress={() => router.push('/signup' as any)}>
          <Text style={styles.switchText}>
            {t('noAccount')}{' '}
            <Text style={styles.switchLink}>{t('signUpLink')}</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.privacyRow} onPress={() => router.push('/privacy-policy' as any)}>
          <Text style={styles.privacyText}>
            {t('byContinuing')}{' '}
            <Text style={styles.privacyLink}>{t('privacyPolicy')}</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Forgot password modal ── */}
      <Modal visible={showForgotModal} transparent animationType="fade">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{t('resetPassword')}</Text>
            <Text style={styles.modalSubtitle}>{t('resetSubtitle')}</Text>

            {resetSuccess ? (
              <>
                <Text style={styles.successText}>{t('resetSent')}</Text>
                <TouchableOpacity style={styles.modalBtn} onPress={closeForgotModal}>
                  <Text style={styles.modalBtnText}>{t('done')}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {resetError ? <Text style={styles.modalError}>{resetError}</Text> : null}

                <TextInput
                  style={styles.modalInput}
                  placeholder="you@example.com"
                  placeholderTextColor="#4a4a6a"
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />

                <TouchableOpacity
                  style={[styles.modalBtn, resetLoading && styles.btnDisabled]}
                  onPress={handlePasswordReset}
                  disabled={resetLoading}
                >
                  {resetLoading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.modalBtnText}>{t('sendResetLink')}</Text>}
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalCancel} onPress={closeForgotModal}>
                  <Text style={styles.modalCancelText}>{t('cancel')}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  inner: { flexGrow: 1, paddingHorizontal: 28, justifyContent: 'center', paddingVertical: 40 },
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
  forgotRow: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { color: '#a78bfa', fontSize: 13, fontWeight: '600' },
  privacyRow: { alignItems: 'center', marginTop: 20 },
  privacyText: { color: '#4b5563', fontSize: 12 },
  privacyLink: { color: '#6b7280', textDecorationLine: 'underline' },

  // Forgot password modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#1a1a2e', borderRadius: 20, padding: 28,
    width: '88%', borderWidth: 1, borderColor: '#2a2a4a',
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 6 },
  modalSubtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 20, lineHeight: 20 },
  modalInput: {
    backgroundColor: '#0f0f1a', color: '#fff', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
    borderWidth: 1, borderColor: '#2a2a4a', marginBottom: 16,
  },
  modalError: {
    color: '#f87171', fontSize: 13, marginBottom: 12,
    backgroundColor: '#f8717122', borderRadius: 8, padding: 10,
  },
  successText: {
    color: '#22c55e', fontSize: 15, lineHeight: 22,
    marginBottom: 24, textAlign: 'center',
  },
  modalBtn: {
    backgroundColor: '#a78bfa', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  modalBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  modalCancel: { alignItems: 'center', marginTop: 14 },
  modalCancelText: { color: '#6b7280', fontSize: 14 },
});
