'use client';

import Link from 'next/link';
import { ClassSummary } from '@/types';

// Komponen Skeleton untuk kartu kelas (diasumsikan sudah ada)
const ClassCardSkeleton = () => (
  <div className="border p-4 rounded-lg bg-gray-50 animate-pulse">
    <div className="h-32 bg-gray-200 rounded mb-4"></div>
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

interface MyClassesSectionProps {
  isLoading: boolean;
  myClasses: ClassSummary[];
}

export default function MyClassesSection({ isLoading, myClasses }: MyClassesSectionProps) {
  // Ambil URL backend dari environment variable untuk membangun path gambar
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Kelas yang Anda Ikuti</h2>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Tampilkan 3 skeleton saat loading */}
          {[...Array(3)].map((_, i) => <ClassCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myClasses.length > 0 ? (
            myClasses.map((cls) => (
              <Link href={`/kelas/${cls.id}`} key={cls.id}>
                <div className="border rounded-lg overflow-hidden hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer h-full flex flex-col">
                  {/* Bagian Gambar */}
                  <div className="h-32 bg-gray-200 flex items-center justify-center">
                    {cls.imageUrl ? (
                      <img 
                        src={`${backendUrl}/${cls.imageUrl.replace(/\\/g, '/')}`} 
                        alt={cls.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">Tidak Ada Gambar</span>
                    )}
                  </div>
                  {/* Bagian Teks */}
                  <div className="p-4 flex flex-col justify-between flex-grow">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{cls.name}</h3>
                      <p className="text-sm text-gray-500">{cls.subject.name}</p>
                      <p className="text-xs text-gray-400 mt-1">Oleh: {cls.teacher.fullName}</p>
                    </div>
                    <p className="text-sm mt-4 font-semibold text-gray-700">{cls._count.members} Siswa</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p>Anda belum terdaftar di kelas manapun.</p>
          )}
        </div>
      )}
    </div>
  );
}