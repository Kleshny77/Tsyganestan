import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackRow } from '../components/BackRow';
import { LabeledField } from '../components/LabeledField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../context/AppContext';
import type { AccountType } from '../types';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { login } = useApp();
  const [email, setEmail] = useState('samsonovartem00@gmail.com');
  const [password, setPassword] = useState('password');
  const [type, setType] = useState<AccountType>('user');

  const onSubmit = () => {
    const name = email.split('@')[0] || 'Путешественник';
    login(
      email,
      password,
      {
        name,
        email,
        companyName: type === 'business' ? `${name} Tours` : undefined,
      },
      type,
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <BackRow onPress={() => navigation.goBack()} />
      <Text style={styles.title}>Вход</Text>
      <Text style={styles.sub}>Войти в свой аккаунт</Text>

      <LabeledField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <LabeledField
        label="Пароль"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.typeLabel}>Тип входа (пока без бэка)</Text>
      <View style={styles.segment}>
        <Segment
          label="Пользователь"
          active={type === 'user'}
          onPress={() => setType('user')}
        />
        <Segment
          label="Бизнес"
          active={type === 'business'}
          onPress={() => setType('business')}
        />
      </View>

      <PrimaryButton title="Войти" onPress={onSubmit} style={styles.btn} />

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

function Segment({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[segStyles.cell, active && segStyles.cellActive]}>
      <Text style={[segStyles.cellText, active && segStyles.cellTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const segStyles = StyleSheet.create({
  cell: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cellActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF3E8',
  },
  cellText: { color: colors.textSecondary, fontWeight: '600' },
  cellTextActive: { color: colors.primary },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24 },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  sub: { fontSize: 16, color: colors.textSecondary, marginBottom: 24 },
  typeLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  segment: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  btn: { marginTop: 8 },
  linkWrap: { marginTop: 24, alignItems: 'center' },
  linkText: { color: colors.textSecondary, fontSize: 15 },
  linkAccent: { color: colors.primary, fontWeight: '700' },
});
