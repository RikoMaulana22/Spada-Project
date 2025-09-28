'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/axios';
import { User, ClassSummary, GroupedSubjects, Announcement, GlobalMaterial, ScheduleItem } from '@/types';
import MyClassesSection from './MyClassesSection';
import ClassBrowserSection from './ClassBrowserSection';
import AnnouncementSection from './AnnouncementSection';
import GlobalMaterialsSection from './GlobalMaterialsSection';
import TodayScheduleSection from './TodayScheduleSection';

export default function StudentDashboard({ user }: { user: User }) {
  // State dan logika pengambilan data tidak berubah
  const [myClasses, setMyClasses] = useState<ClassSummary[]>([]);
  const [groupedSubjects, setGroupedSubjects] = useState<GroupedSubjects>({});
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [globalMaterials, setGlobalMaterials] = useState<GlobalMaterial[]>([]);
  const [mySchedules, setMySchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ myClassesResponse, groupedSubjectsResponse, announcementsResponse, globalMaterialsResponse, schedulesResponse ] = await Promise.all([
        apiClient.get('/classes/student'),
        apiClient.get('/subjects/grouped'),
        apiClient.get('/announcements'),
        apiClient.get('/materials/global'),
        apiClient.get('/schedules/my'),
      ]);
      setMyClasses(myClassesResponse.data);
      setGroupedSubjects(groupedSubjectsResponse.data);
      setAnnouncements(announcementsResponse.data);
      setGlobalMaterials(globalMaterialsResponse.data);
      setMySchedules(schedulesResponse.data);
    } catch (error) {
      console.error("Gagal mengambil data dashboard siswa:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    // Latar belakang diubah menjadi abu-abu netral yang sangat muda
    <div className="w-full min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      
      {/* Header Dashboard */}
      <div className="mb-8">
        {/* Warna judul utama diubah menjadi biru tua */}
        <h1 className="text-3xl font-bold text-blue-900">Dashboard Siswa</h1>
        <p className="text-gray-600 mt-1">Selamat datang kembali, {user.fullName}! 👋</p>
      </div>

      {/* Grid Layout Utama (Struktur tidak berubah) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <MyClassesSection isLoading={isLoading} myClasses={myClasses} />
          <ClassBrowserSection 
            isLoading={isLoading} 
            groupedSubjects={groupedSubjects} 
            myClasses={myClasses}
            onEnrolSuccess={fetchData} 
          />
        </div>
        <div className="lg:col-span-1 space-y-8">
          <AnnouncementSection isLoading={isLoading} announcements={announcements} />
          <TodayScheduleSection isLoading={isLoading} schedules={mySchedules} />
          <GlobalMaterialsSection isLoading={isLoading} materials={globalMaterials} />
        </div>
      </div>
    </div>
  );
}