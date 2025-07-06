'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // State untuk memastikan komponen hanya dirender penuh di client
    const [isClient, setIsClient] = useState(false);

    // useEffect ini hanya berjalan di client, setelah render pertama
    useEffect(() => {
        setIsClient(true);
    }, []);

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
            login(token, user);
            //router.push('/admin/pengguna'); 
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login gagal. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    // Selama render server atau render pertama di client, tampilkan null (atau loading spinner)
    // untuk menjamin konsistensi HTML.
    if (!isClient) {
        return null;
    }

    // Setelah hydration berhasil, render komponen yang sesungguhnya.
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
                    <p className="mt-2 text-gray-500">Silakan masuk untuk mengakses dashboard admin.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                            {error}
                        </div>
                    )}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => {
                            setError(null); // Hapus error saat pengguna mulai mengetik
                            setUsername(e.target.value);
                            }}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => {
                             setError(null); // Hapus error saat pengguna mulai mengetik
                             setPassword(e.target.value);
                             }}  
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                        >
                            {isLoading ? 'Memproses...' : 'Login'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}