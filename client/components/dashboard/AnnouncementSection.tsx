'use client';

import { FaBullhorn } from 'react-icons/fa';
import { Announcement } from '@/types'; // Kita akan pastikan tipe ini ada

interface AnnouncementSectionProps {
  announcements: Announcement[];
  isLoading: boolean;
}

// Komponen Skeleton untuk loading
const AnnouncementSkeleton = () => (
    <div className="p-4 bg-white border rounded-lg shadow-sm animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mt-2"></div>
    </div>
);

export default function AnnouncementSection({ announcements, isLoading }: AnnouncementSectionProps) {
  if (isLoading) {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Pengumuman Terbaru</h2>
            <div className="space-y-4">
                <AnnouncementSkeleton />
            </div>
        </div>
    );
  }
  
  // Jangan tampilkan section sama sekali jika tidak ada pengumuman
  if (announcements.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Pengumuman Terbaru</h2>
      <div className="space-y-4">
        {announcements.map((item) => (
          <div key={item.id} className="p-4 bg-white border-l-4 border-blue-500 rounded-r-lg shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Oleh {item.author.fullName} - {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <FaBullhorn className="text-blue-400 text-xl" />
            </div>
            <p className="mt-3 text-gray-700 whitespace-pre-wrap">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}