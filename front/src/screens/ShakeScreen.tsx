import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  accelerometer,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';
import { BackRow } from '../components/BackRow';
import { useApp } from '../context/AppContext';
import type { ProfileStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Shake'>;

const TARGET = 100;
const SHAKE_THRESHOLD = 18;
const COOLDOWN_MS = 120;

export function ShakeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { addPoints, awardBadge } = useApp();
  const [count, setCount] = useState(0);
  const lastPeak = useRef(0);
  const lastMag = useRef(0);
  const done = useRef(false);

  useEffect(() => {
    done.current = false;
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    try {
      setUpdateIntervalForType(SensorTypes.accelerometer, 40);
    } catch {
      /* ignore */
    }
    let sub: { unsubscribe?: () => void } | undefined;
    try {
      sub = accelerometer.subscribe(({ x, y, z }) => {
        const m = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();
        const prev = lastMag.current;
        lastMag.current = m;
        if (m > SHAKE_THRESHOLD && prev <= SHAKE_THRESHOLD * 0.85) {
          if (now - lastPeak.current < COOLDOWN_MS) return;
          lastPeak.current = now;
          setCount(c => {
            if (done.current) return c;
            const n = c + 1;
            if (n >= TARGET) {
              done.current = true;
              addPoints(30);
              awardBadge({
                id: 'shake_master',
                title: 'Сейсмический режим',
                description: 'Вы встряхнули телефон 100 раз.',
              });
            }
            return n;
          });
        }
      });
    } catch {
      /* no sensor */
    }
    return () => sub?.unsubscribe?.();
  }, [addPoints, awardBadge]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <BackRow onPress={() => navigation.goBack()} />
      <Text style={styles.title}>Потряси телефон</Text>
      <Text style={styles.sub}>
        Акселерометр считает резкие встряхивания. Нужно {TARGET} раз.
        {Platform.OS === 'web' ? ' На вебе датчики недоступны — откройте iOS/Android.' : ''}
      </Text>
      <Text style={styles.counter}>{count} / {TARGET}</Text>
      <View style={styles.bar}>
        <View
          style={[styles.fill, { width: `${Math.min(100, (count / TARGET) * 100)}%` }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24 },
  title: { fontSize: 26, fontWeight: '900', marginTop: 8 },
  sub: { marginTop: 10, color: colors.textSecondary, lineHeight: 22 },
  counter: { marginTop: 28, fontSize: 44, fontWeight: '900', textAlign: 'center' },
  bar: {
    height: 14,
    borderRadius: 999,
    backgroundColor: colors.surface,
    marginTop: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  fill: { height: '100%', backgroundColor: colors.primary },
});
