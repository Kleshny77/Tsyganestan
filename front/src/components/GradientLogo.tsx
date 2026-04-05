import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';

export function GradientLogo() {
  const inner = (
    <Text style={styles.plane} accessibilityLabel="Самолёт">
      ✈️
    </Text>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.box, { backgroundColor: colors.primary }]}>
        {inner}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#FF4500', '#FF8A00']}
      style={styles.box}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}>
      {inner}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  plane: { fontSize: 40, color: '#fff' },
});
