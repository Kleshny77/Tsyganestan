import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
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
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../context/AppContext';
import type { GyroBookingParams } from '../navigation/types';
import { colors } from '../theme/colors';

/** Размеры перетаскиваемой кнопки (центр для попадания в круг). */
const BUTTON_W = 132;
const BUTTON_H = 44;
const TARGET_R = 56;
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

  const startX = width / 2 - BUTTON_W / 2;
  const startY = areaTop + areaH * 0.68;

  const [pos, setPos] = useState({ x: startX, y: startY });
  const posRef = useRef(pos);
  posRef.current = pos;

  const dragOrigin = useRef({ x: startX, y: startY });
  const gyroLast = useRef(Date.now());
  const holdAccum = useRef(0);
  const tickLast = useRef(Date.now());
  const [holdPct, setHoldPct] = useState(0);
  const completed = useRef(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const successMessage = useMemo(
    () =>
      mystery
        ? 'Вам достался случайный билет в случайное место. Удачи в пути!'
        : 'Бронь подтверждена. Списание произойдёт дважды — как положено в я.цыган.',
    [mystery],
  );

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
        const nx = clamp(p.x + y * 420 * dt, 12, width - BUTTON_W - 12);
        const ny = clamp(
          p.y - x * 420 * dt,
          areaTop + 8,
          areaTop + areaH - BUTTON_H - 8,
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
        onStartShouldSetPanResponder: () => !useGyro && !showSuccess,
        onMoveShouldSetPanResponder: () => !useGyro && !showSuccess,
        onPanResponderGrant: () => {
          dragOrigin.current = { ...posRef.current };
        },
        onPanResponderMove: (_, g) => {
          const nx = clamp(
            dragOrigin.current.x + g.dx,
            12,
            width - BUTTON_W - 12,
          );
          const ny = clamp(
            dragOrigin.current.y + g.dy,
            areaTop + 8,
            areaTop + areaH - BUTTON_H - 8,
          );
          setPos({ x: nx, y: ny });
        },
        onPanResponderRelease: () => {
          dragOrigin.current = { ...posRef.current };
        },
      }),
    [areaH, areaTop, showSuccess, useGyro, width],
  );

  useEffect(() => {
    const id = setInterval(() => {
      if (completed.current || showSuccess) return;
      const now = Date.now();
      const dt = now - tickLast.current;
      tickLast.current = now;
      const cx = posRef.current.x + BUTTON_W / 2;
      const cy = posRef.current.y + BUTTON_H / 2;
      const d = Math.hypot(cx - targetCx, cy - targetCy);
      const inside = d < TARGET_R - 8;
      if (inside) {
        holdAccum.current += dt;
      } else {
        holdAccum.current = 0;
      }
      setHoldPct(Math.min(100, (holdAccum.current / HOLD_MS) * 100));
      if (holdAccum.current >= HOLD_MS) {
        completed.current = true;
        holdAccum.current = 0;
        setHoldPct(100);
        setShowSuccess(true);
      }
    }, 80);
    return () => clearInterval(id);
  }, [showSuccess, targetCx, targetCy]);

  const hint = useGyro
    ? 'Наклоняйте устройство, чтобы кнопка оказалась в оранжевом круге.'
    : 'Перетащите кнопку в оранжевый круг и удерживайте, пока шкала не заполнится.';

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.back} onPress={() => navigation.goBack()}>
        ← Назад
      </Text>
      <Text style={styles.title}>Финальное действие</Text>
      <Text style={styles.sub}>{title}</Text>
      <Text style={styles.hint}>{hint}</Text>

      <View style={[styles.pit, { top: areaTop, height: areaH }]}>
        {showSuccess ? (
          <View style={styles.successInner}>
            <View style={styles.successBadge}>
              <Text style={styles.successCheck}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Готово</Text>
            <Text style={styles.successText}>{successMessage}</Text>
            <PrimaryButton
              title="Супер"
              onPress={() => navigation.popToTop()}
              style={styles.successBtn}
            />
          </View>
        ) : (
          <>
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
                  left: pos.x - 12,
                  top: pos.y - areaTop,
                  width: BUTTON_W,
                  height: BUTTON_H,
                },
              ]}>
              <Text style={styles.btnText}>Забронировать</Text>
            </View>
          </>
        )}
      </View>

      {!showSuccess ? (
        <Text style={styles.progress}>
          Удержание в зоне: {Math.round(holdPct)}%
        </Text>
      ) : null}
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
    borderRadius: BUTTON_H / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  btnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  progress: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    color: colors.textSecondary,
    fontWeight: '600',
  },
  successInner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(46,125,50,0.15)',
    borderWidth: 3,
    borderColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  successCheck: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.success,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 10,
  },
  successText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  successBtn: {
    alignSelf: 'stretch',
    maxWidth: 280,
  },
});
