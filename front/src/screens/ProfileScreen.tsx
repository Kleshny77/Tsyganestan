import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PointsBanner } from '../components/PointsBanner';
import { useApp } from '../context/AppContext';
import type { ProfileStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>;

export function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const {
    user,
    points,
    logout,
    earnedBadges,
    setAvatar,
    accountType,
    apiRole,
  } = useApp();

  const pickAvatar = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo' });
    const uri = res.assets?.[0]?.uri;
    if (uri) setAvatar(uri);
  };

  const initial = (user?.name?.[0] ?? '?').toUpperCase();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingHorizontal: 20,
        paddingBottom: insets.bottom + 120,
      }}>
      <Text style={styles.title}>Профиль</Text>
      <Text style={styles.sub}>Ваши данные и достижения</Text>

      <View style={styles.card}>
        <Pressable onPress={pickAvatar} style={styles.avatarWrap}>
          {user?.avatarUri ? (
            <Image source={{ uri: user.avatarUri }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarLetter}>{initial}</Text>
            </View>
          )}
        </Pressable>
        <View style={styles.userMeta}>
          <Text style={styles.name}>{user?.name ?? 'Гость'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {apiRole ? (
            <Text style={styles.rolePill}>
              {apiRole === 'tour_agent'
                ? '🗺 Турагент'
                : apiRole === 'admin'
                  ? '🔑 Админ'
                  : '👤 Путешественник'}
            </Text>
          ) : null}
          {accountType === 'business' && user?.companyName ? (
            <Text style={styles.company}>{user.companyName}</Text>
          ) : null}
        </View>
      </View>

      <PointsBanner points={points} />

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Мини-игры</Text>
        <Text style={styles.trend}>📈</Text>
      </View>
      <View style={styles.grid}>
        <GameTile
          emoji="🌱"
          title="Потрогай траву"
          sub="+20 баллов"
          subColor={colors.success}
          onPress={() => navigation.navigate('TouchGrass')}
        />
        <GameTile
          emoji="🎰"
          title="Казино"
          sub="До 100 баллов"
          subColor={colors.primary}
          onPress={() => navigation.navigate('Casino')}
        />
        <GameTile
          emoji="📱"
          title="Потряси"
          sub="100 раз"
          subColor={colors.businessBlue}
          onPress={() => navigation.navigate('Shake')}
        />
        <GameTile
          emoji="🏃"
          title="Шагомер"
          sub="150 шагов / мин"
          subColor={colors.tagPurpleText}
          onPress={() => navigation.navigate('Steps')}
        />
      </View>

      <Pressable
        style={styles.storeRow}
        onPress={() => navigation.navigate('Achievements')}>
        <Text style={styles.storeTitle}>Ачивки</Text>
        <Text style={styles.storeIcon}>🏅</Text>
      </Pressable>

      <Text style={styles.badgeSection}>Полученные ачивки</Text>
      {earnedBadges.length === 0 ? (
        <Text style={styles.muted}>Пока пусто — совершайте подвиги.</Text>
      ) : (
        earnedBadges.map(b => (
          <View key={b.id} style={styles.badgeCard}>
            <Text style={styles.badgeTitle}>{b.title}</Text>
            <Text style={styles.badgeDesc}>{b.description}</Text>
          </View>
        ))
      )}

      <Text style={styles.badgeSection}>Не полученные</Text>
      <Text style={styles.muted}>
        Расширим список, когда появится бэкенд и события.
      </Text>

      <Pressable
        style={styles.logout}
        onPress={() => {
          logout();
        }}>
        <Text style={styles.logoutText}>Выйти</Text>
      </Pressable>
    </ScrollView>
  );
}

function GameTile({
  emoji,
  title,
  sub,
  subColor,
  onPress,
}: {
  emoji: string;
  title: string;
  sub: string;
  subColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.tile}>
      <Text style={styles.tileEmoji}>{emoji}</Text>
      <Text style={styles.tileTitle}>{title}</Text>
      <Text style={[styles.tileSub, { color: subColor }]}>{sub}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 28, fontWeight: '900', color: colors.text },
  sub: { fontSize: 15, color: colors.textSecondary, marginTop: 6 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 14,
  },
  avatarWrap: { borderRadius: 999, overflow: 'hidden' },
  avatarImg: { width: 72, height: 72, borderRadius: 999 },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: '#fff', fontSize: 32, fontWeight: '800' },
  userMeta: { flex: 1 },
  name: { fontSize: 20, fontWeight: '800', color: colors.text },
  email: { color: colors.textSecondary, marginTop: 4 },
  rolePill: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  company: { color: colors.businessBlue, marginTop: 6, fontWeight: '700' },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  trend: { fontSize: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tileEmoji: { fontSize: 28, marginBottom: 8 },
  tileTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  tileSub: { marginTop: 6, fontWeight: '700', fontSize: 13 },
  storeRow: {
    marginTop: 28,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  storeTitle: { fontSize: 18, fontWeight: '800' },
  storeIcon: { fontSize: 22 },
  badgeSection: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  muted: { color: colors.textSecondary, marginTop: 8, lineHeight: 20 },
  badgeCard: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeTitle: { fontWeight: '800', color: colors.text },
  badgeDesc: { color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  logout: {
    marginTop: 28,
    backgroundColor: colors.dangerBg,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  logoutText: { color: colors.danger, fontWeight: '800', fontSize: 16 },
});
