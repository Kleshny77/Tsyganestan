import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function OutlineButton({ title, onPress, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        pressed && styles.pressed,
        style,
      ]}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  pressed: { opacity: 0.85 },
  text: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '700',
  },
});
