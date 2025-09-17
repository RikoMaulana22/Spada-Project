'use client';

import { useState, useEffect, useMemo } from 'react';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import { FaBook, FaChevronLeft, FaUserGraduate, FaSearch } from 'react-icons/fa';
import Link from 'next/link';

// Definisikan tipe data untuk entri rekap nilai
interface GradebookEntry {
  id: number;
  score: number;
  submissionDate: string;
  student: { fullName: string };
  assignment: {
    title: string;
    topic: {
      class: {
        name: string;
      };
    };
  };
}

// Tipe data untuk data yang sudah dikelompokkan
type GroupedGradebook = Record<string, GradebookEntry[]>;

export default function TeacherGradebookPage() {
  const [gradebook, setGradebook] = useState<GradebookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  // ==================================================================
  // PERBAIKAN 1: State baru untuk menampung kata kunci pencarian
  // ==================================================================
  const [searchTerm, setSearchTerm] = useState('');

  // Mengelompokkan semua nilai berdasarkan nama siswa
  const groupedByStudent = useMemo(() => {
    return gradebook.reduce((acc, item) => {
      const studentName = item.student.fullName;
      if (!acc[studentName]) {
        acc[studentName] = [];
      }
      acc[studentName].push(item);
      return acc;
    }, {} as GroupedGradebook);
  }, [gradebook]);

  // ==================================================================
  // PERBAIKAN 2: Filter daftar nama siswa berdasarkan searchTerm
  // ==================================================================
  const studentNames = useMemo(() => {
    const allNames = Object.keys(groupedByStudent).sort();
    if (!searchTerm) {
      return allNames;
    }
    return allNames.filter(name =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [groupedByStudent, searchTerm]);

  useEffect(() => {
    const fetchGradebook = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get('/users/gradebook');
        setGradebook(response.data);
      } catch (error) {
        console.error("Gagal mengambil rekap nilai:", error);
        toast.error("Tidak dapat memuat rekap nilai.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGradebook();
  }, []);

  if (isLoading) {
    return <div className="text-center text-gray-400 p-8">Memuat rekap nilai...</div>;
  }

  return (
    <div className="space-y-8 text-gray-800 p-8">
      <Link href="/profile" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-700 font-semibold hover:underline">
        <FaChevronLeft />
        <span>Kembali ke Profil</span>
      </Link>

      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FaBook /> Rekap Nilai Siswa
        </h1>
        
        {selectedStudent ? (
          // TAMPILAN DETAIL NILAI SISWA
          <div>
            <button 
              onClick={() => setSelectedStudent(null)} 
              className="inline-flex items-center gap-2 text-blue-600 hover:underline font-semibold mb-6"
            >
              <FaChevronLeft />
              <span>Kembali ke Daftar Siswa</span>
            </button>
            <h2 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
              <FaUserGraduate /> {selectedStudent}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="p-3 font-medium uppercase text-gray-600">Tugas</th>
                    <th className="p-3 font-medium uppercase text-gray-600">Kelas</th>
                    <th className="p-3 font-medium uppercase text-gray-600">Tanggal</th>
                    <th className="p-3 font-medium uppercase text-gray-600 text-right">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedByStudent[selectedStudent].map(item => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{item.assignment.title}</td>
                      <td className="p-3">{item.assignment.topic.class.name}</td>
                      <td className="p-3">{new Date(item.submissionDate).toLocaleDateString('id-ID')}</td>
                      <td className="p-3 text-right font-bold">{item.score.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // TAMPILAN DAFTAR NAMA SISWA
          <div>
            {/* ================================================================== */}
            {/* PERBAIKAN 3: Tambahkan input pencarian */}
            {/* ================================================================== */}
            <div className="mb-6">
              <label htmlFor="searchStudent" className="block text-sm font-medium text-gray-700 mb-1">
                Cari Nama Siswa
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="searchStudent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ketik nama untuk memfilter..."
                  className="form-input w-full md:w-1/2 block pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentNames.length > 0 ? (
                studentNames.map(name => (
                  <button
                    key={name}
                    onClick={() => setSelectedStudent(name)}
                    className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200 text-left hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center gap-3"
                  >
                    <FaUserGraduate className="text-xl text-gray-500" />
                    <span className="font-semibold">{name}</span>
                  </button>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <p>{gradebook.length > 0 ? 'Tidak ada siswa yang cocok dengan pencarian Anda.' : 'Belum ada nilai yang tercatat.'}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}