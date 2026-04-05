import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

type Props = { onPress: () => void };

export function BackRow({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      style={styles.row}
      accessibilityRole="button"
      accessibilityLabel="Назад">
      <Text style={styles.arrow}>←</Text>
      <Text style={styles.text}>Назад</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  arrow: { fontSize: 18, color: colors.textSecondary },
  text: { fontSize: 16, color: colors.textSecondary, fontWeight: '500' },
});
