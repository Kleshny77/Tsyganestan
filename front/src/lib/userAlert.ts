import { Alert, Platform, type AlertButton } from 'react-native';

/**
 * На web `Alert.alert` из react-native-web — пустая заглушка, пользователь ничего не видит.
 * Для ошибок входа/регистрации и прочих сообщений используем window.alert.
 */
export function userAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
): void {
  if (Platform.OS === 'web') {
    const text =
      message != null && message !== '' ? `${title}\n\n${message}` : title;
    window.alert(text);
    const withPress = buttons?.find(b => typeof b.onPress === 'function');
    withPress?.onPress?.();
    return;
  }
  if (buttons?.length) {
    Alert.alert(title, message, buttons);
  } else if (message != null) {
    Alert.alert(title, message);
  } else {
    Alert.alert(title);
  }
}
