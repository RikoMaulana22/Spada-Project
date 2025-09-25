'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { FaUserCircle, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function Header() {
    const { user, logout, settings } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [profileRef]);

    // --- FUNGSI BARU UNTUK LOGOUT BERDASARKAN PERAN ---
    const handleLogout = () => {
        if (!user) return; // Pengaman jika user tidak ada

        // Tentukan halaman redirect default
        let redirectPath = '/login';

        // Jika peran adalah wali_kelas, ubah halaman redirect
        if (user.role === 'wali_kelas') {
            redirectPath = '/login/wali-kelas';
        }else if (user.role === 'admin') {
            redirectPath = '/admin/login'; // Arahkan admin ke sini
        }
        
        // Panggil fungsi logout dari context
        logout();
        
        // Arahkan ke halaman yang sesuai
        router.push(redirectPath);
        
        // Tutup dropdown
        setIsProfileOpen(false);
    };
    // --------------------------------------------------

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 py-2 flex justify-between items-center">
                {/* Bagian Kiri: Logo */}
                <div className="flex-1 flex justify-start">
                    <Link href="/" className="flex items-center">
                        {settings?.headerLogo ? (
                            <Image 
                                src={settings.headerLogo} 
                                alt="Logo Aplikasi" 
                                width={180} 
                                height={36} 
                                priority 
                            />
                        ) : settings?.schoolName ? (
                            <h1 className="text-xl font-bold text-gray-800">{settings.schoolName}</h1>
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
                </div>

                {/* Bagian Tengah: Link Dasbor */}
                <div className="flex-1 flex justify-start">
                    {user && (
                         <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                            Dasbor
                        </Link>
                    )}
                </div>

                {/* Bagian Kanan: Tombol Login atau Menu Profil */}
                <div className="flex-1 flex justify-end">
                    {user ? (
                        <div className="relative" ref={profileRef}>
                            <button 
                                onClick={() => setIsProfileOpen(!isProfileOpen)} 
                                className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100"
                            >
                                <FaUserCircle className="w-6 h-6 text-gray-600" />
                                <span className="text-gray-700 font-medium hidden md:block">{user.fullName}</span>
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                                    <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <FaTachometerAlt />
                                        <span>Profil Saya</span>
                                    </Link>
                                    <button 
                                        // --- Gunakan fungsi handleLogout di sini ---
                                        onClick={handleLogout} 
                                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        <FaSignOutAlt />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="btn-primary">
                            Login
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
}