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
    if (isLoading) {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }


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

  if (user?.role === 'wali_kelas') {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <p>Mengalihkan ke dashboard wali kelas...</p>
        </div>
    );
  }

  if (user?.role === 'guru') {
    return <TeacherDashboard user={user} />;
  }
  
  if (user?.role === 'siswa') {
    return <StudentDashboard user={user} />;
  }

  return null;
}