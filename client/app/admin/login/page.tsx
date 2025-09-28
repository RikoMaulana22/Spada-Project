'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Lock, User, AlertTriangle, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.post('/auth/admin/login', {
                username,
                password,
            });
            const { token, user } = response.data;
            
            toast.success(`Selamat datang, ${user.fullName || 'Admin'}!`);
            login(token, user);

            // Arahkan ke halaman utama dashboard admin setelah login
            router.push('/admin/pengguna'); 

        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Login gagal. Periksa kembali username dan password Anda.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-slate-900">
            {/* Sisi Kiri: Branding & Ilustrasi */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-black p-12 text-white relative overflow-hidden">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="text-center z-10"
                >
                  <ShieldCheck className="w-24 h-24 mx-auto text-indigo-400 mb-6" />
                  <div className="mb-4 text-4xl font-bold text-slate-100">Area Khusus Admin</div>
                  <h1 className="text-3xl font-semibold leading-tight mb-4 text-slate-300">
                    Selamat Datang, Administrator!
                  </h1>
                  <p className="text-lg text-slate-400">
                    Gunakan panel ini untuk mengelola seluruh aspek sistem pembelajaran.
                  </p>
                </motion.div>
                {/* Elemen dekoratif */}
                <div className="absolute top-0 -left-16 w-64 h-64 bg-indigo-500/10 rounded-full animate-pulse"></div>
                <div className="absolute bottom-0 -right-20 w-72 h-72 bg-indigo-500/10 rounded-full"></div>
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
                      <h2 className="text-3xl font-bold text-slate-100">Masuk Panel Admin</h2>
                      <p className="text-slate-400 mt-2">
                        Silakan masukkan kredensial admin Anda.
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

                    <form onSubmit={handleLogin} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Username
                        </label>
                        <div className="flex items-center mt-1 px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                          <User className="w-5 h-5 text-slate-400 mr-3" />
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full bg-transparent outline-none text-slate-200 placeholder-slate-500"
                            placeholder="Username admin"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Password
                        </label>
                        <div className="flex items-center mt-1 px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
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
                        className="w-full flex items-center justify-center py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 disabled:bg-indigo-400/50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-100"
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