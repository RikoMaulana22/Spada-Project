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
    if (!isLoading && !user) {
      router.push('/dashboard');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Tampilkan komponen dashboard yang sesuai berdasarkan role
  if (user?.role === 'guru') {
    return <TeacherDashboard user={user} />;
  }
  
  if (user?.role === 'siswa') {
    return <StudentDashboard user={user} />;
  }

  return null; // Atau halaman default jika role tidak dikenali
}