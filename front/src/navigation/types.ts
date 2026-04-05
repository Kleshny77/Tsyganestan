import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignupAccountType: undefined;
  RegisterForm: { accountType: 'user' | 'business' };
  Main: undefined;
};

export type MainTabParamList = {
  FlightsTab: undefined;
  ToursTab: undefined;
  ProfileTab: undefined;
};

export type GyroBookingParams = {
  kind: 'flight' | 'tour';
  flightId?: string;
  tourId?: string;
  categoryId?: string;
  mystery?: boolean;
};

export type FlightsStackParamList = {
  FlightsHome: undefined;
  GyroBooking: GyroBookingParams;
  Gift: { kind: 'flight' | 'tour' };
  AddFlight: undefined;
};

export type ToursStackParamList = {
  ToursHome: undefined;
  GyroBooking: GyroBookingParams;
  Gift: { kind: 'flight' | 'tour' };
  AddTour: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Achievements: undefined;
  TouchGrass: undefined;
  Casino: undefined;
  Shake: undefined;
  Steps: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

export type FlightsStackScreenProps<T extends keyof FlightsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<FlightsStackParamList, T>,
    MainTabScreenProps<'FlightsTab'>
  >;

export type ToursStackScreenProps<T extends keyof ToursStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ToursStackParamList, T>,
    MainTabScreenProps<'ToursTab'>
  >;

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ProfileStackParamList, T>,
    MainTabScreenProps<'ProfileTab'>
  >;
