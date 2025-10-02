'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/axios';
import CreateClassModal from './CreateClassModal';
import Link from 'next/link';
import { User, ClassSummary, Announcement, GlobalMaterial, ScheduleItem } from '@/types';
import AnnouncementSection from './AnnouncementSection';
import GlobalMaterialsSection from './GlobalMaterialsSection';
import TodayScheduleSection from './TodayScheduleSection';
// Impor ikon untuk mempercantik tampilan
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function TeacherDashboard({ user }: { user: User }) {
  // State dan logika pengambilan data tidak berubah
  const [myClasses, setMyClasses] = useState<ClassSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [globalMaterials, setGlobalMaterials] = useState<GlobalMaterial[]>([]);
  const [mySchedules, setMySchedules] = useState<ScheduleItem[]>([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ myClassesResponse, announcementsResponse, globalMaterialsResponse, schedulesResponse ] = await Promise.all([
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
    // TODO: Implementasi modal edit
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kelas ini beserta seluruh isinya?')) return;
    try {
      await apiClient.delete(`/classes/${classId}`);
      fetchData();
    } catch (error) {
      console.error('Gagal menghapus kelas:', error);
      alert('Gagal menghapus kelas. Silakan coba lagi.');
    }
  };

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  return (
    <>
      {/* Container utama dengan layout penuh dan warna latar yang lembut */}
      <div className="w-full min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
        
        {/* Header Dashboard yang lebih modern */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Dashboard Guru</h1>
            <p className="text-gray-600 mt-1">Selamat datang kembali, {user.fullName}! 🎓</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            <Plus size={20} />
            Buat Kelas Baru
          </button>
        </div>

        {/* Grid Layout Utama */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Kolom Kiri (Konten Utama) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-blue-900 border-b-2 border-gray-600 pb-2 mb-6">
                Kelas yang Anda Ajar
              </h2>
              {isLoading ? (
                <p>Memuat data kelas...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myClasses.length > 0 ? (
                    myClasses.map((cls) => (
                      // Kartu kelas yang didesain ulang
                      <div key={cls.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl hover:-translate-y-1 transform transition-all duration-300 flex flex-col group">
                        <div className="h-40 bg-gray-200 overflow-hidden">
                          <img 
                            src={cls.imageUrl ? `${backendUrl}${cls.imageUrl}` : '/images/default-class.jpg'} 
                            alt={cls.name} 
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4 flex flex-col justify-between flex-grow">
                          <div>
                            <Link href={`/kelas/${cls.id}`}>
                              <h3 className="font-bold text-lg text-gray-800 hover:text-blue-600 cursor-pointer">{cls.name}</h3>
                            </Link>
                            <p className="text-sm text-gray-500">{cls.subject.name}</p>
                            <p className="text-sm mt-2 font-semibold text-gray-700">{cls._count.members} Siswa</p>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 border-t flex justify-end gap-2">
                          <button onClick={() => handleEditClass(cls.id.toString())} className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition-colors">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDeleteClass(cls.id.toString())} className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 col-span-full">Anda belum membuat kelas. Klik tombol "Buat Kelas Baru" untuk memulai.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Kolom Kanan (Info Tambahan) */}
          <div className="lg:col-span-1 space-y-8">
            <AnnouncementSection isLoading={isLoading} announcements={announcements} />
            <TodayScheduleSection isLoading={isLoading} schedules={mySchedules} />
            <GlobalMaterialsSection isLoading={isLoading} materials={globalMaterials} />
          </div>
        </div>
      </div>

      {/* Modal Buat Kelas (tidak berubah) */}
      <CreateClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClassCreated={fetchData}
      />
    </>
  );
}