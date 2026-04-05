import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackRow } from '../components/BackRow';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../context/AppContext';
import type { ProfileStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<ProfileStackParamList, 'TouchGrass'>;

/** Сколько раз нужно «потрогать» — ощутимо много. */
const TAPS_REQUIRED = 120;

export function TouchGrassScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { addPoints, awardBadge } = useApp();
  const [taps, setTaps] = useState(0);
  const [done, setDone] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const rewarded = useRef(false);

  useEffect(() => {
    if (taps < TAPS_REQUIRED || rewarded.current) return;
    rewarded.current = true;
    setDone(true);
    addPoints(20);
    awardBadge({
      id: 'grass_touch',
      title: 'Прикосновение к природе',
      description: 'Вы искренне потрогали цифровую траву. Респект.',
    });
  }, [taps, addPoints, awardBadge]);

  const pulse = useCallback(() => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 0.92,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale]);

  const onGrassPress = useCallback(() => {
    if (done) return;
    pulse();
    setTaps(t => Math.min(t + 1, TAPS_REQUIRED));
  }, [done, pulse]);

  const pct = Math.min(100, (taps / TAPS_REQUIRED) * 100);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <BackRow onPress={() => navigation.goBack()} />
      <Text style={styles.title}>Потрогай траву</Text>
      <Text style={styles.sub}>
        Тапай по траве — много раз. Это терапия. Честно.
      </Text>

      {done ? (
        <View style={styles.doneWrap}>
          <Text style={styles.doneEmoji}>🌿</Text>
          <Text style={styles.doneTitle}>Достаточно для сегодня</Text>
          <Text style={styles.doneSub}>+20 баллов. Природа гордится тобой.</Text>
          <PrimaryButton
            title="Красава"
            onPress={() => navigation.goBack()}
            style={styles.doneBtn}
          />
        </View>
      ) : (
        <>
          <Text style={styles.counter}>
            {taps} / {TAPS_REQUIRED}
          </Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${pct}%` }]} />
          </View>

          <View style={styles.grassZone}>
            <Pressable
              onPress={onGrassPress}
              accessibilityRole="button"
              accessibilityLabel="Потрогать траву"
              style={({ pressed }) => [
                styles.grassHit,
                pressed && styles.grassHitPressed,
              ]}>
              <Animated.View style={{ transform: [{ scale }] }}>
                <Text style={styles.grassEmoji}>🌿</Text>
                <Text style={styles.grassHint}>жми сюда много раз</Text>
              </Animated.View>
            </Pressable>
          </View>
        </>
      )}

      <View style={{ flex: 1 }} />
      {!done ? (
        <Text
          style={[
            styles.footerHint,
            { marginBottom: Math.max(insets.bottom, 12) },
          ]}>
          Осталось {Math.max(0, TAPS_REQUIRED - taps)} касаний
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24 },
  title: { fontSize: 26, fontWeight: '900', color: colors.text, marginTop: 8 },
  sub: {
    marginTop: 12,
    color: colors.textSecondary,
    lineHeight: 22,
    fontSize: 15,
  },
  counter: {
    marginTop: 28,
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
    textAlign: 'center',
  },
  barBg: {
    marginTop: 12,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  grassZone: {
    flex: 1,
    minHeight: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  grassHit: {
    padding: 32,
    borderRadius: 32,
    backgroundColor: 'rgba(46,125,50,0.08)',
    borderWidth: 2,
    borderColor: 'rgba(46,125,50,0.35)',
    alignItems: 'center',
  },
  grassHitPressed: {
    backgroundColor: 'rgba(46,125,50,0.14)',
  },
  grassEmoji: {
    fontSize: 120,
    lineHeight: 130,
    textAlign: 'center',
  },
  grassHint: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '700',
    color: colors.success,
  },
  footerHint: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 14,
    paddingBottom: 8,
  },
  doneWrap: {
    marginTop: 40,
    alignItems: 'center',
    paddingVertical: 24,
  },
  doneEmoji: { fontSize: 80, marginBottom: 16 },
  doneTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 8,
  },
  doneSub: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  doneBtn: { alignSelf: 'stretch', maxWidth: 280 },
});
