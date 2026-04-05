import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createBottomTabNavigator,
  type BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import { useApp } from '../context/AppContext';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupAccountTypeScreen } from '../screens/SignupAccountTypeScreen';
import { RegisterFormScreen } from '../screens/RegisterFormScreen';
import { FlightsScreen } from '../screens/FlightsScreen';
import { ToursScreen } from '../screens/ToursScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { GyroBookingScreen } from '../screens/GyroBookingScreen';
import { GiftScreen } from '../screens/GiftScreen';
import { AchievementsScreen } from '../screens/AchievementsScreen';
import { TouchGrassScreen } from '../screens/TouchGrassScreen';
import { CasinoScreen } from '../screens/CasinoScreen';
import { ShakeScreen } from '../screens/ShakeScreen';
import { StepsScreen } from '../screens/StepsScreen';
import { AddFlightScreen } from '../screens/AddFlightScreen';
import { AddTourScreen } from '../screens/AddTourScreen';
import { colors } from '../theme/colors';
import type {
  FlightsStackParamList,
  MainTabParamList,
  ProfileStackParamList,
  RootStackParamList,
  ToursStackParamList,
} from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const FlightsStack = createNativeStackNavigator<FlightsStackParamList>();
const ToursStack = createNativeStackNavigator<ToursStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

function FlightsNavigator() {
  return (
    <FlightsStack.Navigator screenOptions={{ headerShown: false }}>
      <FlightsStack.Screen name="FlightsHome" component={FlightsScreen} />
      <FlightsStack.Screen name="GyroBooking" component={GyroBookingScreen} />
      <FlightsStack.Screen name="Gift" component={GiftScreen} />
      <FlightsStack.Screen name="AddFlight" component={AddFlightScreen} />
    </FlightsStack.Navigator>
  );
}

function ToursNavigator() {
  return (
    <ToursStack.Navigator screenOptions={{ headerShown: false }}>
      <ToursStack.Screen name="ToursHome" component={ToursScreen} />
      <ToursStack.Screen name="GyroBooking" component={GyroBookingScreen} />
      <ToursStack.Screen name="Gift" component={GiftScreen} />
      <ToursStack.Screen name="AddTour" component={AddTourScreen} />
    </ToursStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
      <ProfileStack.Screen name="Achievements" component={AchievementsScreen} />
      <ProfileStack.Screen name="TouchGrass" component={TouchGrassScreen} />
      <ProfileStack.Screen name="Casino" component={CasinoScreen} />
      <ProfileStack.Screen name="Shake" component={ShakeScreen} />
      <ProfileStack.Screen name="Steps" component={StepsScreen} />
    </ProfileStack.Navigator>
  );
}

function TabEmoji({ emoji, color }: { emoji: string; color: string }) {
  return <Text style={[tabIconStyles.icon, { color }]}>{emoji}</Text>;
}

const tabIconStyles = StyleSheet.create({
  icon: { fontSize: 18 },
});

const flightsTabOptions: BottomTabNavigationOptions = {
  title: 'Авиабилеты',
  tabBarIcon: ({ color }) => <TabEmoji emoji="✈️" color={color} />,
};

const toursTabOptions: BottomTabNavigationOptions = {
  title: 'Туры',
  tabBarIcon: ({ color }) => <TabEmoji emoji="📍" color={color} />,
};

const profileTabOptions: BottomTabNavigationOptions = {
  title: 'Профиль',
  tabBarIcon: ({ color }) => <TabEmoji emoji="👤" color={color} />,
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: '#fff',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}>
      <Tab.Screen
        name="FlightsTab"
        component={FlightsNavigator}
        options={flightsTabOptions}
      />
      <Tab.Screen
        name="ToursTab"
        component={ToursNavigator}
        options={toursTabOptions}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={profileTabOptions}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { isLoggedIn } = useApp();

  return (
    <NavigationContainer theme={navTheme} key={isLoggedIn ? 'in' : 'out'}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <>
            <RootStack.Screen name="Welcome" component={WelcomeScreen} />
            <RootStack.Screen name="Login" component={LoginScreen} />
            <RootStack.Screen
              name="SignupAccountType"
              component={SignupAccountTypeScreen}
            />
            <RootStack.Screen name="RegisterForm" component={RegisterFormScreen} />
          </>
        ) : (
          <RootStack.Screen name="Main" component={MainTabs} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
