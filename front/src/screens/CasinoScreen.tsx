import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackRow } from '../components/BackRow';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../context/AppContext';
import type { ProfileStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Casino'>;

export function CasinoScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { points, addPoints } = useApp();
  const [bet, setBet] = useState(20);
  const [spinning, setSpinning] = useState(false);
  const [last, setLast] = useState<string | null>(null);

  const presets = useMemo(() => [10, 25, 50, 100], []);

  const spin = () => {
    if (spinning) return;
    if (bet < 1 || bet > 100) {
      Alert.alert('Ставка', 'От 1 до 100 баллов.');
      return;
    }
    if (points < bet) {
      Alert.alert('Мало баллов', 'Сначала заработайте в других играх.');
      return;
    }
    setSpinning(true);
    addPoints(-bet);
    setTimeout(() => {
      const win = Math.random() < 0.45;
      const mult = win ? 2 + Math.floor(Math.random() * 3) : 0;
      const gain = win ? bet * mult : 0;
      if (gain) addPoints(gain);
      setLast(
        win
          ? `Выигрыш x${mult}: +${gain} баллов`
          : `Проигрыш: −${bet} баллов`,
      );
      setSpinning(false);
    }, 700);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <BackRow onPress={() => navigation.goBack()} />
      <Text style={styles.title}>Казино</Text>
      <Text style={styles.sub}>
        Рулетка на баллы: до 100 за спин. Шансы честные как у турагента.
      </Text>
      <Text style={styles.balance}>Баланс: {points}</Text>
      <Text style={styles.betLabel}>Ставка: {bet}</Text>
      <View style={styles.row}>
        {presets.map(p => (
          <Text
            key={p}
            onPress={() => setBet(Math.min(p, 100))}
            style={styles.preset}>
            {p}
          </Text>
        ))}
      </View>
      {last ? <Text style={styles.last}>{last}</Text> : null}
      <View style={{ flex: 1 }} />
      <PrimaryButton
        title={spinning ? 'Крутим…' : 'Крутить'}
        onPress={spin}
        disabled={spinning}
        style={{ marginBottom: insets.bottom + 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24 },
  title: { fontSize: 26, fontWeight: '900', marginTop: 8 },
  sub: { marginTop: 10, color: colors.textSecondary, lineHeight: 22 },
  balance: { marginTop: 18, fontWeight: '800', fontSize: 16 },
  betLabel: { marginTop: 16, fontSize: 18, fontWeight: '800' },
  row: { flexDirection: 'row', gap: 12, marginTop: 12 },
  preset: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    fontWeight: '800',
    color: colors.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  last: { marginTop: 16, fontWeight: '700', color: colors.text },
});
