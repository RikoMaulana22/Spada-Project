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
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [globalMaterials, setGlobalMaterials] = useState<GlobalMaterial[]>([]);
  const [mySchedules, setMySchedules] = useState<ScheduleItem[]>([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        myClassesResponse,
        announcementsResponse,
        globalMaterialsResponse,
        schedulesResponse
      ] = await Promise.all([
        apiClient.get('/classes/teacher'),
        apiClient.get('/announcements'),
        apiClient.get('/materials/global'),
        apiClient.get('/schedules/my')
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

  const handleEditClass = (classId: string) => {
    console.log('Edit kelas dengan ID:', classId);
    // TODO: Implementasi modal edit atau redirect ke halaman edit
  };

  const handleDeleteClass = async (classId: string) => {
    const confirmDelete = confirm('Apakah Anda yakin ingin menghapus kelas ini?');
    if (!confirmDelete) return;

    try {
      await apiClient.delete(`/classes/${classId}`);
      fetchData(); // Refresh data setelah penghapusan
    } catch (error) {
      console.error('Gagal menghapus kelas:', error);
      alert('Gagal menghapus kelas. Silakan coba lagi.');
    }
  };

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  return (
    <>
      <div className="container mx-auto p-4 md:p-8 space-y-8 text-gray-800">
        {/* Header */}
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

        {/* Sections */}
        <AnnouncementSection isLoading={isLoading} announcements={announcements} />
        <TodayScheduleSection isLoading={isLoading} schedules={mySchedules} />
        <GlobalMaterialsSection isLoading={isLoading} materials={globalMaterials} />

        {/* Section Kelas */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Kelas yang Anda Ajar</h2>
          {isLoading ? (
            <p>Memuat data kelas...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myClasses.length > 0 ? (
                myClasses.map((cls) => (
                  // --- PERBAIKAN STRUKTUR KARTU DIMULAI DI SINI ---
                  <div key={cls.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-all flex flex-col">
                    {/* Bagian Gambar (tidak lagi di dalam Link) */}
                    <div className="h-32 bg-gray-200 flex items-center justify-center">
                       {cls.imageUrl ? (
                         <img src={`${backendUrl}${cls.imageUrl}`} alt={cls.name} className="h-full w-full object-cover"/>
                       ) : (
                         <span className="text-gray-400 text-sm">Tidak Ada Gambar</span>
                       )}
                    </div>
                    {/* Bagian Teks */}
                    <div className="p-4 flex flex-col justify-between flex-grow">
                      <div>
                        {/* Link hanya membungkus judul */}
                        <Link href={`/kelas/${cls.id}`}>
                          <h3 className="font-bold text-lg text-gray-800 hover:text-blue-600 hover:underline cursor-pointer">{cls.name}</h3>
                        </Link>
                        <p className="text-sm text-gray-500">{cls.subject.name}</p>
                        <p className="text-sm mt-2 font-semibold text-gray-700">{cls._count.members} Siswa</p>
                      </div>
                    </div>
                    {/* Bagian Tombol Edit/Hapus (tidak lagi di dalam Link) */}
                    <div className="p-4 border-t flex gap-4">
                      <button onClick={() => handleEditClass(cls.id.toString())} className="text-blue-600 hover:underline text-sm">Edit</button>
                      <button onClick={() => handleDeleteClass(cls.id.toString())} className="text-red-600 hover:underline text-sm">Hapus</button>
                    </div>
                  </div>
                ))
              ) : (
                <p>Anda belum membuat kelas.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Buat Kelas */}
      <CreateClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClassCreated={fetchData}
      />
    </>
  );
}