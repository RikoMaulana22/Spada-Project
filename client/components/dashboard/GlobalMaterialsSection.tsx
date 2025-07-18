'use client';

// --- MODIFIKASI: Impor lebih banyak ikon ---
import { FaFilePdf, FaFilePowerpoint, FaFileWord, FaFileAlt } from 'react-icons/fa';
import { ReactNode } from 'react';

// Definisikan tipe data untuk materi global
interface GlobalMaterial {
  id: number;
  title: string;
  fileUrl: string;
}

interface GlobalMaterialsSectionProps {
  materials: GlobalMaterial[];
  isLoading: boolean;
}

// Komponen Skeleton untuk loading (tidak berubah)
const MaterialSkeleton = () => (
    <div className="flex items-center p-3 bg-gray-200 rounded-md animate-pulse">
        <div className="w-5 h-5 bg-gray-300 rounded"></div>
        <div className="ml-3 h-4 bg-gray-300 rounded w-1/2"></div>
    </div>
);

export default function GlobalMaterialsSection({ materials, isLoading }: GlobalMaterialsSectionProps) {
  // --- MODIFIKASI 1: Fungsi untuk mendapatkan ikon berdasarkan tipe file ---
  const getFileIcon = (fileUrl: string): { icon: ReactNode, color: string } => {
    const extension = fileUrl.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return { icon: <FaFilePdf />, color: 'text-red-500' };
      case 'pptx':
      case 'ppt':
        return { icon: <FaFilePowerpoint />, color: 'text-orange-500' };
      case 'docx':
      case 'doc':
        return { icon: <FaFileWord />, color: 'text-blue-500' };
      default:
        return { icon: <FaFileAlt />, color: 'text-gray-500' };
    }
  };
  
  // Ambil URL backend dari environment variable
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  if (!isLoading && materials.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Materi & Sumber Daya Umum</h2>
      <div className="space-y-3">
        {isLoading ? (
            <>
                <MaterialSkeleton />
                <MaterialSkeleton />
            </>
        ) : (
            materials.map(material => {
              // Panggil fungsi helper untuk setiap materi
              const { icon, color } = getFileIcon(material.fileUrl);

              return (
                // --- MODIFIKASI 2: Perbaiki 'href' dan gunakan ikon dinamis ---
                <a 
                    key={material.id} 
                    href={`${backendUrl}${material.fileUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center p-3 bg-slate-50 border rounded-md hover:bg-slate-100 transition-colors"
                >
                    <span className={`text-lg ${color}`}>{icon}</span>
                    <span className="ml-3 font-medium text-gray-700">{material.title}</span>
                </a>
              )
            })
        )}
      </div>
    </div>
  );
}