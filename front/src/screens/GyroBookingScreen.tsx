import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  gyroscope,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';
import { useApp } from '../context/AppContext';
import type { GyroBookingParams } from '../navigation/types';
import { colors } from '../theme/colors';

const BUTTON = 76;
const TARGET_R = 52;
const HOLD_MS = 1400;

type GyroNav = NativeStackNavigationProp<
  { GyroBooking: GyroBookingParams },
  'GyroBooking'
>;

type Props = {
  navigation: GyroNav;
  route: RouteProp<{ GyroBooking: GyroBookingParams }, 'GyroBooking'>;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function GyroBookingScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { flights, tours } = useApp();
  const { kind, flightId, tourId, categoryId, mystery } = route.params;

  const areaH = height * 0.55;
  const areaTop = insets.top + 160;
  const targetCx = width / 2;
  const targetCy = areaTop + areaH * 0.38;

  const startX = width / 2 - BUTTON / 2;
  const startY = areaTop + areaH * 0.72;

  const [pos, setPos] = useState({ x: startX, y: startY });
  const posRef = useRef(pos);
  posRef.current = pos;

  const dragOrigin = useRef({ x: startX, y: startY });
  const gyroLast = useRef(Date.now());
  const holdAccum = useRef(0);
  const tickLast = useRef(Date.now());
  const [holdPct, setHoldPct] = useState(0);
  const completed = useRef(false);

  const useGyro = Platform.OS !== 'web';

  const title = useMemo(() => {
    if (mystery) return 'Мистери-бокс: случайный перелёт';
    if (kind === 'tour') {
      const t = tours.find(x => x.id === tourId);
      return t ? `Бронь: ${t.title}` : 'Бронь тура';
    }
    const f = flights.find(x => x.id === flightId);
    const c = f?.categories.find(x => x.id === categoryId);
    return f && c ? `${f.airlineName} · ${c.name}` : 'Бронь билета';
  }, [categoryId, flightId, flights, kind, mystery, tourId, tours]);

  useEffect(() => {
    if (!useGyro) return;
    try {
      setUpdateIntervalForType(SensorTypes.gyroscope, 40);
    } catch {
      /* ignore */
    }
    let sub: { unsubscribe?: () => void } | undefined;
    try {
      sub = gyroscope.subscribe(({ x, y }) => {
        const now = Date.now();
        const dt = Math.min(0.08, (now - gyroLast.current) / 1000);
        gyroLast.current = now;
        const p = posRef.current;
        const nx = clamp(p.x + y * 420 * dt, 12, width - BUTTON - 12);
        const ny = clamp(
          p.y - x * 420 * dt,
          areaTop + 8,
          areaTop + areaH - BUTTON - 8,
        );
        setPos({ x: nx, y: ny });
      });
    } catch {
      /* sensor missing */
    }
    return () => {
      sub?.unsubscribe?.();
    };
  }, [areaH, areaTop, useGyro, width]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !useGyro,
        onMoveShouldSetPanResponder: () => !useGyro,
        onPanResponderGrant: () => {
          dragOrigin.current = { ...posRef.current };
        },
        onPanResponderMove: (_, g) => {
          const nx = clamp(
            dragOrigin.current.x + g.dx,
            12,
            width - BUTTON - 12,
          );
          const ny = clamp(
            dragOrigin.current.y + g.dy,
            areaTop + 8,
            areaTop + areaH - BUTTON - 8,
          );
          setPos({ x: nx, y: ny });
        },
        onPanResponderRelease: () => {
          dragOrigin.current = { ...posRef.current };
        },
      }),
    [areaH, areaTop, useGyro, width],
  );

  useEffect(() => {
    const id = setInterval(() => {
      if (completed.current) return;
      const now = Date.now();
      const dt = now - tickLast.current;
      tickLast.current = now;
      const cx = posRef.current.x + BUTTON / 2;
      const cy = posRef.current.y + BUTTON / 2;
      const d = Math.hypot(cx - targetCx, cy - targetCy);
      const inside = d < TARGET_R - 10;
      if (inside) {
        holdAccum.current += dt;
      } else {
        holdAccum.current = 0;
      }
      setHoldPct(Math.min(100, (holdAccum.current / HOLD_MS) * 100));
      if (holdAccum.current >= HOLD_MS) {
        completed.current = true;
        holdAccum.current = 0;
        Alert.alert(
          'Готово',
          mystery
            ? 'Вам достался случайный билет в случайное место. Удачи!'
            : 'Бронь подтверждена. Списание произойдёт дважды.',
          [{ text: 'Супер', onPress: () => navigation.popToTop() }],
        );
      }
    }, 80);
    return () => clearInterval(id);
  }, [mystery, navigation, targetCx, targetCy]);

  const hint = useGyro
    ? 'Наклоняйте устройство, чтобы «Забронировать» попало в круг.'
    : 'Перетащите кнопку в оранжевый круг (веб без гироскопа).';

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.back} onPress={() => navigation.goBack()}>
        ← Назад
      </Text>
      <Text style={styles.title}>Финальное действие</Text>
      <Text style={styles.sub}>{title}</Text>
      <Text style={styles.hint}>{hint}</Text>

      <View style={[styles.pit, { top: areaTop, height: areaH }]}>
        <View
          style={[
            styles.target,
            {
              left: targetCx - TARGET_R,
              top: targetCy - areaTop - TARGET_R,
              width: TARGET_R * 2,
              height: TARGET_R * 2,
              borderRadius: TARGET_R,
            },
          ]}
        />
        <View
          {...(!useGyro ? panResponder.panHandlers : {})}
          style={[
            styles.btn,
            {
              left: pos.x,
              top: pos.y - areaTop,
            },
          ]}>
          <Text style={styles.btnText}>Забронировать</Text>
        </View>
      </View>

      <Text style={styles.progress}>Удержание в зоне: {Math.round(holdPct)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 },
  back: { color: colors.textSecondary, marginBottom: 12, fontSize: 16 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  sub: { fontSize: 15, color: colors.textSecondary, marginTop: 6 },
  hint: { fontSize: 14, color: colors.textMuted, marginTop: 12, lineHeight: 20 },
  pit: {
    position: 'absolute',
    left: 12,
    right: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  target: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: 'rgba(255,87,0,0.08)',
  },
  btn: {
    position: 'absolute',
    width: BUTTON,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  btnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 11,
    textAlign: 'center',
  },
  progress: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
