import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const TOKEN_KEY = 'tsyganestan_legacy_auth_token';

interface TokenClaims {
  sub: string;
  role: 'user' | 'tour_agent' | 'admin';
  user_id: number;
  exp: number;
}

function decodeJWT(token: string): TokenClaims | null {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as TokenClaims;
  } catch {
    return null;
  }
}

interface AuthContextType {
  token: string | null;
  username: string | null;
  role: 'user' | 'tour_agent' | 'admin' | null;
  userId: number | null;
  signIn: (token: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  username: null,
  role: null,
  userId: null,
  signIn: () => {},
  signOut: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(TOKEN_KEY);
      if (!stored) return;
      const claims = decodeJWT(stored);
      if (!claims || claims.exp * 1000 < Date.now()) {
        await AsyncStorage.removeItem(TOKEN_KEY);
        return;
      }
      setToken(stored);
    })();
  }, []);

  const claims = token ? decodeJWT(token) : null;

  const signIn = (newToken: string) => {
    AsyncStorage.setItem(TOKEN_KEY, newToken).catch(() => {});
    setToken(newToken);
  };

  const signOut = () => {
    AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        username: claims?.sub ?? null,
        role: claims?.role ?? null,
        userId: claims?.user_id ?? null,
        signIn,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
