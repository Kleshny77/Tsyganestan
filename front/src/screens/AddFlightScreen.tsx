import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackRow } from '../components/BackRow';
import { LabeledField } from '../components/LabeledField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../context/AppContext';
import type { FlightsStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<FlightsStackParamList, 'AddFlight'>;

export function AddFlightScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { addFlight, user } = useApp();
  const [airlineName, setAirlineName] = useState('');
  const [routeFrom, setRouteFrom] = useState('');
  const [routeTo, setRouteTo] = useState('');
  const [dateLabel, setDateLabel] = useState('');
  const [timeLabel, setTimeLabel] = useState('');
  const [first, setFirst] = useState('85000');
  const [business, setBusiness] = useState('55000');
  const [economy, setEconomy] = useState('35000');

  const save = () => {
    const owner = user?.companyName || user?.email || 'company';
    addFlight({
      airlineName: airlineName.trim() || 'Ваша авиакомпания',
      routeFrom: routeFrom.trim() || 'Откуда-то',
      routeTo: routeTo.trim() || 'Куда-то',
      dateLabel: dateLabel.trim() || 'скоро',
      timeLabel: timeLabel.trim() || '00:00',
      ownerCompanyId: owner,
      categories: [
        { id: 'first', name: 'Первый', price: Number(first) || 0, lockedByDefault: false },
        { id: 'business', name: 'Бизнес', price: Number(business) || 0, lockedByDefault: true },
        { id: 'economy', name: 'Эконом', price: Number(economy) || 0, lockedByDefault: true },
      ],
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
      <Text style={styles.title}>Новый рейс</Text>
      <Text style={styles.sub}>Появится во вкладке «Мои авиабилеты».</Text>

      <LabeledField label="Авиакомпания" value={airlineName} onChangeText={setAirlineName} />
      <LabeledField label="Откуда" value={routeFrom} onChangeText={setRouteFrom} />
      <LabeledField label="Куда" value={routeTo} onChangeText={setRouteTo} />
      <LabeledField label="Дата (как на карточке)" value={dateLabel} onChangeText={setDateLabel} />
      <LabeledField label="Время" value={timeLabel} onChangeText={setTimeLabel} />
      <Text style={styles.blockTitle}>Цены по классам (₽)</Text>
      <LabeledField label="Первый класс" value={first} onChangeText={setFirst} keyboardType="number-pad" />
      <LabeledField label="Бизнес" value={business} onChangeText={setBusiness} keyboardType="number-pad" />
      <LabeledField label="Эконом" value={economy} onChangeText={setEconomy} keyboardType="number-pad" />

      <PrimaryButton title="Опубликовать рейс" onPress={save} style={{ marginTop: 12 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 28, fontWeight: '900', marginTop: 8 },
  sub: { marginTop: 8, color: colors.textSecondary, marginBottom: 12 },
  blockTitle: { marginTop: 8, marginBottom: 4, fontWeight: '800', color: colors.text },
});
