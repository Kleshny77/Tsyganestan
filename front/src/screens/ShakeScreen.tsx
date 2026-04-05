import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
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
const WEB_TAP_COOLDOWN_MS = 45;

export function ShakeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { addPoints, awardBadge } = useApp();
  const [count, setCount] = useState(0);
  const lastPeak = useRef(0);
  const lastMag = useRef(0);
  const lastWebTap = useRef(0);
  const done = useRef(false);
  const rewarded = useRef(false);

  useEffect(() => {
    done.current = false;
    rewarded.current = false;
  }, []);

  const bump = useCallback(() => {
    setCount(c => {
      if (done.current) return c;
      const n = c + 1;
      if (n >= TARGET) {
        done.current = true;
        if (!rewarded.current) {
          rewarded.current = true;
          addPoints(30);
          awardBadge({
            id: 'shake_master',
            title: 'Иллюминатор согласен',
            description:
              Platform.OS === 'web'
                ? 'Сто похлопываний по виртуальному стеклу — турбина довольна.'
                : 'Сто встряхиваний — экипаж выдохнул.',
          });
        }
      }
      return n;
    });
  }, [addPoints, awardBadge]);

  const onWebTap = useCallback(() => {
    const now = Date.now();
    if (now - lastWebTap.current < WEB_TAP_COOLDOWN_MS) return;
    lastWebTap.current = now;
    bump();
  }, [bump]);

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
          bump();
        }
      });
    } catch {
      /* no sensor */
    }
    return () => sub?.unsubscribe?.();
  }, [bump]);

  const isWeb = Platform.OS === 'web';

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <BackRow onPress={() => navigation.goBack()} />
      <Text style={styles.title}>
        {isWeb ? 'Похлопай по иллюминатору' : 'Потряси телефон'}
      </Text>
      <Text style={styles.sub}>
        {isWeb
          ? `Авиакомпания требует ритуал: стукни по «стеклу» ${TARGET} раз — как в том меме про турбину. Каждый тап считается.`
          : `Акселерометр считает резкие встряхивания. Нужно ${TARGET} раз.`}
      </Text>
      <Text style={styles.counter}>
        {count} / {TARGET}
      </Text>
      <View style={styles.bar}>
        <View
          style={[styles.fill, { width: `${Math.min(100, (count / TARGET) * 100)}%` }]}
        />
      </View>
      {isWeb ? (
        <Pressable
          onPress={onWebTap}
          style={({ pressed }) => [
            styles.illus,
            pressed && styles.illusPressed,
          ]}>
          <Text style={styles.illusEmoji}>🪟</Text>
          <Text style={styles.illusHint}>Тап сюда — похлопать</Text>
        </Pressable>
      ) : null}
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
  illus: {
    marginTop: 28,
    minHeight: 200,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  illusPressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  illusEmoji: { fontSize: 72, marginBottom: 12 },
  illusHint: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
