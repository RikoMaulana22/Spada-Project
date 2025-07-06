'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode'; // Pastikan sudah diinstal: npm install jwt-decode
import apiClient from '@/lib/axios'; // <-- 1. IMPORT apiClient
import { Settings, User } from '@/types'; // <-- Pastikan tipe User dan Settings sudah benar

// Interface User diperbarui agar sesuai dengan data dari API
// (Anda bisa pindahkan ini ke types/index.ts)
// interface User {
//   id: number;
//   username: string;
//   fullName: string;
//   role: 'guru' | 'siswa' | 'admin';
// }

interface AuthContextType {
  user: User | null;
  token: string | null;
  settings: Settings | null; // <-- Properti untuk pengaturan
  isLoading: boolean;
  login: (token: string, userData: User) => void; // <-- Tanda tangan fungsi login diperbaiki
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null); // State untuk pengaturan
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect untuk inisialisasi saat aplikasi dimuat
  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      
      // 2. AMBIL PENGATURAN SISTEM SECARA GLOBAL
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
          const decodedToken: { exp: number } = jwtDecode(storedToken);
          if (decodedToken.exp * 1000 > Date.now()) {
            setToken(storedToken);
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              setUser(JSON.parse(storedUser));
            }
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
  }, []);

  // 3. FUNGSI LOGIN DIPERBAIKI
  // Sekarang menerima token dan objek user lengkap dari respons API
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
    // 4. TAMBAHKAN 'settings' KE DALAM VALUE PROVIDER
    <AuthContext.Provider value={{ user, token, settings, isLoading, login, logout }}>
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