'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
    const { user, logout, settings } = useAuth(); // Ambil settings dari context

    return (
        <header className="bg-white shadow-md">
            <nav className="container mx-auto px-4 py-2 flex justify-between items-center">
                <Link href="/" className="flex items-center">
                    
                    {/* --- PERBAIKAN LOGIKA DINAMIS DI SINI --- */}
                    {/* Prioritas 1: Tampilkan logo header jika ada */}
                    {settings?.headerLogo ? (
                        <Image 
                            src={settings.headerLogo} 
                            alt="Logo Aplikasi" 
                            width={200} 
                            height={40} 
                            priority 
                        />
                    /* Prioritas 2: Jika tidak ada logo, tampilkan nama sekolah */
                    ) : settings?.schoolName ? (
                        <h1 className="text-xl font-bold text-gray-800">{settings.schoolName}</h1>
                    /* Prioritas 3: Jika keduanya tidak ada, tampilkan logo default */
                    ) : (
                        <Image
                            src="/images/lg_spada_satap.png"
                            alt="Logo Default"
                            width={300}
                            height={100}
                            priority
                        />
                    )}
                </Link>

                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
                                Dasbor
                            </Link>
                            <span className="text-gray-700 font-medium">{user.fullName}</span>
                            <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Login
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
}