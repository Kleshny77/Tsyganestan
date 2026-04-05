import React, { createContext, useContext, useState } from 'react';

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

function readStorage(key: string): string | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  } catch {}
}

function clearStorage(key: string) {
  try {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
  } catch {}
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    const stored = readStorage('token');
    if (!stored) return null;
    const claims = decodeJWT(stored);
    if (!claims || claims.exp * 1000 < Date.now()) {
      clearStorage('token');
      return null;
    }
    return stored;
  });

  const claims = token ? decodeJWT(token) : null;

  const signIn = (newToken: string) => {
    writeStorage('token', newToken);
    setToken(newToken);
  };

  const signOut = () => {
    clearStorage('token');
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
