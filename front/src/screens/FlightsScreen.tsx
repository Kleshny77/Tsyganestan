import React, { useMemo, useState } from 'react';
import {
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
import type { FlightsStackParamList } from '../navigation/types';
import type { Flight } from '../types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<FlightsStackParamList, 'FlightsHome'>;

function matchesSearch(f: Flight, q: string) {
  if (!q.trim()) return true;
  const s = `${f.airlineName} ${f.routeFrom} ${f.routeTo}`.toLowerCase();
  return s.includes(q.toLowerCase());
}

export function FlightsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const {
    accountType,
    user,
    flights,
    getAllowedSearchLetters,
    isCategoryUnlocked,
  } = useApp();
  const [q, setQ] = useState('');
  const [bizTab, setBizTab] = useState<'all' | 'mine'>('all');
  const [selectedCat, setSelectedCat] = useState<Record<string, string>>({});

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
    let base = flights.filter(f => matchesSearch(f, q));
    if (accountType === 'business' && bizTab === 'mine') {
      base = base.filter(f => f.ownerCompanyId && f.ownerCompanyId === ownerKey);
    }
    return base;
  }, [accountType, bizTab, flights, ownerKey, q]);

  const hintLetters =
    accountType === 'business'
      ? 'Бизнес-аккаунт: поиск без ограничений по буквам.'
      : `Доступны только буквы: ${allowed.join(', ')}`;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.title}>Дорогие авиабилеты</Text>
      <Text style={styles.sub}>Только самые премиум предложения</Text>

      {accountType === 'business' ? (
        <View style={styles.segment}>
          <Seg
            label="Все авиабилеты"
            active={bizTab === 'all'}
            onPress={() => setBizTab('all')}
          />
          <Seg
            label="Мои авиабилеты"
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
          placeholder="Поиск рейсов..."
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
          onPress={() => navigation.navigate('AddFlight')}
          accessibilityLabel="Добавить рейс">
          <Text style={styles.fabText}>＋</Text>
        </Pressable>
      ) : null}

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
          paddingTop: 8,
        }}
        showsVerticalScrollIndicator={false}>
        {list.map(f => (
          <FlightCard
            key={f.id}
            flight={f}
            selectedCategoryId={selectedCat[f.id] ?? f.categories[0]?.id}
            onSelectCategory={cid => setSelectedCat(s => ({ ...s, [f.id]: cid }))}
            isCategoryUnlocked={isCategoryUnlocked}
            onBook={() => {
              const cid = selectedCat[f.id] ?? f.categories[0]?.id;
              navigation.navigate('GyroBooking', {
                kind: 'flight',
                flightId: f.id,
                categoryId: cid,
              });
            }}
            onGift={() =>
              navigation.navigate('Gift', { kind: 'flight' })
            }
          />
        ))}
        {list.length === 0 ? (
          <Text style={styles.empty}>Ничего не найдено — попробуйте другие буквы.</Text>
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

function FlightCard({
  flight,
  selectedCategoryId,
  onSelectCategory,
  isCategoryUnlocked,
  onBook,
  onGift,
}: {
  flight: Flight;
  selectedCategoryId?: string;
  onSelectCategory: (id: string) => void;
  isCategoryUnlocked: (c: { lockedByDefault: boolean }) => boolean;
  onBook: () => void;
  onGift: () => void;
}) {
  const cat = flight.categories.find(c => c.id === selectedCategoryId);
  const topPrice = cat?.price ?? flight.categories[0]?.price ?? 0;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.airline}>{flight.airlineName}</Text>
        <Text style={styles.price}>{topPrice.toLocaleString('ru-RU')}₽</Text>
      </View>
      <Text style={styles.route}>
        {flight.routeFrom} → {flight.routeTo}
      </Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>📅 {flight.dateLabel}</Text>
        <Text style={styles.meta}>🕐 {flight.timeLabel}</Text>
      </View>
      <View style={styles.catRow}>
        {flight.categories.map(c => {
          const unlocked = isCategoryUnlocked(c);
          const active = c.id === selectedCategoryId;
          return (
            <Pressable
              key={c.id}
              onPress={() => unlocked && onSelectCategory(c.id)}
              style={[
                styles.chip,
                active && styles.chipActive,
                !unlocked && styles.chipDisabled,
              ]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {c.name} {!unlocked ? '🔒' : ''}
              </Text>
              <Text
                style={[
                  styles.chipPrice,
                  active && styles.chipPriceActive,
                  !unlocked && styles.chipPriceDisabled,
                ]}>
                {c.price.toLocaleString('ru-RU')}₽
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.actions}>
        <PrimaryButton
          title="Забронировать"
          onPress={onBook}
          style={{ flex: 1 }}
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
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  airline: { fontSize: 17, fontWeight: '800', color: colors.text, flex: 1 },
  price: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primary,
    marginLeft: 12,
  },
  route: { marginTop: 6, color: colors.textSecondary, fontWeight: '600' },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 10 },
  meta: { color: colors.textSecondary, fontSize: 14 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
    minWidth: '30%',
    flexGrow: 1,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: '#FFF3E8' },
  chipDisabled: { opacity: 0.45 },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.text },
  chipTextActive: { color: colors.primary },
  chipPrice: { fontSize: 12, color: colors.textSecondary, marginTop: 4, fontWeight: '600' },
  chipPriceActive: { color: colors.primary },
  chipPriceDisabled: { color: colors.textMuted },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16, alignItems: 'center' },
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
