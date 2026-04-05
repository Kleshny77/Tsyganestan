import React, { useEffect, useRef, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  accelerometer,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';
import { BackRow } from '../components/BackRow';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../context/AppContext';
import type { ProfileStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Steps'>;

const WINDOW_MS = 60_000;
const NEED = 150;
const STEP_THRESHOLD = 11;
const MIN_GAP_MS = 220;

/**
 * Эвристика «шагов» по пикам ускорения (не замена настоящему шагомеру).
 * На реальном устройстве лучше подключить HealthKit / Google Fit.
 */
export function StepsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { addPoints, awardBadge } = useApp();
  const [running, setRunning] = useState(false);
  const [leftMs, setLeftMs] = useState(WINDOW_MS);
  const [steps, setSteps] = useState(0);
  const lastPeak = useRef(0);
  const lastMag = useRef(0);
  const endAt = useRef(0);
  const done = useRef(false);

  useEffect(() => {
    if (!running || Platform.OS === 'web') return;
    try {
      setUpdateIntervalForType(SensorTypes.accelerometer, 40);
    } catch {
      /* ignore */
    }
    let sub: { unsubscribe?: () => void } | undefined;
    try {
      sub = accelerometer.subscribe(({ x, y, z }) => {
        const now = Date.now();
        if (now > endAt.current) return;
        const m = Math.sqrt(x * x + y * y + z * z);
        const prev = lastMag.current;
        lastMag.current = m;
        if (m > STEP_THRESHOLD && prev <= STEP_THRESHOLD * 0.92) {
          if (now - lastPeak.current < MIN_GAP_MS) return;
          lastPeak.current = now;
          setSteps(s => {
            if (done.current) return s;
            const n = s + 1;
            if (n >= NEED) {
              done.current = true;
              addPoints(40);
              awardBadge({
                id: 'steps_sprint',
                title: 'Минутный спринт',
                description: '150 «шагов» за минуту по акселерометру.',
              });
              Alert.alert('Готово', '+40 баллов. Вы невероятны.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            }
            return n;
          });
        }
      });
    } catch {
      /* no sensor */
    }
    return () => sub?.unsubscribe?.();
  }, [addPoints, awardBadge, navigation, running]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const left = Math.max(0, endAt.current - Date.now());
      setLeftMs(left);
      if (left <= 0) {
        setRunning(false);
      }
    }, 200);
    return () => clearInterval(id);
  }, [running]);

  const start = () => {
    done.current = false;
    setSteps(0);
    setLeftMs(WINDOW_MS);
    endAt.current = Date.now() + WINDOW_MS;
    setRunning(true);
    lastPeak.current = 0;
    lastMag.current = 0;
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <BackRow onPress={() => navigation.goBack()} />
      <Text style={styles.title}>Шагомер-челлендж</Text>
      <Text style={styles.sub}>
        За 60 секунд нужно набрать {NEED} пиков движения (акселерометр). Это
        суррогат настоящего шагомера до интеграции с ОС.
      </Text>
      {Platform.OS === 'web' ? (
        <Text style={styles.warn}>На вебе датчики недоступны.</Text>
      ) : null}
      <Text style={styles.timer}>
        {running ? `${Math.ceil(leftMs / 1000)} сек` : 'Старт ждёт'}
      </Text>
      <Text style={styles.steps}>
        {steps} / {NEED}
      </Text>
      <PrimaryButton
        title={running ? 'Идёт попытка…' : 'Старт минуты'}
        onPress={start}
        disabled={running || Platform.OS === 'web'}
        style={{ marginTop: 20 }}
      />
      <Pressable style={styles.dev} onPress={() => addPoints(5)}>
        <Text style={styles.devText}>Демо: +5 баллов (для теста UI)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24 },
  title: { fontSize: 26, fontWeight: '900', marginTop: 8 },
  sub: { marginTop: 10, color: colors.textSecondary, lineHeight: 22 },
  warn: { marginTop: 12, color: colors.danger, fontWeight: '700' },
  timer: { marginTop: 22, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  steps: { marginTop: 10, fontSize: 40, fontWeight: '900', textAlign: 'center' },
  dev: { marginTop: 32, alignSelf: 'center' },
  devText: { color: colors.textMuted, textDecorationLine: 'underline' },
});
