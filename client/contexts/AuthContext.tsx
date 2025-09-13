'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import apiClient from '@/lib/axios';
import { Settings, User } from '@/types';

interface DecodedToken {
  userId: number;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  settings: Settings | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  revalidateUser: () => Promise<void>;
  refetchSettings: () => Promise<void>; // <-- PENAMBAHAN FUNGSI BARU
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }, [token]);
  
  // Fungsi untuk mengambil data settings
  const refetchSettings = useCallback(async () => {
    try {
      const settingsResponse = await apiClient.get('/settings');
      setSettings(settingsResponse.data);
    } catch (error) {
      console.error("Gagal mengambil pengaturan sistem:", error);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const revalidateUser = useCallback(async () => {
    try {
      const response = await apiClient.get('/auth/me');
      const freshUserData = response.data;
      setUser(freshUserData);
      localStorage.setItem('user', JSON.stringify(freshUserData));
    } catch (error) {
      console.error("Gagal memvalidasi ulang sesi, logout...", error);
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      await refetchSettings(); // Panggil fungsi fetch settings
      
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const decodedToken: DecodedToken = jwtDecode(storedToken);
          if (decodedToken.exp * 1000 > Date.now()) {
            setToken(storedToken);
            await revalidateUser();
          } else {
            logout();
          }
        } catch (error) {
          console.error("Token tidak valid:", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeApp();
  }, [revalidateUser, refetchSettings, logout]);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      settings,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      revalidateUser,
      refetchSettings
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};