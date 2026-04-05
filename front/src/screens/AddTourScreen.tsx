import React, { useState } from 'react';
import {
  Alert,
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
import { ApiError } from '../api/client';
import { createTour } from '../api/tours';
import { BackRow } from '../components/BackRow';
import { LabeledField } from '../components/LabeledField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../context/AppContext';
import type { ToursStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<ToursStackParamList, 'AddTour'>;

function splitList(s: string) {
  return s
    .split(/[,;]/g)
    .map(x => x.trim())
    .filter(Boolean);
}

export function AddTourScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { addTour, apiToken, refreshTours, user } = useApp();
  const [companyName, setCompanyName] = useState(user?.companyName ?? '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('45000');
  const [countries, setCountries] = useState('');
  const [cities, setCities] = useState('');
  const [sights, setSights] = useState('');
  const [uris, setUris] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const pickPhotos = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 5 });
    const next = res.assets?.map(a => a.uri).filter(Boolean) as string[];
    if (next?.length) setUris(u => [...u, ...next].slice(0, 6));
  };

  const save = async () => {
    const owner = user?.companyName || user?.email || 'company';
    const co = companyName.trim() || 'Ваше агентство';
    const ti = title.trim() || 'Без названия';
    const desc = description.trim() || 'Описание появится позже.';
    const pr = Number(price.replace(/\s/g, '')) || 0;
    const cList = splitList(countries);
    const cityList = splitList(cities);
    const sightList = splitList(sights);

    if (apiToken) {
      const location = [co, cList.join(', '), cityList.join(', '), sightList.join(', ')]
        .filter(Boolean)
        .join(' | ')
        .slice(0, 2000);
      setSaving(true);
      try {
        await createTour(
          { title: ti, description: desc, price: pr, location },
          apiToken,
        );
        await refreshTours();
        navigation.goBack();
      } catch (e) {
        const msg =
          e instanceof ApiError
            ? e.message
            : 'Проверьте роль турагента и подключение к сети.';
        Alert.alert('Не сохранилось', String(msg));
      } finally {
        setSaving(false);
      }
      return;
    }

    addTour({
      companyName: co,
      title: ti,
      description: desc,
      rating: 1.2,
      price: pr,
      countries: cList.length ? cList : ['Страна'],
      cities: cityList.length ? cityList : ['Город'],
      sights: sightList.length ? sightList : ['Достопримечательность'],
      galleryEmoji: uris.length ? [] : ['📷', '🧳', '🗺️'],
      galleryUris: uris.length ? uris : undefined,
      ownerCompanyId: owner,
    });
    navigation.goBack();
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingHorizontal: 24,
        paddingBottom: insets.bottom + 24,
      }}>
      <BackRow onPress={() => navigation.goBack()} />
      <Text style={styles.title}>Новый тур</Text>
      <Text style={styles.sub}>
        {apiToken
          ? 'Публикация на сервере я.цыган (Railway).'
          : 'Локально — войдите, чтобы сохранять на бэкенд.'}
      </Text>

      <LabeledField label="Компания" value={companyName} onChangeText={setCompanyName} />
      <LabeledField label="Название" value={title} onChangeText={setTitle} />
      <LabeledField
        label="Описание"
        value={description}
        onChangeText={setDescription}
        multiline
        style={{ minHeight: 100, textAlignVertical: 'top' }}
      />
      <LabeledField label="Цена (₽)" value={price} onChangeText={setPrice} keyboardType="number-pad" />
      <LabeledField
        label="Страны (через запятую)"
        value={countries}
        onChangeText={setCountries}
      />
      <LabeledField label="Города" value={cities} onChangeText={setCities} />
      <LabeledField label="Достопримечательности" value={sights} onChangeText={setSights} />

      <Text style={styles.photosTitle}>Фотографии (только локальный режим)</Text>
      <Pressable style={styles.photoBtn} onPress={pickPhotos}>
        <Text style={styles.photoBtnText}>Добавить из галереи</Text>
      </Pressable>
      <View style={styles.thumbs}>
        {uris.map(u => (
          <Image key={u} source={{ uri: u }} style={styles.thumb} />
        ))}
      </View>

      <PrimaryButton
        title={saving ? 'Публикуем…' : 'Опубликовать тур'}
        onPress={save}
        disabled={saving}
        style={{ marginTop: 16 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 28, fontWeight: '900', marginTop: 8, color: colors.text },
  sub: { marginTop: 8, color: colors.textSecondary, marginBottom: 12, lineHeight: 20 },
  photosTitle: { marginTop: 8, fontWeight: '800', color: colors.text },
  photoBtn: {
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  photoBtnText: { fontWeight: '700', color: colors.primary },
  thumbs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  thumb: { width: 72, height: 72, borderRadius: 12 },
});
