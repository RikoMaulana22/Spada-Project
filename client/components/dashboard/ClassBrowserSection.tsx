'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { GroupedSubjects, Subject, ClassInfo, ClassSummary } from '@/types'; // <-- Tambahkan ClassSummary
import apiClient from '@/lib/axios'; // <-- IMPORT BARU

// Komponen Skeleton untuk accordion (tidak berubah)
const AccordionSkeleton = () => (
    <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
        ))}
    </div>
);

// --- PERUBAHAN 1: PERBARUI PROPS DI INTERFACE ---
interface ClassBrowserSectionProps {
  isLoading: boolean;
  groupedSubjects: GroupedSubjects;
  myClasses: ClassSummary[];      // Props baru untuk data kelas yang diikuti
  onEnrolSuccess: () => void;     // Props baru untuk fungsi refresh
}

export default function ClassBrowserSection({ isLoading, groupedSubjects, myClasses, onEnrolSuccess }: ClassBrowserSectionProps) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({});
  
  // --- PERUBAHAN 2: TAMBAHKAN STATE & FUNGSI UNTUK PROSES PENDAFTARAN ---
  const [enrollingId, setEnrollingId] = useState<number | null>(null);
  const toggleCategory = (grade: string) => {
  setOpenCategories(prev => ({ ...prev, [grade]: !prev[grade] }));
};

const toggleSubject = (subjectId: number) => {
  setOpenSubjects(prev => ({ ...prev, [subjectId]: !prev[subjectId] }));
};

  const handleEnrol = async (classId: number) => {
    setEnrollingId(classId); // Menandai tombol mana yang diklik untuk loading
    try {
      await apiClient.post(`/classes/${classId}/enrol`);
      alert('Pendaftaran berhasil!');
      onEnrolSuccess(); // Memanggil fungsi refresh dari StudentDashboard
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal mendaftar ke kelas.');
      console.error(error);
    } finally {
      setEnrollingId(null); // Selesaikan proses loading
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800">Telusuri Semua Kelas</h2>
      {isLoading ? <div className="mt-4"><AccordionSkeleton /></div> : (
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
                      {openSubjects[subject.id] && subject.Class && subject.Class.length > 0 ? (
                        <ul className="list-disc ml-10 my-1 space-y-1">
                          {subject.Class.map((cls: ClassInfo) => {
                            // --- PERUBAHAN 3: LOGIKA UTAMA UNTUK MENAMPILKAN LINK ATAU TOMBOL ---
                            const isEnrolled = myClasses.some(myCls => myCls.id === cls.id);
                            
                            return (
                              <li key={cls.id} className="flex justify-between items-center py-1">
                                {isEnrolled ? (
                                  // Jika sudah terdaftar, tampilkan sebagai link
                                  <Link href={`/kelas/${cls.id}`} className="text-gray-700 hover:text-black hover:underline">
                                    {cls.name}
                                  </Link>
                                ) : (
                                  // Jika belum, tampilkan teks dan tombol "Daftar"
                                  <>
                                    <span className="text-gray-700">{cls.name}</span>
                                    <button 
                                      onClick={() => handleEnrol(cls.id)}
                                      disabled={enrollingId === cls.id}
                                      className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:bg-blue-300"
                                    >
                                      {enrollingId === cls.id ? 'Mendaftar...' : 'Daftar'}
                                    </button>
                                  </>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      ) : openSubjects[subject.id] && (
                        <p className="text-sm text-gray-500 ml-10 my-1">Belum ada kelas untuk mata pelajaran ini.</p>
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
  );
}