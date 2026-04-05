/**
 * Web: пакет react-native-linear-gradient тянет requireNativeComponent, которого нет в react-native-web.
 * Импорт пакета в любом экране ломает весь бандл до первого рендера.
 */
import React from 'react';
import { View } from 'react-native';

export default function LinearGradient({
  colors,
  style,
  children,
  ...rest
}) {
  const bg =
    Array.isArray(colors) && colors.length > 0 ? colors[0] : '#888888';
  return (
    <View style={[{ backgroundColor: bg }, style]} {...rest}>
      {children}
    </View>
  );
}
