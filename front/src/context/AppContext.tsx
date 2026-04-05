import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ActivityIndicator, View } from 'react-native';
import {
  BASE_SEARCH_LETTERS,
  DEFAULT_FLIGHTS,
  DEFAULT_TOURS,
  STORE_ITEMS,
} from '../data/mockCatalog';
import type {
  AccountType,
  AchievementId,
  Flight,
  Tour,
  UserProfile,
} from '../types';

const STORAGE_KEY = 'tsyganestan_app_state_v1';

type EarnedMeta = { id: string; title: string; description: string };

type AppContextValue = {
  isLoggedIn: boolean;
  user: UserProfile | null;
  accountType: AccountType;
  points: number;
  purchased: AchievementId[];
  earnedBadges: EarnedMeta[];
  flights: Flight[];
  tours: Tour[];
  login: (
    email: string,
    password: string,
    profile: UserProfile,
    type: AccountType,
  ) => void;
  register: (profile: UserProfile, type: AccountType) => void;
  logout: () => void;
  addPoints: (delta: number) => void;
  buyAchievement: (id: AchievementId) => { ok: boolean; message?: string };
  hasPurchased: (id: AchievementId) => boolean;
  getAllowedSearchLetters: () => string[];
  isCategoryUnlocked: (category: { lockedByDefault: boolean }) => boolean;
  isTourUnlocked: (tour: Tour) => boolean;
  addFlight: (flight: Omit<Flight, 'id'>) => void;
  addTour: (tour: Omit<Tour, 'id'>) => void;
  awardBadge: (badge: EarnedMeta) => void;
  setAvatar: (uri: string | undefined) => void;
};

const defaultEarned: EarnedMeta[] = [];

const AppContext = createContext<AppContextValue | null>(null);

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accountType, setAccountType] = useState<AccountType>('user');
  const [points, setPoints] = useState(150);
  const [purchased, setPurchased] = useState<AchievementId[]>([]);
  const [earnedBadges, setEarnedBadges] =
    useState<EarnedMeta[]>(defaultEarned);
  const [flights, setFlights] = useState<Flight[]>(DEFAULT_FLIGHTS);
  const [tours, setTours] = useState<Tour[]>(DEFAULT_TOURS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          const s = JSON.parse(raw) as Partial<{
            isLoggedIn: boolean;
            user: UserProfile | null;
            accountType: AccountType;
            points: number;
            purchased: AchievementId[];
            earnedBadges: EarnedMeta[];
            flights: Flight[];
            tours: Tour[];
          }>;
          if (typeof s.isLoggedIn === 'boolean') setIsLoggedIn(s.isLoggedIn);
          if (s.user !== undefined) setUser(s.user);
          if (s.accountType) setAccountType(s.accountType);
          if (typeof s.points === 'number') setPoints(s.points);
          if (Array.isArray(s.purchased)) setPurchased(s.purchased);
          if (Array.isArray(s.earnedBadges)) setEarnedBadges(s.earnedBadges);
          if (Array.isArray(s.flights) && s.flights.length)
            setFlights(s.flights);
          if (Array.isArray(s.tours) && s.tours.length) setTours(s.tours);
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload = JSON.stringify({
      isLoggedIn,
      user,
      accountType,
      points,
      purchased,
      earnedBadges,
      flights,
      tours,
    });
    AsyncStorage.setItem(STORAGE_KEY, payload).catch(() => {});
  }, [
    hydrated,
    isLoggedIn,
    user,
    accountType,
    points,
    purchased,
    earnedBadges,
    flights,
    tours,
  ]);

  const login = useCallback(
    (
      email: string,
      _password: string,
      profile: UserProfile,
      type: AccountType,
    ) => {
      setUser({ ...profile, email });
      setAccountType(type);
      setIsLoggedIn(true);
    },
    [],
  );

  const register = useCallback((profile: UserProfile, type: AccountType) => {
    setUser(profile);
    setAccountType(type);
    setIsLoggedIn(true);
    setEarnedBadges(prev => {
      if (prev.some(b => b.id === 'registered')) return prev;
      return [
        ...prev,
        {
          id: 'registered',
          title: 'Добро пожаловать',
          description: 'Вы зарегистрировались в худшем маркетплейсе путешествий.',
        },
      ];
    });
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
  }, []);

  const addPoints = useCallback((delta: number) => {
    setPoints(p => Math.max(0, p + delta));
  }, []);

  const hasPurchased = useCallback(
    (id: AchievementId) => purchased.includes(id),
    [purchased],
  );

  const buyAchievement = useCallback(
    (id: AchievementId): { ok: boolean; message?: string } => {
      if (purchased.includes(id)) {
        return { ok: false, message: 'Уже куплено' };
      }
      const item = STORE_ITEMS.find(x => x.id === id);
      if (!item) return { ok: false, message: 'Не найдено' };
      if (points < item.price) {
        return { ok: false, message: 'Недостаточно баллов' };
      }
      setPoints(p => p - item.price);
      setPurchased(p => [...p, id]);
      return { ok: true };
    },
    [purchased, points],
  );

  const getAllowedSearchLetters = useCallback(() => {
    if (accountType === 'business') {
      const ru = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
      return ru.split('');
    }
    const set = new Set<string>([...BASE_SEARCH_LETTERS]);
    if (purchased.includes('letter_m')) set.add('м');
    if (purchased.includes('letter_s')) set.add('с');
    return Array.from(set);
  }, [accountType, purchased]);

  const isCategoryUnlocked = useCallback(
    (category: { lockedByDefault: boolean }) => {
      if (!category.lockedByDefault) return true;
      return purchased.includes('economy_class');
    },
    [purchased],
  );

  const isTourUnlocked = useCallback(
    (tour: Tour) => {
      if (!tour.unlockId) return true;
      return purchased.includes(tour.unlockId);
    },
    [purchased],
  );

  const addFlight = useCallback((flight: Omit<Flight, 'id'>) => {
    setFlights(prev => [...prev, { ...flight, id: newId('flight') }]);
  }, []);

  const addTour = useCallback((tour: Omit<Tour, 'id'>) => {
    setTours(prev => [...prev, { ...tour, id: newId('tour') }]);
  }, []);

  const awardBadge = useCallback((badge: EarnedMeta) => {
    setEarnedBadges(prev => {
      if (prev.some(b => b.id === badge.id)) return prev;
      return [...prev, badge];
    });
  }, []);

  const setAvatar = useCallback((uri: string | undefined) => {
    setUser(u => (u ? { ...u, avatarUri: uri } : u));
  }, []);

  const value = useMemo(
    () => ({
      isLoggedIn,
      user,
      accountType,
      points,
      purchased,
      earnedBadges,
      flights,
      tours,
      login,
      register,
      logout,
      addPoints,
      buyAchievement,
      hasPurchased,
      getAllowedSearchLetters,
      isCategoryUnlocked,
      isTourUnlocked,
      addFlight,
      addTour,
      awardBadge,
      setAvatar,
    }),
    [
      isLoggedIn,
      user,
      accountType,
      points,
      purchased,
      earnedBadges,
      flights,
      tours,
      login,
      register,
      logout,
      addPoints,
      buyAchievement,
      hasPurchased,
      getAllowedSearchLetters,
      isCategoryUnlocked,
      isTourUnlocked,
      addFlight,
      addTour,
      awardBadge,
      setAvatar,
    ],
  );

  if (!hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp outside AppProvider');
  return ctx;
}
