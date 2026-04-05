import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';

type Props = { points: number };

export function PointsBanner({ points }: Props) {
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.banner, { backgroundColor: colors.primary }]}>
        <Text style={styles.label}>Ваши баллы</Text>
        <Text style={styles.value}>{points}</Text>
        <Text style={styles.hint}>Играйте в мини-игры для заработка</Text>
        <Text style={styles.ribbon}>🏅</Text>
      </View>
    );
  }
  return (
    <LinearGradient
      colors={['#FF4500', '#FF7043']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.banner}>
      <Text style={styles.label}>Ваши баллы</Text>
      <Text style={styles.value}>{points}</Text>
      <Text style={styles.hint}>Играйте в мини-игры для заработка</Text>
      <Text style={styles.ribbon}>🏅</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    overflow: 'hidden',
  },
  label: { color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: 15 },
  value: { color: '#fff', fontSize: 40, fontWeight: '900', marginTop: 4 },
  hint: { color: 'rgba(255,255,255,0.85)', marginTop: 6, fontSize: 13 },
  ribbon: { position: 'absolute', right: 14, top: 14, fontSize: 22 },
});
