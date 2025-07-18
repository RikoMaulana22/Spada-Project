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
  // State untuk semua data yang akan ditampilkan
  const [myClasses, setMyClasses] = useState<ClassSummary[]>([]);
  const [groupedSubjects, setGroupedSubjects] = useState<GroupedSubjects>({});
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [globalMaterials, setGlobalMaterials] = useState<GlobalMaterial[]>([]);
  const [mySchedules, setMySchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi untuk mengambil semua data secara bersamaan
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const myClassesPromise = apiClient.get('/classes/student');
      const groupedSubjectsPromise = apiClient.get('/subjects/grouped');
      const announcementsPromise = apiClient.get('/announcements');
      const globalMaterialsPromise = apiClient.get('/materials/global');
      const schedulePromise = apiClient.get('/schedules/my');
      
      const [
        myClassesResponse, 
        groupedSubjectsResponse, 
        announcementsResponse, 
        globalMaterialsResponse,
        schedulesResponse
      ] = await Promise.all([
        myClassesPromise,
        groupedSubjectsPromise,
        announcementsPromise,
        globalMaterialsPromise,
        schedulePromise,
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
    <div className="container mx-auto p-4 md:p-8 space-y-8 text-gray-800">
      <h1 className="text-3xl  font-bold">Dashboard Siswa</h1>
      <p className="text-gray-600">Selamat datang, {user.fullName}!</p>
      
      {/* Tampilkan semua section baru */}
      <AnnouncementSection isLoading={isLoading} announcements={announcements} />
      <TodayScheduleSection isLoading={isLoading} schedules={mySchedules} />
      <GlobalMaterialsSection isLoading={isLoading} materials={globalMaterials} />
      
      {/* Section yang sudah ada sebelumnya */}
      <MyClassesSection isLoading={isLoading} myClasses={myClasses} />
      <ClassBrowserSection 
        isLoading={isLoading} 
        groupedSubjects={groupedSubjects} 
        myClasses={myClasses}
        onEnrolSuccess={fetchData} 
      />
    </div>
  );
}