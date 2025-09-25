'use client';

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import TeacherDashboard from "@/components/dashboard/TeacherDashboard";
import StudentDashboard from "@/components/dashboard/StudentDashboard";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Jangan lakukan apa-apa selama data masih loading
    if (isLoading) {
      return;
    }

    // Jika loading selesai dan tidak ada user, arahkan ke login
    if (!user) {
      router.push('/login');
      return;
    }

    // <-- PERUBAHAN UTAMA DI SINI -->
    // Jika user adalah wali_kelas, arahkan ke dashboard khusus mereka
    if (user.role === 'wali_kelas') {
      router.push('/dashboard/wali-kelas');
    }
  }, [isLoading, user, router]);

  // Selama loading, tampilkan pesan
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Jika user adalah wali kelas, tampilkan pesan pengalihan
  // Ini untuk mencegah halaman kosong muncul sekejap sebelum redirect
  if (user?.role === 'wali_kelas') {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <p>Mengalihkan ke dashboard wali kelas...</p>
        </div>
    );
  }

  // Logika yang sudah ada untuk guru dan siswa tetap dipertahankan
  if (user?.role === 'guru') {
    return <TeacherDashboard user={user} />;
  }
  
  if (user?.role === 'siswa') {
    return <StudentDashboard user={user} />;
  }

  // Fallback jika terjadi kondisi aneh
  return null;
}