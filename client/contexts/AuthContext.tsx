// Path: src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import apiClient from '@/lib/axios';
import { Settings, User } from '@/types';

// Tipe untuk data yang didekode dari token JWT
interface DecodedToken {
  userId: number;
  exp: number;
}

// Tipe untuk context, dengan penambahan baru
interface AuthContextType {
  user: User | null;
  token: string | null;
  settings: Settings | null;
  isAuthenticated: boolean; // <-- PENAMBAHAN 1: Flag untuk status login
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  revalidateUser: () => Promise<void>; // <-- PENAMBAHAN 2: Fungsi untuk refresh data user
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- PENAMBAHAN 3: Interceptor API Otomatis ---
  // Efek ini akan berjalan setiap kali token berubah untuk mengatur header default pada apiClient
  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // --- PENAMBAHAN 4: Fungsi untuk memvalidasi ulang data pengguna dari server ---
  const revalidateUser = useCallback(async () => {
    try {
      const response = await apiClient.get('/auth/me'); // Endpoint untuk mengambil data user
      const freshUserData = response.data;
      setUser(freshUserData);
      localStorage.setItem('user', JSON.stringify(freshUserData));
    } catch (error) {
      console.error("Gagal memvalidasi ulang sesi, logout...", error);
      logout(); // Jika gagal (misal token dicabut), logout paksa
    }
  }, []);

  // Inisialisasi aplikasi saat pertama kali dimuat
  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      
      // Ambil pengaturan sistem
      try {
        const settingsResponse = await apiClient.get('/settings');
        setSettings(settingsResponse.data);
      } catch (error) {
        console.error("Gagal mengambil pengaturan sistem:", error);
      }

      // Cek token di localStorage
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const decodedToken: DecodedToken = jwtDecode(storedToken);
          if (decodedToken.exp * 1000 > Date.now()) {
            setToken(storedToken);
            // Alih-alih langsung percaya localStorage, validasi ulang data user
            await revalidateUser();
          } else {
            logout(); // Token kedaluwarsa
          }
        } catch (error) {
          console.error("Token tidak valid:", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeApp();
  }, [revalidateUser]); // Tambahkan revalidateUser sebagai dependensi

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      settings,
      isLoading,
      isAuthenticated: !!user, // <-- Flag disediakan di sini
      login,
      logout,
      revalidateUser // <-- Fungsi disediakan di sini
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