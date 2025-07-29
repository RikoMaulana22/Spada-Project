'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';

export default function HomeroomTeacherLoginForm() {
    const router = useRouter();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const toastId = toast.loading('Mencoba masuk...');

        try {
            const response = await apiClient.post('/auth/login/homeroom', {
                username,
                password
            });
            
            const { token, user } = response.data;
            login(token, user);

            toast.success('Login berhasil!', { id: toastId });
            router.push('/dashboard/wali-kelas');

        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Login gagal.', { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Wrapper utama dengan latar belakang abu-abu
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">
                {/* --- Kolom Kiri (Visual) --- */}
                <div className="relative hidden md:block">
                    <Image
                        src="/path/to/your/school-image.jpg" // Ganti dengan path gambar sekolah Anda
                        alt="School Image"
                        width={400}
                        height={600}
                        className="w-[400px] h-full hidden rounded-l-2xl md:block object-cover"
                    />
                    {/* Overlay untuk menggelapkan gambar */}
                    <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-40 rounded-l-2xl"></div>
                    {/* Teks di atas overlay */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center">
                         <Image 
                            src="/lg_spada_satap.png" // Ganti dengan path logo Anda
                            width={200} 
                            height={50} 
                            alt="Logo" 
                            className="mx-auto mb-4"
                         />
                        <p className="text-xl font-semibold">Portal Wali Kelas</p>
                        <p className="text-sm mt-2">Sistem Pembelajaran Daring</p>
                    </div>
                </div>

                {/* --- Kolom Kanan (Form Login) --- */}
                <div className="flex flex-col justify-center text-blue-700 p-8 md:p-14">
                    <span className="mb-3 text-4xl font-bold">Selamat Datang</span>
                    <span className="font-light text-gray-500 mb-8">
                        Silakan masuk menggunakan akun wali kelas Anda.
                    </span>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                            />
                        </div>

                        <div className="flex justify-between w-full py-2">
                             <Link href="/forgot-password" // Arahkan ke halaman lupa password
                                className="text-xs font-display font-semibold text-gray-500 hover:text-gray-600 cursor-pointer">
                                Lupa password?
                             </Link>
                        </div>
                        
                        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-semibold p-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors">
                            {isLoading ? 'Loading...' : 'Masuk'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}