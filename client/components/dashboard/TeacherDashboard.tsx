'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/axios';
import CreateClassModal from './CreateClassModal';
import Link from 'next/link';
import { User, ClassSummary, Announcement, GlobalMaterial, ScheduleItem } from '@/types';
import AnnouncementSection from './AnnouncementSection';
import GlobalMaterialsSection from './GlobalMaterialsSection';
import TodayScheduleSection from './TodayScheduleSection';

export default function TeacherDashboard({ user }: { user: User }) {
  const [myClasses, setMyClasses] = useState<ClassSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State baru
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [globalMaterials, setGlobalMaterials] = useState<GlobalMaterial[]>([]);
  const [mySchedules, setMySchedules] = useState<ScheduleItem[]>([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const myClassesPromise = apiClient.get('/classes/teacher');
      const announcementsPromise = apiClient.get('/announcements');
      const globalMaterialsPromise = apiClient.get('/materials/global');
      const schedulePromise = apiClient.get('/schedules/my');

      const [
        myClassesResponse, 
        announcementsResponse,
        globalMaterialsResponse,
        schedulesResponse
      ] = await Promise.all([
        myClassesPromise,
        announcementsPromise,
        globalMaterialsPromise,
        schedulePromise,
      ]);

      setMyClasses(myClassesResponse.data);
      setAnnouncements(announcementsResponse.data);
      setGlobalMaterials(globalMaterialsResponse.data);
      setMySchedules(schedulesResponse.data);

    } catch (error) {
      console.error('Gagal mengambil data dashboard guru:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div className="container mx-auto p-4 md:p-8 space-y-8 text-gray-800">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Guru</h1>
            <p className="text-gray-600">Selamat datang kembali, {user.fullName}!</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            + Buat Kelas Baru
          </button>
        </div>
        
        {/* Tampilkan semua section baru */}
        <AnnouncementSection isLoading={isLoading} announcements={announcements} />
        <TodayScheduleSection isLoading={isLoading} schedules={mySchedules} />
        <GlobalMaterialsSection isLoading={isLoading} materials={globalMaterials} />

        {/* Section Kelas yang Diajar */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Kelas yang Anda Ajar</h2>
          {isLoading ? (
            <p>Memuat data kelas...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myClasses.length > 0 ? (
                myClasses.map((cls) => (
                  <Link href={`/kelas/${cls.id}`} key={cls.id}>
                    <div className="border p-4 rounded-lg hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer h-full">
                      <h3 className="font-bold text-lg text-gray-800">{cls.name}</h3>
                      <p className="text-sm text-gray-500">{cls.subject.name}</p>
                      <p className="text-sm mt-4 font-semibold text-gray-700">{cls._count.members} Siswa</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p>Anda belum membuat kelas.</p>
              )}
            </div>
          )}
        </div>
      </div>
      <CreateClassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onClassCreated={fetchData} />
    </>
  );
}