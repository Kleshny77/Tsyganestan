import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackRow } from '../components/BackRow';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../context/AppContext';
import type { ProfileStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<ProfileStackParamList, 'TouchGrass'>;

/** Заглушка под будущую on-device / серверную модель. */
async function mockGrassAi(_uri: string): Promise<boolean> {
  await new Promise<void>(resolve => setTimeout(resolve, 900));
  return Math.random() > 0.15;
}

export function TouchGrassScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { addPoints, awardBadge } = useApp();
  const [busy, setBusy] = useState(false);

  const onPick = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo' });
    const uri = res.assets?.[0]?.uri;
    if (!uri) return;
    setBusy(true);
    try {
      const ok = await mockGrassAi(uri);
      if (ok) {
        addPoints(20);
        awardBadge({
          id: 'grass_touch',
          title: 'Прикосновение к природе',
          description: 'Вы доказали контакт с травой.',
        });
        Alert.alert('+20 баллов', 'ИИ доволен. Продолжайте трогать реальность.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Не засчитано', 'Похоже, это не трава. Или модель в плохом настроении.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <BackRow onPress={() => navigation.goBack()} />
      <Text style={styles.title}>Потрогай траву</Text>
      <Text style={styles.sub}>
        Сфотографируйтесь на улице с травой. Локальная «ИИ»-проверка (пока
        заглушка) решит, засчитать ли попытку.
      </Text>
      {busy ? <ActivityIndicator size="large" style={{ marginTop: 24 }} /> : null}
      <View style={{ flex: 1 }} />
      <PrimaryButton
        title={busy ? 'Проверяем…' : 'Загрузить фото'}
        onPress={onPick}
        disabled={busy}
        style={{ marginBottom: insets.bottom + 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24 },
  title: { fontSize: 26, fontWeight: '900', color: colors.text, marginTop: 8 },
  sub: { marginTop: 12, color: colors.textSecondary, lineHeight: 22, fontSize: 15 },
});
