import React from 'react';
import {
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { AppProvider } from './src/context/AppContext';
import { RootNavigator } from './src/navigation/RootNavigator';

if (Platform.OS !== 'web') {
  enableScreens(true);
}

/** Web: без initialMetrics SafeAreaProvider рендерит null, пока не сработает useEffect — часто «вечный» белый экран. */
function webSafeAreaInitialMetrics() {
  const { width, height } = Dimensions.get('window');
  return {
    frame: { x: 0, y: 0, width, height },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
  };
}

function App() {
  const isDark = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView
      style={[styles.root, Platform.OS === 'web' && styles.rootWeb]}>
      <SafeAreaProvider
        initialMetrics={
          Platform.OS === 'web' ? webSafeAreaInitialMetrics() : undefined
        }>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <AppProvider>
          <RootNavigator />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  /** Корень без высоты на web → flex:1 даёт 0px и пустой экран. */
  rootWeb: { minHeight: '100vh', width: '100%' },
});

export default App;
