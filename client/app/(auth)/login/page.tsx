'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Lock, User, AlertTriangle, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await apiClient.post('/auth/login', {
                username,
                password,
            });
            
            toast.success(`Login berhasil! Selamat datang kembali.`);
            login(response.data.token, response.data.user);
            router.push('/dashboard');

        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Username atau password salah.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-slate-900">
            {/* Sisi Kiri: Branding & Ilustrasi */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-12 text-white relative overflow-hidden">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="text-center z-10"
                >
                  <div className="mb-4 text-4xl font-bold">SPADA</div>
                  <h1 className="text-4xl font-bold leading-tight mb-4">
                    Selamat Datang Kembali!
                  </h1>
                  <p className="text-lg text-indigo-100">
                    Akses dashboard Anda untuk mengelola semua aktivitas pembelajaran
                    dengan mudah.
                  </p>
                </motion.div>
                {/* Elemen dekoratif */}
                <div className="absolute top-0 -left-16 w-64 h-64 bg-white/10 rounded-full animate-pulse"></div>
                <div className="absolute bottom-0 -right-20 w-72 h-72 bg-white/10 rounded-full"></div>
            </div>

            {/* Sisi Kanan: Form Login */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-full max-w-md"
                >
                  <div className="p-8 sm:p-10 bg-slate-800 rounded-2xl shadow-2xl space-y-6 border border-slate-700">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-slate-100">Masuk Akun</h2>
                      <p className="text-slate-400 mt-2">
                        Silakan Masukkan Kredensial Anda
                      </p>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center p-3 space-x-2 bg-red-900/30 border border-red-700 rounded-lg"
                      >
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <p className="text-red-300 text-sm">{error}</p>
                      </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Username
                        </label>
                        <div className="flex items-center mt-1 px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                          <User className="w-5 h-5 text-slate-400 mr-3" />
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full bg-transparent outline-none text-slate-200 placeholder-slate-500"
                            placeholder="Contoh: 2231001 atau gurubudi"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Password
                        </label>
                        <div className="flex items-center mt-1 px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                          <Lock className="w-5 h-5 text-slate-400 mr-3" />
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-transparent outline-none text-slate-200 placeholder-slate-500"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 disabled:bg-blue-400/50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-100"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Memproses...
                          </>
                        ) : (
                          'Masuk'
                        )}
                      </button>
                    </form>
                  </div>
                </motion.div>
            </div>
        </div>
    );
}