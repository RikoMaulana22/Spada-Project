'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext'; // Impor hook autentikasi kita
import { useRouter } from 'next/navigation';
import { FaUserCircle, FaCaretDown } from 'react-icons/fa'; // Impor ikon
import Image from 'next/image';


export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  // State untuk mengontrol visibilitas menu dropdown profil
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login'); // Arahkan ke halaman login setelah logout
  };

  return (
    <header className="bg-white shadow-md z-10 relative">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* Bagian Kiri: Logo dan Navigasi Utama */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
          <Image
           src="/lg_spada_satap.png" // Ganti sesuai path logo kamu
           alt="Logo SMP Negeri 1 Atap 1 Way Tenong"
           width={300} // Ukuran bisa disesuaikan
           height={40}
          />
         </Link>
          <div className="ml-10 flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-gray-800">Home</Link>
            
            {/* Tampilkan link ini hanya jika pengguna sudah login */}
            {user && (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-800">Dashboard</Link>
                <Link href="/my-courses" className="text-gray-600 hover:text-gray-800">My courses</Link>
              </>
            )}
          </div>
        </div>

        {/* Bagian Kanan: Status Login atau Menu Profil */}
        <div className="flex items-center">
          {user ? (
            // Jika pengguna sudah login, tampilkan menu dropdown
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <FaUserCircle className="w-8 h-8 text-gray-600" />
                <FaCaretDown className="text-gray-600" />
              </button>

              {/* Konten Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl py-1">
                  <div className="px-4 py-2 text-sm text-gray-700">
                    <p className="font-semibold">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                  <div className="border-t border-gray-200"></div>
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Profile
                  </Link>
                  <Link href="/grades" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Grades
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Jika pengguna adalah tamu (belum login)
            <div className="flex items-center text-sm">
              <span className="text-gray-600 mr-2">You are currently using guest access</span>
              <Link href="/login" className="text-blue-600 hover:underline font-semibold">
                (Log in)
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}