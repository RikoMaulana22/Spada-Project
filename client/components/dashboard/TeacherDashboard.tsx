'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/axios';
import CreateClassModal from './CreateClassModal';
import Link from 'next/link';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { User, ClassSummary, GroupedSubjects, Subject, ClassInfo, Announcement } from '@/types';
import AnnouncementSection from './AnnouncementSection'; // Asumsikan berada di folder yang sama

export default function TeacherDashboard({ user }: { user: User }) {
  const [myClasses, setMyClasses] = useState<ClassSummary[]>([]);
  const [groupedSubjects, setGroupedSubjects] = useState<GroupedSubjects>({});
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);


  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // --- PERBAIKAN 1: Gunakan endpoint yang benar untuk mengambil kelas guru ---
      const myClassesPromise = apiClient.get('/classes/teacher'); 
      const groupedSubjectsPromise = apiClient.get('/subjects/grouped');
      const announcementsPromise = apiClient.get('/announcements'); // Ambil pengumuman


      const [myClassesResponse, groupedSubjectsResponse, announcementsResponse] = await Promise.all([
        myClassesPromise,
        groupedSubjectsPromise,
        announcementsPromise,

      ]);

      setMyClasses(myClassesResponse.data);
      setGroupedSubjects(groupedSubjectsResponse.data);
      setAnnouncements(announcementsResponse.data); // Simpan data pengumuman


    } catch (error) {
      console.error('Gagal mengambil data dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleCategory = (grade: string) => {
    setOpenCategories(prev => ({ ...prev, [grade]: !prev[grade] }));
  };

  const toggleSubject = (subjectId: number) => {
    setOpenSubjects(prev => ({ ...prev, [subjectId]: !prev[subjectId] }));
  };

  return (
    <>
      <div className="container mx-auto p-4 md:p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl text-gray-900 font-bold">Dashboard Guru</h1>
            <p className="text-gray-600">Selamat datang kembali, {user.fullName}!</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            + Buat Kelas Baru
          </button>
        </div>
                <AnnouncementSection isLoading={isLoading} announcements={announcements} />

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Kelas yang Anda Ajar</h2>
          {isLoading ? <p>Memuat data kelas...</p> : (
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
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800">Telusuri Semua Kategori Kursus</h2>
          {isLoading ? <p className="mt-4">Memuat kategori...</p> : (
            <div className="mt-4 space-y-1">
              {Object.keys(groupedSubjects).map((grade) => (
                <div key={grade}>
                  <button onClick={() => toggleCategory(grade)} className="w-full flex items-center text-left text-blue-700 font-bold py-2">
                    {openCategories[grade] ? <FaChevronDown className="mr-2" /> : <FaChevronRight className="mr-2" />}
                    Kelas {grade}
                  </button>
                  {openCategories[grade] && (
                    <div className="pl-6">
                      {groupedSubjects[grade].map((subject: Subject) => (
                        <div key={subject.id}>
                          <button onClick={() => toggleSubject(subject.id)} className="w-full flex items-center text-left text-blue-600 font-semibold py-1">
                            {openSubjects[subject.id] ? <FaChevronDown className="mr-2 text-xs" /> : <FaChevronRight className="mr-2 text-xs" />}
                            {subject.name}
                          </button>
                          {/* --- PERBAIKAN 2: Gunakan properti 'Class' (C besar) sesuai data dari backend --- */}
                          {openSubjects[subject.id] && subject.Class && subject.Class.length > 0 && (
                            <ul className="list-disc ml-10 my-1 space-y-1">
                              {subject.Class.map((cls: ClassInfo) => (
                                <li key={cls.id}>
                                  <Link href={`/kelas/${cls.id}`} className="text-gray-700 hover:text-black hover:underline">
                                    {cls.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <CreateClassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onClassCreated={fetchData} />
    </>
  );
}