import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { useToast } from '../utils/useToast';

export default function LoginScreen() {
  const router = useRouter();
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
      setResetError('Please enter your email address.');
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
        setResetError('No account found with that email address.');
      } else {
        setResetError('Something went wrong. Please try again.');
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
      setGeneralError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/');
    } catch (e: any) {
      switch (e.code) {
        case 'auth/user-not-found':
          setEmailError('No account found with this email');
          break;
        case 'auth/wrong-password':
          setPasswordError('Incorrect password');
          break;
        case 'auth/invalid-credential':
          // Firebase SDK v9+ collapses user-not-found + wrong-password into this
          setPasswordError('Incorrect email or password');
          break;
        case 'auth/invalid-email':
          setEmailError('Please enter a valid email address');
          break;
        case 'auth/too-many-requests':
          setPasswordError('Too many failed attempts. Please try again later');
          break;
        default:
          showToast('Login failed. Please try again.');
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
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to continue learning Kazakh</Text>

        {/* Email */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
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
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              placeholder="Your password"
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
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Log In</Text>}
        </TouchableOpacity>
        {generalError ? <Text style={styles.generalError}>{generalError}</Text> : null}

        <TouchableOpacity style={styles.switchRow} onPress={() => router.push('/signup')}>
          <Text style={styles.switchText}>
            Don't have an account?{' '}
            <Text style={styles.switchLink}>Sign Up</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.privacyRow} onPress={() => router.push('/privacy-policy' as any)}>
          <Text style={styles.privacyText}>
            By continuing you agree to our{' '}
            <Text style={styles.privacyLink}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Forgot password modal ── */}
      <Modal visible={showForgotModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.modalSubtitle}>
              Enter your email and we'll send you a reset link.
            </Text>

            {resetSuccess ? (
              <>
                <Text style={styles.successText}>
                  Password reset link sent to your email. Check your inbox.
                </Text>
                <TouchableOpacity style={styles.modalBtn} onPress={closeForgotModal}>
                  <Text style={styles.modalBtnText}>Done</Text>
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
                    : <Text style={styles.modalBtnText}>Send Reset Link</Text>}
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalCancel} onPress={closeForgotModal}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
