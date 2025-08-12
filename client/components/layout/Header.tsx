'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter,usePathname  } from 'next/navigation';
import { FaUserCircle, FaCaretDown } from 'react-icons/fa';

export default function Header() {
  // --- SEMUA HOOKS DIKUMPULKAN DI ATAS ---
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
   const pathname = usePathname(); // <-- 2. Dapatkan path URL saat ini


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isDropdownOpen]);

  // --- LOGIKA KONDISIONAL SEKARANG AMAN DI BAWAH SEMUA HOOKS ---
  if (user?.role === 'admin') {
    return null;
  }
  
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const showNavLinks = pathname !== '/dashboard/wali-kelas';


  return (
    <header className="bg-white shadow-md z-10 relative">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/lg_spada_satap.png"
              alt="Logo SMP Negeri 1 Atap 1 Way Tenong"
              width={300}
              height={40}
              priority
            />
          </Link>
          {showNavLinks && (
          <div className="hidden md:flex items-center gap-6 ml-10">
            <Link href="/" className="text-gray-600 hover:text-gray-800">Home</Link>
            {user && <Link href="/dashboard" className="text-gray-600 hover:text-gray-800">Dashboard</Link>}
          </div>
          )}
        </div>
          

        <div className="flex items-center">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
              >
                <FaUserCircle className="w-8 h-8 text-gray-600" />
                <span className="hidden md:inline font-semibold text-gray-700">{user.fullName}</span>
                <FaCaretDown className="text-gray-600" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl py-1 border">
                  <div className="px-4 py-3 border-b">
                    <p className="font-bold text-gray-800 truncate">{user.fullName}</p>
                    <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/profile" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    {user.role === 'siswa' && (
                       <Link href="/grades" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                         My Grades
                       </Link>
                    )}
                  </div>
                  <div className="border-t border-gray-200"></div>
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
            <div className="flex items-center text-sm font-semibold">
              <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Log in
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}