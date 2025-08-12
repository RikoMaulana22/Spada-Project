// Path: client/app/(dashboard)/absensi/[id]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

// Definisikan tipe data yang kita harapkan dari API
interface StudentInfo {
  id: number;
  fullName: string;
  nisn: string | null;
}
interface AttendanceRecordInfo {
  timestamp: string;
  status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA'; // <-- Tipe data diperbarui
  notes: string | null;
  proofUrl: string | null;                    // <-- Tipe data diperbarui
  student: StudentInfo;
}
interface AttendanceDetails {
  id: number;
  title: string;
  openTime: string;
  closeTime: string;
  records: AttendanceRecordInfo[];
}

export default function AttendanceDetailPage() {
  const params = useParams();
  const { id } = params;
  const { user } = useAuth();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';


  const [attendanceData, setAttendanceData] = useState<AttendanceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchData = useCallback(async () => {
    if (id) {
      try {
        const response = await apiClient.get(`/attendance/${id}`);
        setAttendanceData(response.data);
      } catch (err) {
        setError('Gagal memuat data absensi.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    fetchData();
    // Update waktu setiap detik untuk status live
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [fetchData]);

  const getStatus = () => {
    if (!attendanceData) return { text: 'Memuat...', color: 'bg-gray-400' };
    const now = currentTime;
    const open = new Date(attendanceData.openTime);
    const close = new Date(attendanceData.closeTime);

    if (now < open) return { text: 'Belum Dibuka', color: 'bg-gray-500' };
    if (now > close) return { text: 'Sudah Ditutup', color: 'bg-red-500' };
    return { text: 'Sedang Berlangsung', color: 'bg-green-500' };
  };

  if (isLoading) return <div className="p-8 text-center">Memuat data absensi...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!attendanceData) return <div className="p-8 text-center">Sesi absensi tidak ditemukan.</div>;

  const status = getStatus();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Link href="/kelas/1" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-700 font-medium transition-colors">
        <FaArrowLeft />
        <span>Kembali Kelas</span>
      </Link>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Header */}
        <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{attendanceData.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Dibuka: {new Date(attendanceData.openTime).toLocaleString('id-ID')}
              <br />
              Ditutup: {new Date(attendanceData.closeTime).toLocaleString('id-ID')}
            </p>
          </div>
          <span className={`px-3 py-1 text-white text-sm rounded-full ${status.color}`}>
            {status.text}
          </span>
        </div>

        {/* Tabel Rekap Kehadiran */}
        <div className="mt-6 text-gray-800">

          <h2 className="text-xl font-semibold mb-3">Rekap Kehadiran ({attendanceData.records.length} Siswa)</h2>
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">No</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Nama Lengkap</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">NISN</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Waktu Absen</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Keterangan</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">File Pendukung</th>

                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceData.records.length > 0 ? (
                  attendanceData.records.map((record, index) => (
                    <tr key={record.student.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">{index + 1}.</td>
                      <td className="py-3 px-4">{record.student.fullName}</td>
                      <td className="py-3 px-4">{record.student.nisn || '-'}</td>
                      <td className="py-3 px-4">{new Date(record.timestamp).toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${record.status === 'HADIR' ? 'bg-green-100 text-green-800' :
                          record.status === 'SAKIT' ? 'bg-yellow-100 text-yellow-800' :
                            record.status === 'IZIN' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{record.notes || '-'}</td>
                      <td className="py-3 px-4">
                        {record.proofUrl ? (
                          <a
                            href={`${backendUrl}${record.proofUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-semibold text-sm"
                          >
                            Lihat Bukti
                          </a>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 px-4 text-center text-gray-500">
                      Belum ada siswa yang melakukan absensi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}