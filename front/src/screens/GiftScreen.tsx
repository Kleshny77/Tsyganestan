import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { FlightsStackParamList, GyroBookingParams } from '../navigation/types';
import { BackRow } from '../components/BackRow';
import { LabeledField } from '../components/LabeledField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

type GiftParams = { kind: 'flight' | 'tour' };

type GiftNav = NativeStackNavigationProp<FlightsStackParamList, 'Gift'>;

type Props = {
  navigation: GiftNav;
  route: RouteProp<{ Gift: GiftParams }, 'Gift'>;
};

export function GiftScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { kind } = route.params;
  const { flights } = useApp();
  const [email, setEmail] = useState('');
  const [mystery, setMystery] = useState(false);

  const title = useMemo(
    () => (kind === 'flight' ? 'Подарок: авиабилет' : 'Подарок: тур'),
    [kind],
  );

  const onSend = () => {
    if (!email.trim()) {
      Alert.alert('Нужен email', 'Укажите почту друга — мы «найдём» его аккаунт.');
      return;
    }
    if (kind === 'flight' && mystery) {
      const pick = flights[Math.floor(Math.random() * flights.length)];
      const cat = pick?.categories[0];
      Alert.alert(
        'Мистери-бокс отправлен',
        `Друг получит сюрприз: ${pick?.airlineName ?? '???'} · ${cat?.name ?? 'билет'}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
      return;
    }
    Alert.alert(
      'Подарок в пути',
      'Когда подключим бэкенд, подарок уйдёт в личный кабинет друга.',
      [{ text: 'OK', onPress: () => navigation.goBack() }],
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <BackRow onPress={() => navigation.goBack()} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>
        Найдём аккаунт друга по почте (пока заглушка без сервера).
      </Text>

      <LabeledField
        label="Email друга"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="friend@example.com"
      />

      {kind === 'flight' ? (
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Мистери-бокс</Text>
            <Text style={styles.switchSub}>Случайный билет в случайное место</Text>
          </View>
          <Switch value={mystery} onValueChange={setMystery} />
        </View>
      ) : null}

      <PrimaryButton title="Отправить подарок" onPress={onSend} />
      {kind === 'flight' && mystery ? (
        <Pressable
          style={styles.link}
          onPress={() =>
            (
              navigation as unknown as NativeStackNavigationProp<FlightsStackParamList>
            ).navigate('GyroBooking', {
              kind: 'flight',
              mystery: true,
            } satisfies GyroBookingParams)
          }>
          <Text style={styles.linkText}>
            Или сначала пройти «гироскоп-бронь» для мистери-бокса →
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 8 },
  sub: { fontSize: 15, color: colors.textSecondary, marginBottom: 20, lineHeight: 22 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  switchTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  switchSub: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  link: { marginTop: 16 },
  linkText: { color: colors.primary, fontWeight: '700', textAlign: 'center' },
});
