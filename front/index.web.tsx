/**
 * Точка входа только для webpack/web.
 * AppRegistry.runApplication на web с RN 0.84 + React 19 часто оставляет пустой #root.
 */
import 'react-native-gesture-handler';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { StyleSheet, Text, View } from 'react-native';
import App from './App';

class WebBootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[tsyganestan web]', error);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={bootErrStyles.box}>
          <Text style={bootErrStyles.title}>Ошибка при запуске (web)</Text>
          <Text style={bootErrStyles.msg}>{this.state.error.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const bootErrStyles = StyleSheet.create({
  box: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '700', color: '#b00020', marginBottom: 8 },
  msg: { fontSize: 14, color: '#333' },
});

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(
    <React.StrictMode>
      <WebBootErrorBoundary>
        <App />
      </WebBootErrorBoundary>
    </React.StrictMode>,
  );
}
