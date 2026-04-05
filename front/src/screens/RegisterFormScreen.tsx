import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
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
  const [name, setName] = useState('артём');
  const [company, setCompany] = useState('Ужасные Туры');
  const [email, setEmail] = useState('samsonovartem00@gmail.com');
  const [password, setPassword] = useState('password');

  const onSubmit = () => {
    if (accountType === 'business') {
      register(
        {
          name: name.trim() || 'Представитель',
          email: email.trim(),
          companyName: company.trim() || 'Компания',
        },
        'business',
      );
    } else {
      register(
        {
          name: name.trim() || 'Путешественник',
          email: email.trim(),
        },
        'user',
      );
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <BackRow onPress={() => navigation.goBack()} />
      <Text style={styles.title}>Регистрация</Text>
      <Text style={styles.sub}>
        {accountType === 'business'
          ? 'Создайте бизнес-аккаунт'
          : 'Создайте пользовательский аккаунт'}
      </Text>

      {accountType === 'business' ? (
        <LabeledField
          label="Название компании"
          value={company}
          onChangeText={setCompany}
        />
      ) : (
        <LabeledField label="Имя" value={name} onChangeText={setName} />
      )}
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

      <PrimaryButton
        title="Создать аккаунт"
        onPress={onSubmit}
        style={{ marginTop: 8 }}
      />
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
