import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OutlineButton } from '../components/OutlineButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { GradientLogo } from '../components/GradientLogo';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24 }]}>
      <View style={styles.center}>
        <GradientLogo />
        <Text style={styles.brand}>я.цыган</Text>
        <Text style={styles.title}>Дорогие билеты и плохие туры</Text>
        <Text style={styles.tagline}>Сервис, который вы заслужили</Text>
      </View>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <PrimaryButton
          title="Войти"
          onPress={() => navigation.navigate('Login')}
          style={styles.mb}
        />
        <OutlineButton
          title="Зарегистрироваться"
          onPress={() => navigation.navigate('SignupAccountType')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  brand: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: { gap: 0 },
  mb: { marginBottom: 12 },
});
