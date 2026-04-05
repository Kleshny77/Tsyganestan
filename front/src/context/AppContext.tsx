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
import { login as apiLogin, register as apiRegister } from '../api/auth';
import { listTours } from '../api/tours';
import { mapApiTourToUi } from '../api/tourMapper';
import {
  BASE_SEARCH_LETTERS,
  DEFAULT_FLIGHTS,
  DEFAULT_TOURS,
  STORE_ITEMS,
} from '../data/mockCatalog';
import { decodeJwtPayload, isJwtExpired } from '../lib/jwt';
import type {
  AccountType,
  AchievementId,
  Flight,
  Tour,
  UserProfile,
} from '../types';

const STORAGE_KEY = 'tsyganestan_app_state_v1';
const JWT_KEY = 'tsyganestan_jwt';

type EarnedMeta = { id: string; title: string; description: string };

type AppContextValue = {
  isLoggedIn: boolean;
  apiToken: string | null;
  apiUserId: number | null;
  apiRole: 'user' | 'tour_agent' | 'admin' | null;
  user: UserProfile | null;
  accountType: AccountType;
  points: number;
  purchased: AchievementId[];
  earnedBadges: EarnedMeta[];
  flights: Flight[];
  tours: Tour[];
  login: (email: string, password: string) => Promise<void>;
  register: (
    profile: UserProfile,
    type: AccountType,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  refreshTours: () => Promise<void>;
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

function roleToAccountType(role: string | null): AccountType {
  if (role === 'tour_agent' || role === 'admin') return 'business';
  return 'user';
}

function displayNameFromLogin(username: string, profileName?: string) {
  if (profileName?.trim()) return profileName.trim();
  if (username.includes('@')) return username.split('@')[0] ?? username;
  return username;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [apiUserId, setApiUserId] = useState<number | null>(null);
  const [apiRole, setApiRole] = useState<
    'user' | 'tour_agent' | 'admin' | null
  >(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accountType, setAccountType] = useState<AccountType>('user');
  const [points, setPoints] = useState(150);
  const [purchased, setPurchased] = useState<AchievementId[]>([]);
  const [earnedBadges, setEarnedBadges] =
    useState<EarnedMeta[]>(defaultEarned);
  const [flights, setFlights] = useState<Flight[]>(DEFAULT_FLIGHTS);
  const [tours, setTours] = useState<Tour[]>(DEFAULT_TOURS);

  const refreshTours = useCallback(async () => {
    const token = await AsyncStorage.getItem(JWT_KEY);
    if (!token || isJwtExpired(token)) {
      setTours(DEFAULT_TOURS);
      return;
    }
    try {
      const data = await listTours();
      const mapped = data.map(t => mapApiTourToUi(t, 'я.цыган · тур'));
      setTours(mapped.length ? mapped : DEFAULT_TOURS);
    } catch {
      setTours(DEFAULT_TOURS);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const jwt = await AsyncStorage.getItem(JWT_KEY);

        let persistedUser: UserProfile | null = null;
        let persistedLoggedIn = false;

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
          persistedLoggedIn = !!s.isLoggedIn;
          if (s.user !== undefined) persistedUser = s.user;
          if (typeof s.points === 'number') setPoints(s.points);
          if (Array.isArray(s.purchased)) setPurchased(s.purchased);
          if (Array.isArray(s.earnedBadges)) setEarnedBadges(s.earnedBadges);
          if (Array.isArray(s.flights) && s.flights.length)
            setFlights(s.flights);
          if (Array.isArray(s.tours) && s.tours.length) setTours(s.tours);
        }

        if (jwt && !isJwtExpired(jwt) && !cancelled) {
          const claims = decodeJwtPayload(jwt);
          if (claims) {
            setApiToken(jwt);
            setApiUserId(claims.user_id);
            const r = claims.role as 'user' | 'tour_agent' | 'admin';
            setApiRole(r);
            setAccountType(roleToAccountType(claims.role));
            setIsLoggedIn(true);
            setUser(
              persistedUser ?? {
                name: displayNameFromLogin(claims.sub),
                email: claims.sub.includes('@')
                  ? claims.sub
                  : `${claims.sub}@tsyganestan.local`,
              },
            );
          }
        } else {
          if (jwt) await AsyncStorage.removeItem(JWT_KEY);
          if (persistedLoggedIn && persistedUser && !cancelled) {
            setIsLoggedIn(true);
            setUser(persistedUser);
            if (raw) {
              const s = JSON.parse(raw) as { accountType?: AccountType };
              if (s.accountType) setAccountType(s.accountType);
            }
          }
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
    if (!hydrated || !apiToken) return;
    refreshTours();
  }, [hydrated, apiToken, refreshTours]);

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

  const applySession = useCallback((token: string, nextUser: UserProfile) => {
    const claims = decodeJwtPayload(token);
    if (!claims || isJwtExpired(token)) {
      throw new Error('Некорректный токен');
    }
    setApiToken(token);
    setApiUserId(claims.user_id);
    setApiRole(claims.role as 'user' | 'tour_agent' | 'admin');
    setAccountType(roleToAccountType(claims.role));
    setUser(nextUser);
    setIsLoggedIn(true);
    AsyncStorage.setItem(JWT_KEY, token).catch(() => {});
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const username = email.trim().toLowerCase();
      const res = await apiLogin(username, password);
      const claims = decodeJwtPayload(res.access_token);
      const nextUser: UserProfile = {
        name: displayNameFromLogin(username, claims?.sub),
        email: email.trim(),
      };
      applySession(res.access_token, nextUser);
      await refreshTours();
    },
    [applySession, refreshTours],
  );

  const register = useCallback(
    async (profile: UserProfile, type: AccountType, password: string) => {
      const email = profile.email.trim().toLowerCase();
      const username = email;
      const role = type === 'business' ? 'tour_agent' : 'user';
      await apiRegister(username, email, password, role);
      const res = await apiLogin(username, password);
      applySession(res.access_token, {
        name: profile.name,
        email,
        companyName: profile.companyName,
      });
      setEarnedBadges(prev => {
        if (prev.some(b => b.id === 'registered')) return prev;
        return [
          ...prev,
          {
            id: 'registered',
            title: 'Добро пожаловать',
            description:
              'Вы в сервисе я.цыган — худшем маркетплейсе путешествий.',
          },
        ];
      });
      await refreshTours();
    },
    [applySession, refreshTours],
  );

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
    setApiToken(null);
    setApiUserId(null);
    setApiRole(null);
    setTours(DEFAULT_TOURS);
    AsyncStorage.removeItem(JWT_KEY).catch(() => {});
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
      apiToken,
      apiUserId,
      apiRole,
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
      refreshTours,
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
      apiToken,
      apiUserId,
      apiRole,
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
      refreshTours,
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
