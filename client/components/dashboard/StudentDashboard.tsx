'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/axios';
import { User, ClassSummary, GroupedSubjects, Announcement  } from '@/types';
import MyClassesSection from './MyClassesSection'; // Impor komponen baru
import ClassBrowserSection from './ClassBrowserSection'; // Impor komponen baru
import AnnouncementSection from './AnnouncementSection'; // <-- 1. IMPORT KOMPONEN BARU


export default function StudentDashboard({ user }: { user: User }) {
  const [myClasses, setMyClasses] = useState<ClassSummary[]>([]);
  const [groupedSubjects, setGroupedSubjects] = useState<GroupedSubjects>({});
    const [announcements, setAnnouncements] = useState<Announcement[]>([]); // <-- 2. TAMBAHKAN STATE BARU
  const [isLoading, setIsLoading] = useState(true);

  // Logika pengambilan data tetap di sini
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const myClassesPromise = apiClient.get('/classes/student');
      const groupedSubjectsPromise = apiClient.get('/subjects/grouped');
      const announcementsPromise = apiClient.get('/announcements'); // Panggil API pengumuman

      
      const [myClassesResponse, groupedSubjectsResponse, announcementsResponse] = await Promise.all([
        myClassesPromise,
        groupedSubjectsPromise,
        announcementsPromise,
      ]);

      setMyClasses(myClassesResponse.data);
      setGroupedSubjects(groupedSubjectsResponse.data);
      setAnnouncements(announcementsResponse.data); // Set state pengumuman


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
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <h1 className="text-3xl text-blue-600 font-bold">Dashboard Siswa</h1>
      <p className="text-gray-600">Selamat datang, {user.fullName}!</p>
      <AnnouncementSection isLoading={isLoading} announcements={announcements} />

      {/* Gunakan komponen yang sudah dipecah */}
      <MyClassesSection isLoading={isLoading} myClasses={myClasses} />
      
    <ClassBrowserSection 
    isLoading={isLoading} 
    groupedSubjects={groupedSubjects} 
     myClasses={myClasses}
     onEnrolSuccess={fetchData} 
/>    </div>
  );
}