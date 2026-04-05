import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { STORE_ITEMS } from '../data/mockCatalog';
import type { ProfileStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Achievements'>;

export function AchievementsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { buyAchievement, hasPurchased, points } = useApp();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <View style={styles.headRow}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>
          ← Назад
        </Text>
      </View>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Ачивки</Text>
        <Text style={styles.medal}>🏅</Text>
      </View>
      <Text style={styles.balance}>Баланс: {points} баллов</Text>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}>
        {STORE_ITEMS.map(item => {
          const owned = hasPurchased(item.id);
          return (
            <View key={item.id} style={styles.card}>
              <Text style={styles.icon}>{item.icon}</Text>
              <View style={styles.mid}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.description}</Text>
                <Text style={styles.price}>{item.price} баллов</Text>
              </View>
              <Pressable
                disabled={owned}
                onPress={() => {
                  const r = buyAchievement(item.id);
                  if (r.ok) {
                    Alert.alert('Куплено', `${item.title} теперь ваше.`);
                  } else {
                    Alert.alert('Не вышло', r.message ?? '');
                  }
                }}
                style={[styles.buyWrap, owned && styles.buyDisabled]}>
                <Text style={styles.buyText}>{owned ? 'Есть' : 'Купить'}</Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 },
  headRow: { marginBottom: 8 },
  back: { color: colors.textSecondary, fontSize: 16, fontWeight: '600' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 28, fontWeight: '900', color: colors.text },
  medal: { fontSize: 26 },
  balance: { marginTop: 8, marginBottom: 16, color: colors.textSecondary, fontWeight: '600' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    gap: 12,
  },
  icon: { fontSize: 28 },
  mid: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  itemDesc: { color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  price: { marginTop: 6, color: colors.primary, fontWeight: '800' },
  buyWrap: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  buyDisabled: { backgroundColor: colors.border },
  buyText: { color: '#fff', fontWeight: '800' },
});
