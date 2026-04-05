import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthScreen from './src/screens/AuthScreen';
import ToursScreen from './src/screens/ToursScreen';
import ProfileScreen from './src/screens/ProfileScreen';

type Tab = 'tours' | 'profile';

const ACCENT = '#0A5C8A';
const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'tours', label: 'Туры', icon: '✈️' },
  { key: 'profile', label: 'Профиль', icon: '👤' },
];

function MainApp() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('tours');

  if (!token) {
    return <AuthScreen />;
  }

  return (
    <View style={styles.appContainer}>
      <View style={styles.screen}>
        {activeTab === 'tours' && <ToursScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </View>
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}>
            <Text style={[styles.tabIcon, activeTab === tab.key && styles.tabIconActive]}>
              {tab.icon}
            </Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {activeTab === tab.key && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F0F4F8' },
  appContainer: { flex: 1, backgroundColor: '#F0F4F8' },
  screen: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E8EDF2',
    paddingBottom: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
    position: 'relative',
  },
  tabIcon: { fontSize: 22, marginBottom: 2 },
  tabIconActive: { transform: [{ scale: 1.1 }] },
  tabLabel: { fontSize: 11, color: '#AAB', fontWeight: '500' },
  tabLabelActive: { color: ACCENT, fontWeight: '700' },
  tabIndicator: {
    position: 'absolute',
    top: 0,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: ACCENT,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
});
