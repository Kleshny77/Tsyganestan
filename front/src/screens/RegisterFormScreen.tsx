import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ApiError } from '../api/client';
import { BackRow } from '../components/BackRow';
import { LabeledField } from '../components/LabeledField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'RegisterForm'>;

export function RegisterFormScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { register } = useApp();
  const { accountType } = route.params;
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    const em = email.trim();
    if (!em || !password) {
      Alert.alert('Проверьте данные', 'Нужны email и пароль.');
      return;
    }
    setBusy(true);
    try {
      if (accountType === 'business') {
        await register(
          {
            name: name.trim() || 'Представитель',
            email: em,
            companyName: company.trim() || 'Компания',
          },
          'business',
          password,
        );
      } else {
        await register(
          {
            name: name.trim() || 'Путешественник',
            email: em,
          },
          'user',
          password,
        );
      }
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : 'Не удалось зарегистрироваться. Попробуйте другой email.';
      Alert.alert('Ошибка', String(msg));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <BackRow onPress={() => navigation.goBack()} />
      <Text style={styles.title}>Регистрация</Text>
      <Text style={styles.sub}>
        {accountType === 'business'
          ? 'Создайте бизнес-аккаунт (турагент)'
          : 'Создайте аккаунт путешественника'}
      </Text>

      {accountType === 'business' ? (
        <LabeledField
          label="Название компании"
          value={company}
          onChangeText={setCompany}
          placeholder="Ужасные Туры"
        />
      ) : (
        <LabeledField
          label="Имя"
          value={name}
          onChangeText={setName}
          placeholder="Как к вам обращаться"
        />
      )}
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
        placeholder="Не меньше 6 символов"
      />

      <PrimaryButton
        title={busy ? 'Создаём…' : 'Создать аккаунт'}
        onPress={onSubmit}
        disabled={busy}
        style={{ marginTop: 8 }}
      />
      {busy ? (
        <ActivityIndicator style={{ marginTop: 16 }} color={colors.primary} />
      ) : null}
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
  sub: { fontSize: 16, color: colors.textSecondary, marginBottom: 24 },
});
