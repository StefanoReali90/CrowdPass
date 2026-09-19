import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../api';
import { ApiError, configureApi, getDefaultApiBaseUrl, normalizeApiBaseUrl, setApiToken } from '../api/client';
import type { User } from '../types';

const TOKEN_KEY = 'passhalo.jwt';
const API_URL_KEY = 'passhalo.api-url';

interface AuthValue {
  user: User | null;
  apiBaseUrl: string;
  loading: boolean;
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  saveApiBaseUrl(value: string): Promise<string>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [apiBaseUrl, setApiBaseUrlState] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([
      SecureStore.getItemAsync(TOKEN_KEY),
      SecureStore.getItemAsync(API_URL_KEY),
    ]).then(async ([storedToken, storedUrl]) => {
      const url = storedUrl || getDefaultApiBaseUrl();
      configureApi(url, storedToken);
      if (!active) return;
      setApiBaseUrlState(url);

      if (!storedToken || !url) return;
      try {
        const currentUser = await api.currentUser();
        if (active) setUser(currentUser);
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          setApiToken(null);
        }
      }
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setApiToken(null);
    const response = await api.login(email.trim(), password);
    setApiToken(response.token);
    await SecureStore.setItemAsync(TOKEN_KEY, response.token);
    try {
      const currentUser = await api.currentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      setApiToken(null);
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setApiToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }, []);

  const saveApiBaseUrl = useCallback(async (value: string) => {
    const normalized = normalizeApiBaseUrl(value);
    await SecureStore.setItemAsync(API_URL_KEY, normalized);
    setApiBaseUrlState(normalized);
    configureApi(normalized, null);
    setUser(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    return normalized;
  }, []);

  const value = useMemo<AuthValue>(() => ({
    user,
    apiBaseUrl,
    loading,
    login,
    logout,
    saveApiBaseUrl,
  }), [apiBaseUrl, loading, login, logout, saveApiBaseUrl, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth deve essere usato dentro AuthProvider.');
  return value;
}
