import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackRow } from '../components/BackRow';
import { PrimaryButton } from '../components/PrimaryButton';
import type { AccountType } from '../types';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'SignupAccountType'>;

export function SignupAccountTypeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [type, setType] = useState<AccountType>('user');

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <BackRow onPress={() => navigation.goBack()} />
      <Text style={styles.title}>Выберите тип аккаунта</Text>
      <Text style={styles.sub}>Как вы хотите использовать сервис?</Text>

      <Pressable
        onPress={() => setType('user')}
        style={[styles.card, type === 'user' && styles.cardActive]}>
        <View style={[styles.iconBox, styles.iconUser]}>
          <Text style={styles.iconEmoji}>👤</Text>
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Пользовательский</Text>
          <Text style={styles.cardDesc}>
            Покупаю дорогие билеты и плохие туры
          </Text>
        </View>
      </Pressable>

      <Pressable
        onPress={() => setType('business')}
        style={[styles.card, type === 'business' && styles.cardActive]}>
        <View style={[styles.iconBox, styles.iconBiz]}>
          <Text style={styles.iconEmoji}>💼</Text>
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Бизнес</Text>
          <Text style={styles.cardDesc}>Авиакомпания или турагентство</Text>
        </View>
      </Pressable>

      <View style={{ flex: 1 }} />
      <PrimaryButton
        title="Продолжить"
        onPress={() =>
          navigation.navigate('RegisterForm', { accountType: type })
        }
        style={{ marginBottom: insets.bottom + 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  sub: { fontSize: 16, color: colors.textSecondary, marginBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#fff',
    marginBottom: 14,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardActive: { borderColor: colors.primary },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconUser: { backgroundColor: '#FFE8D8' },
  iconBiz: { backgroundColor: '#E3F2FD' },
  iconEmoji: { fontSize: 26 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  cardDesc: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
});
