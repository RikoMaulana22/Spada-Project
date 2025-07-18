// Path: src/app/grades/page.tsx
'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';
import { FaChartBar, FaBook, FaChevronLeft } from 'react-icons/fa';

// Tipe data untuk nilai (tidak berubah)
interface Grade {
  id: number;
  score: number;
  submissionDate: string;
  assignment: {
    title: string;
    topic: {
      class: {
        name: string;
        subject: {
          name: string;
        }
      }
    }
  }
}

// Tipe data baru untuk data yang sudah dikelompokkan
type GroupedGrades = Record<string, Grade[]>;

export default function GradesPage() {
  // --- PERUBAHAN 1: State Baru ---
  const [groupedGrades, setGroupedGrades] = useState<GroupedGrades>({});
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  // -----------------------------

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndGroupGrades = async () => {
      try {
        const response = await apiClient.get('/submissions/my-grades');
        const grades: Grade[] = response.data;

        // --- PERUBAHAN 2: Pengelompokan Data ---
        const grouped = grades.reduce((acc, grade) => {
          const subjectName = grade.assignment.topic.class.subject.name;
          if (!acc[subjectName]) {
            acc[subjectName] = [];
          }
          acc[subjectName].push(grade);
          return acc;
        }, {} as GroupedGrades);

        setGroupedGrades(grouped);
        // -------------------------------------

      } catch (err) {
        setError('Gagal memuat data nilai.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndGroupGrades();
  }, []);

  if (isLoading) {
    return <div className="text-center p-8">Memuat data nilai...</div>;
  }
  if (error) {
    return <div className="text-center text-red-500 p-8">{error}</div>;
  }

  // --- PERUBAHAN 3: Tampilan Kondisional ---
  return (
    <div className="space-y-8">
      {/* Jika ada mata pelajaran yang dipilih, tampilkan tabel nilai */}
      {selectedSubject ? (
        <div>
          <button 
            onClick={() => setSelectedSubject(null)} 
            className="flex items-center gap-2 mb-6 text-blue-600 font-semibold hover:underline"
          >
            <FaChevronLeft /> Kembali ke Daftar Mata Pelajaran
          </button>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaChartBar /> Nilai: {selectedSubject}
          </h1>
          <div className="bg-white p-6 mt-4 rounded-lg shadow-md border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Tugas</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groupedGrades[selectedSubject]?.map((grade) => (
                    <tr key={grade.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{grade.assignment.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grade.assignment.topic.class.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(grade.submissionDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1 inline-flex text-base font-bold rounded-full ${grade.score >= 75 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {grade.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Jika tidak ada mata pelajaran yang dipilih, tampilkan daftar mata pelajaran */
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3"><FaChartBar /> Rekap Nilai Saya</h1>
          {Object.keys(groupedGrades).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {Object.keys(groupedGrades).map((subject) => (
                <button 
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className="p-6 bg-white rounded-lg shadow-md border border-gray-200 text-left hover:border-blue-500 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <FaBook className="text-xl text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{subject}</h2>
                      <p className="text-sm text-gray-500">{groupedGrades[subject].length} nilai tercatat</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-6 bg-white rounded-lg shadow-md border border-gray-200 mt-6">
                <FaBook className="mx-auto text-5xl text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700">Belum Ada Nilai</h2>
                <p className="text-gray-500 mt-2">Anda belum memiliki nilai yang tercatat di mata pelajaran mana pun.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}