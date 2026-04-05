import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  Platform,
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

type Props = NativeStackScreenProps<ProfileStackParamList, 'Casino'>;

const SYMBOLS = ['🍒', '💎', '7️⃣', '⭐', '🎰', '👑'];
const CELL = 58;
const CYCLES = 14;

function SlotReel({
  stopIndex,
  spinning,
  staggerMs,
}: {
  stopIndex: number;
  spinning: boolean;
  staggerMs: number;
}) {
  const y = useRef(new Animated.Value(0)).current;
  const idlePlaced = useRef(false);
  const stripLen = CYCLES * SYMBOLS.length + SYMBOLS.length + 4;

  const strip = useMemo(
    () =>
      Array.from({ length: stripLen }, (_, i) => SYMBOLS[i % SYMBOLS.length]),
    [stripLen],
  );

  useLayoutEffect(() => {
    if (!spinning && !idlePlaced.current) {
      idlePlaced.current = true;
      y.setValue(stopIndex * CELL);
    }
  }, [spinning, stopIndex, y]);

  useEffect(() => {
    if (!spinning) return;
    idlePlaced.current = true;
    y.setValue(0);
    const endY = CYCLES * SYMBOLS.length * CELL + stopIndex * CELL;
    const anim = Animated.sequence([
      Animated.delay(staggerMs),
      Animated.timing(y, {
        toValue: endY,
        duration: 2400 - staggerMs * 0.4,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [spinning, stopIndex, staggerMs, y]);

  return (
    <View style={reelStyles.window}>
      <View style={reelStyles.glint} pointerEvents="none" />
      <Animated.View
        style={[
          reelStyles.strip,
          { transform: [{ translateY: Animated.multiply(y, -1) }] },
        ]}>
        {strip.map((sym, i) => (
          <View key={`${i}-${sym}`} style={reelStyles.cell}>
            <Text style={reelStyles.sym}>{sym}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

export function CasinoScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { points, addPoints } = useApp();
  const [bet, setBet] = useState(100);
  const [spinning, setSpinning] = useState(false);
  const [spinKey, setSpinKey] = useState(0);
  const [last, setLast] = useState<string | null>(null);
  const [indices, setIndices] = useState<[number, number, number]>([0, 1, 2]);

  const presets = useMemo(() => [50, 100, 250, 500], []);

  const glow = useRef(new Animated.Value(0)).current;
  const resultScale = useRef(new Animated.Value(0)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [glow]);

  const spin = useCallback(() => {
    if (spinning) return;
    if (bet < 1 || bet > 1000) {
      setLast('Ставка от 1 до 1000.');
      return;
    }

    const win = Math.random() < 0.44;
    const mult = win ? 2 + Math.floor(Math.random() * 4) : 0;
    const gain = win ? bet * mult : 0;

    let a: number;
    let b: number;
    let c: number;
    if (win) {
      a = b = c = Math.floor(Math.random() * SYMBOLS.length);
    } else {
      a = Math.floor(Math.random() * SYMBOLS.length);
      b = (a + 1 + Math.floor(Math.random() * (SYMBOLS.length - 1))) % SYMBOLS.length;
      c = Math.floor(Math.random() * SYMBOLS.length);
      if (a === b && b === c) {
        c = (c + 1) % SYMBOLS.length;
      }
    }

    setIndices([a, b, c]);
    setSpinKey(k => k + 1);
    setSpinning(true);
    setLast(null);
    resultScale.setValue(0);
    resultOpacity.setValue(0);

    addPoints(-bet);

    const settleMs = 2600;
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => {
      settleTimerRef.current = null;
      if (gain) addPoints(gain);
      setLast(
        win
          ? `Джекпот-линия! x${mult} → +${gain} баллов`
          : `Не повезло: −${bet}. Ещё разок?`,
      );
      setSpinning(false);
      Animated.parallel([
        Animated.spring(resultScale, {
          toValue: 1,
          friction: 6,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.timing(resultOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }, settleMs);
  }, [spinning, bet, addPoints, resultScale, resultOpacity]);

  useEffect(
    () => () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    },
    [],
  );

  const glowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.95],
  });

  const balanceColor =
    points < 0 ? colors.danger : points < bet ? colors.textSecondary : colors.text;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <BackRow onPress={() => navigation.goBack()} />
      <Text style={styles.title}>я.цыган · казино</Text>
      <Text style={styles.sub}>
        Три барабана, ставка до 1000. Баланс может уйти в минус — как у настоящего
        цыгана.
      </Text>

      <Animated.View
        style={[
          styles.balanceCard,
          {
            borderColor: colors.primary,
            shadowOpacity: Platform.OS === 'web' ? 0.25 : 0.4,
          },
        ]}>
        <Animated.View
          style={[styles.balanceGlow, { opacity: glowOpacity }]}
          pointerEvents="none"
        />
        <Text style={styles.balanceLabel}>баланс</Text>
        <Text style={[styles.balanceValue, { color: balanceColor }]}>
          {points.toLocaleString('ru-RU')} ₿
        </Text>
        {points < 0 ? (
          <Text style={styles.debtHint}>долг перед я.цыган — можно отыграться</Text>
        ) : null}
      </Animated.View>

      <Text style={styles.betLabel}>ставка · {bet}</Text>
      <View style={styles.presetRow}>
        {presets.map(p => (
          <Text
            key={p}
            onPress={() => !spinning && setBet(Math.min(p, 1000))}
            style={[
              styles.preset,
              bet === p && styles.presetActive,
              spinning && styles.presetDisabled,
            ]}>
            {p}
          </Text>
        ))}
      </View>

      <View style={styles.machine}>
        <Text style={styles.machineLabel}>линия</Text>
        <View style={styles.reelsRow} key={spinKey}>
          <SlotReel
            stopIndex={indices[0]}
            spinning={spinning}
            staggerMs={0}
          />
          <SlotReel
            stopIndex={indices[1]}
            spinning={spinning}
            staggerMs={140}
          />
          <SlotReel
            stopIndex={indices[2]}
            spinning={spinning}
            staggerMs={280}
          />
        </View>
      </View>

      {last ? (
        <Animated.View
          style={[
            styles.resultBox,
            {
              opacity: resultOpacity,
              transform: [{ scale: resultScale }],
            },
          ]}>
          <Text style={styles.resultText}>{last}</Text>
        </Animated.View>
      ) : null}

      <View style={{ flex: 1 }} />
      <PrimaryButton
        title={spinning ? 'Крутим барабаны…' : 'Крутить'}
        onPress={spin}
        disabled={spinning}
        style={{ marginBottom: insets.bottom + 16 }}
      />
    </View>
  );
}

const reelStyles = StyleSheet.create({
  window: {
    width: 72,
    height: CELL,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#0d0d12',
    borderWidth: 2,
    borderColor: 'rgba(255,81,0,0.55)',
  },
  glint: {
    ...StyleSheet.absoluteFillObject,
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  strip: { alignItems: 'center' },
  cell: {
    height: CELL,
    width: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sym: { fontSize: 34, lineHeight: 40 },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 8,
    letterSpacing: -0.5,
  },
  sub: {
    marginTop: 10,
    color: colors.textSecondary,
    lineHeight: 22,
    fontSize: 15,
  },
  balanceCard: {
    marginTop: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: '#111318',
    borderWidth: 2,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 8px 28px rgba(255,81,0,0.2)' }
      : {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowRadius: 16,
          elevation: 8,
        }),
  },
  balanceGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  balanceValue: {
    marginTop: 6,
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
  },
  debtHint: {
    marginTop: 8,
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600',
  },
  betLabel: {
    marginTop: 22,
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  preset: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    fontWeight: '800',
    color: colors.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255,81,0,0.12)',
  },
  presetDisabled: { opacity: 0.45 },
  machine: {
    marginTop: 22,
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#16161c',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  machineLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  reelsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  resultBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultText: {
    fontWeight: '800',
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
});
