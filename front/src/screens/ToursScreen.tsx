import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../context/AppContext';
import type { ToursStackParamList } from '../navigation/types';
import type { Tour } from '../types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<ToursStackParamList, 'ToursHome'>;

function matchesSearch(t: Tour, q: string) {
  if (!q.trim()) return true;
  const s = `${t.companyName} ${t.title} ${t.description} ${t.countries.join(' ')} ${t.cities.join(' ')}`.toLowerCase();
  return s.includes(q.toLowerCase());
}

export function ToursScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const {
    accountType,
    user,
    apiUserId,
    tours,
    getAllowedSearchLetters,
    isTourUnlocked,
  } = useApp();
  const [q, setQ] = useState('');
  const [bizTab, setBizTab] = useState<'all' | 'mine'>('all');

  const allowed = getAllowedSearchLetters();
  const allowedSet = useMemo(() => new Set(allowed), [allowed]);

  const onChangeQuery = (t: string) => {
    const lower = t.toLowerCase();
    const next = [...lower]
      .filter(ch => ch === ' ' || allowedSet.has(ch))
      .join('');
    setQ(next);
  };

  const ownerKey = user?.companyName || user?.email || '';

  const list = useMemo(() => {
    let base = tours.filter(x => matchesSearch(x, q));
    if (accountType === 'business' && bizTab === 'mine') {
      base = base.filter(t => {
        if (apiUserId != null && t.createdBy != null) {
          return t.createdBy === apiUserId;
        }
        return !!(t.ownerCompanyId && t.ownerCompanyId === ownerKey);
      });
    }
    return base;
  }, [accountType, apiUserId, bizTab, ownerKey, q, tours]);

  const hintLetters =
    accountType === 'business'
      ? 'Бизнес-аккаунт: поиск без ограничений по буквам.'
      : `Доступны только буквы: ${allowed.join(', ')}`;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.title}>Плохие туры</Text>
      <Text style={styles.sub}>Худшие предложения на рынке</Text>

      {accountType === 'business' ? (
        <View style={styles.segment}>
          <Seg
            label="Все туры"
            active={bizTab === 'all'}
            onPress={() => setBizTab('all')}
          />
          <Seg
            label="Мои туры"
            active={bizTab === 'mine'}
            onPress={() => setBizTab('mine')}
          />
        </View>
      ) : null}

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={q}
          onChangeText={onChangeQuery}
          placeholder="Поиск туров..."
          placeholderTextColor={colors.textMuted}
          style={styles.search}
        />
      </View>
      <View style={styles.hintRow}>
        <Text style={styles.hintIcon}>💡</Text>
        <Text style={styles.hint}>{hintLetters}</Text>
      </View>

      {accountType === 'business' && bizTab === 'mine' ? (
        <Pressable
          style={styles.fab}
          onPress={() => navigation.navigate('AddTour')}
          accessibilityLabel="Добавить тур">
          <Text style={styles.fabText}>＋</Text>
        </Pressable>
      ) : null}

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
          paddingTop: 8,
        }}
        showsVerticalScrollIndicator={false}>
        {list.map(t => (
          <TourCard
            key={t.id}
            tour={t}
            unlocked={isTourUnlocked(t)}
            onBook={() =>
              navigation.navigate('GyroBooking', { kind: 'tour', tourId: t.id })
            }
            onGift={() => navigation.navigate('Gift', { kind: 'tour' })}
          />
        ))}
        {list.length === 0 ? (
          <Text style={styles.empty}>Пусто. Добавьте тур или смените поиск.</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Seg({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.seg, active && styles.segActive]}>
      <Text style={[styles.segText, active && styles.segTextActive]}>{label}</Text>
    </Pressable>
  );
}

function TourCard({
  tour,
  unlocked,
  onBook,
  onGift,
}: {
  tour: Tour;
  unlocked: boolean;
  onBook: () => void;
  onGift: () => void;
}) {
  return (
    <View style={styles.card}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.gallery}>
          {tour.galleryUris?.length
            ? tour.galleryUris.map((u, i) => (
                <Image key={i} source={{ uri: u }} style={styles.gimg} />
              ))
            : tour.galleryEmoji.map((e, i) => (
                <View key={i} style={styles.gph}>
                  <Text style={styles.gemoji}>{e}</Text>
                </View>
              ))}
        </View>
      </ScrollView>
      <View style={styles.cardTop}>
        <Text style={styles.company}>{tour.companyName}</Text>
        <Text style={styles.star}>⭐ {tour.rating.toFixed(1)}</Text>
      </View>
      <Text style={styles.ttitle}>{tour.title}</Text>
      <Text style={styles.desc}>{tour.description}</Text>
      <Text style={styles.tagHead}>Страны</Text>
      <View style={styles.tags}>
        {tour.countries.map(c => (
          <View key={c} style={[styles.tag, styles.tagBlue]}>
            <Text style={styles.tagBlueT}>{c}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.tagHead}>Города</Text>
      <View style={styles.tags}>
        {tour.cities.map(c => (
          <View key={c} style={[styles.tag, styles.tagGreen]}>
            <Text style={styles.tagGreenT}>{c}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.tagHead}>Достопримечательности</Text>
      <View style={styles.tags}>
        {tour.sights.map(c => (
          <View key={c} style={[styles.tag, styles.tagPurple]}>
            <Text style={styles.tagPurpleT}>{c}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.price}>
        {tour.price.toLocaleString('ru-RU')}₽
      </Text>
      <View style={styles.actions}>
        <PrimaryButton
          title={unlocked ? 'Забронировать' : 'Заблокировано 🔒'}
          onPress={() => {
            if (!unlocked) {
              Alert.alert(
                'Тур закрыт',
                'Купите ачивку в профиле, чтобы открыть это направление.',
              );
              return;
            }
            onBook();
          }}
          style={{ flex: 1, opacity: unlocked ? 1 : 0.55 }}
        />
        <Pressable style={styles.giftBtn} onPress={onGift}>
          <Text style={styles.giftEmoji}>🎁</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  sub: { fontSize: 15, color: colors.textSecondary, marginTop: 6, marginBottom: 12 },
  segment: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  seg: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  segActive: { borderColor: colors.text, backgroundColor: '#fff' },
  segText: { fontWeight: '600', color: colors.textSecondary },
  segTextActive: { color: colors.text },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  search: { flex: 1, paddingVertical: 12, fontSize: 16, color: colors.text },
  hintRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  hintIcon: { fontSize: 14, marginTop: 2 },
  hint: { flex: 1, color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', marginTop: -2 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gallery: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  gph: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gemoji: { fontSize: 32 },
  gimg: { width: 72, height: 72, borderRadius: 14, backgroundColor: colors.surface },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  company: { color: colors.textSecondary, fontWeight: '600' },
  star: { color: colors.star, fontWeight: '700' },
  ttitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 8 },
  desc: { color: colors.textSecondary, marginTop: 6, lineHeight: 20 },
  tagHead: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  tagBlue: { backgroundColor: colors.tagBlue },
  tagBlueT: { color: colors.tagBlueText, fontWeight: '700', fontSize: 13 },
  tagGreen: { backgroundColor: colors.tagGreen },
  tagGreenT: { color: colors.tagGreenText, fontWeight: '700', fontSize: 13 },
  tagPurple: { backgroundColor: colors.tagPurple },
  tagPurpleT: { color: colors.tagPurpleText, fontWeight: '700', fontSize: 13 },
  price: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14, alignItems: 'center' },
  giftBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFE4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftEmoji: { fontSize: 22 },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 },
});
