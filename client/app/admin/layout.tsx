'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation'; // <-- 1. Impor usePathname
import Link from 'next/link';
import { FaUsers, FaBook, FaChartBar, FaFileAlt, FaRss, FaSignOutAlt, FaCog, FaCalendarCheck,FaChalkboardTeacher  } from 'react-icons/fa'; // Tambahkan FaCog untuk Pengaturan
import { User as GlobalUserType, Settings } from '@/types'; // Asumsikan Settings ada di types

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, settings, logout } = useAuth() as { user: GlobalUserType | null, isLoading: boolean, settings: Settings | null, logout: () => void };
  const router = useRouter();
  const pathname = usePathname(); 

  useEffect(() => {
    if (isLoading) {
      return;
    }

    // --- LOGIKA PROTEKSI 
    if (pathname !== '/admin/login' && (!user || user.role !== 'admin')) {
      router.push('/admin/login');
    }

    // Jika pengguna ADALAH admin dan mencoba mengakses halaman login,
    // arahkan mereka ke dashboard utama admin.
    if (user && user.role === 'admin' && pathname === '/admin/login') {
      router.push('/admin/pengguna');
    }

  }, [user, isLoading, router, pathname]);

  // --- 4. LOGIKA TAMPILAN 

  // Jika kita berada di halaman login, langsung tampilkan isinya (form login).
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Untuk halaman admin lainnya, tampilkan loading jika data belum siap.
  if (isLoading || !user) {
    return <div className="flex justify-center items-center h-screen bg-gray-100">Memverifikasi akses admin...</div>;
  }
  
  // Jika sudah pasti admin, tampilkan layout lengkap.
  return (
    <div className="flex min-h-screen bg-white">
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-8">{settings?.schoolName || 'Admin Panel'}</h1>
        
        <nav className="flex flex-col space-y-1">
          <Link href="/admin/pengguna" className={`flex items-center gap-3 p-2 rounded-md text-sm ${pathname.startsWith('/admin/pengguna') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
            <FaUsers /><span>Pengguna</span>
          </Link>
          <Link href="/admin/kelas" className={`flex items-center gap-3 p-2 rounded-md text-sm ${pathname.startsWith('/admin/kelas') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
          <FaChalkboardTeacher /><span>Kelola Kelas</span>
          </Link>
          <Link href="/admin/mapel" className={`flex items-center gap-3 p-2 rounded-md text-sm ${pathname.startsWith('/admin/mapel') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
            <FaBook /><span>Mata Pelajaran</span>
          </Link>
          <Link href="/admin/materi" className={`flex items-center gap-3 p-2 rounded-md text-sm ${pathname.startsWith('/admin/materi') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
            <FaFileAlt /><span>Materi Global</span>
          </Link>
          <Link href="/admin/pengumuman" className={`flex items-center gap-3 p-2 rounded-md text-sm ${pathname.startsWith('/admin/pengumuman') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
            <FaRss /><span>Pengumuman</span>
          </Link>
          <Link href="/admin/jadwal" className={`flex items-center gap-3 p-2 rounded-md text-sm ${pathname.startsWith('/admin/jadwal') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
            <FaCalendarCheck /><span>Jadwal</span>
          </Link>
          {/* Laporan Dropdown Example */}
          <p className="px-2 pt-4 pb-1 text-xs uppercase text-gray-400">Laporan</p>
          <Link href="/admin/laporan/kehadiran" className={`flex items-center gap-3 p-2 rounded-md text-sm ${pathname.startsWith('/admin/laporan/kehadiran') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
            <FaChartBar /><span>Laporan Absensi</span>
          </Link>
          <Link href="/admin/laporan/nilai" className={`flex items-center gap-3 p-2 rounded-md text-sm ${pathname.startsWith('/admin/laporan/nilai') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
            <FaChartBar /><span>Laporan Nilai</span>
          </Link>
        </nav>
        
        <div className="mt-auto space-y-2">
           <Link href="/admin/pengaturan" className={`flex items-center gap-3 p-2 rounded-md text-sm ${pathname.startsWith('/admin/pengaturan') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
            <FaCog /><span>Pengaturan</span>
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 p-2 rounded-md text-red-400 hover:bg-red-500 hover:text-white text-sm">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 bg-gray-200 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}