import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../utils/i18n';

export default function LanguagePickerScreen() {
  const router = useRouter();
  const { setLanguage, markLanguageChosen } = useLanguage();
  const [selected, setSelected] = useState<'en' | 'ru'>('en');
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    setSaving(true);
    try {
      await setLanguage(selected);
      await markLanguageChosen();
      router.replace('/');
    } catch (e) {
      console.error('Language picker error:', e);
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.inner}>
        <Text style={styles.title}>Choose your language</Text>
        <Text style={styles.titleRu}>Выберите язык</Text>

        <View style={styles.optionsRow}>
          {/* English */}
          <TouchableOpacity
            style={[styles.option, selected === 'en' && styles.optionSelected]}
            onPress={() => setSelected('en')}
            activeOpacity={0.8}
          >
            <Text style={styles.flag}>🇬🇧</Text>
            <Text style={[styles.optionLabel, selected === 'en' && styles.optionLabelSelected]}>
              English
            </Text>
            {selected === 'en' && <View style={styles.checkDot} />}
          </TouchableOpacity>

          {/* Russian */}
          <TouchableOpacity
            style={[styles.option, selected === 'ru' && styles.optionSelected]}
            onPress={() => setSelected('ru')}
            activeOpacity={0.8}
          >
            <Text style={styles.flag}>🇷🇺</Text>
            <Text style={[styles.optionLabel, selected === 'ru' && styles.optionLabelSelected]}>
              Русский
            </Text>
            {selected === 'ru' && <View style={styles.checkDot} />}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.continueBtn, saving && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.continueBtnText}>
                {selected === 'en' ? 'Continue' : 'Продолжить'}
              </Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  titleRu: {
    fontSize: 18,
    fontWeight: '500',
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 48,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 48,
    width: '100%',
  },
  option: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    paddingVertical: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2a2a4a',
  },
  optionSelected: {
    borderColor: '#a78bfa',
    backgroundColor: '#1e1040',
  },
  flag: {
    fontSize: 40,
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#94a3b8',
  },
  optionLabelSelected: {
    color: '#a78bfa',
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#a78bfa',
    marginTop: 10,
  },
  continueBtn: {
    backgroundColor: '#a78bfa',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  continueBtnDisabled: { opacity: 0.6 },
  continueBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },
});
