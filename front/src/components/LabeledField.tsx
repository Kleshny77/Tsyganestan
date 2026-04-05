import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { colors } from '../theme/colors';

type Props = TextInputProps & {
  label: string;
  /** Эмодзи слева в поле (как в макете: конверт, ключ). */
  icon?: string;
};

export function LabeledField({ label, icon, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <TextInput
          placeholderTextColor={colors.inputPlaceholder}
          style={[styles.input, icon && styles.inputWithIcon, style]}
          {...rest}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 18 },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  icon: {
    fontSize: 18,
    marginRight: 10,
    color: colors.textMuted,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  inputWithIcon: {
    paddingVertical: 14,
  },
});
