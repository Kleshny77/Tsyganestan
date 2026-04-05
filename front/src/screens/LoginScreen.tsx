import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ApiError } from '../api/client';
import { userAlert } from '../lib/userAlert';
import { BackRow } from '../components/BackRow';
import { LabeledField } from '../components/LabeledField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      userAlert('Проверьте данные', 'Введите email и пароль.');
      return;
    }
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : 'Не удалось войти. Проверьте сеть.';
      userAlert('Ошибка входа', String(msg));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <BackRow onPress={() => navigation.goBack()} />
      <Text style={styles.title}>Вход</Text>
      <Text style={styles.sub}>Войдите в свой аккаунт</Text>

      <LabeledField
        label="Email"
        icon="✉️"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="your@email.com"
      />
      <LabeledField
        label="Пароль"
        icon="🔑"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
      />

      <Text style={styles.hint}>
        Логин на сервере совпадает с email при регистрации.
      </Text>

      <PrimaryButton
        title={busy ? 'Входим…' : 'Войти'}
        onPress={onSubmit}
        disabled={busy}
        style={styles.btn}
      />
      {busy ? (
        <ActivityIndicator style={styles.spinner} color={colors.primary} />
      ) : null}

      <Pressable
        onPress={() => navigation.navigate('SignupAccountType')}
        style={styles.linkWrap}>
        <Text style={styles.linkText}>
          Нет аккаунта?{' '}
          <Text style={styles.linkAccent}>Зарегистрируйтесь</Text>
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24 },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  sub: { fontSize: 16, color: colors.textSecondary, marginBottom: 8 },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 16,
    lineHeight: 18,
  },
  btn: { marginTop: 8 },
  spinner: { marginTop: 12 },
  linkWrap: { marginTop: 24, alignItems: 'center' },
  linkText: { color: colors.textSecondary, fontSize: 15 },
  linkAccent: { color: colors.primary, fontWeight: '700' },
});
