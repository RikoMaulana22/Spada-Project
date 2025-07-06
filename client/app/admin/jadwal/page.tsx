'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/axios';
import { FaTrash } from 'react-icons/fa';

// Definisikan tipe data yang relevan
interface Class { id: number; name: string; }
interface Schedule {
    id: number;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    subject: { name: string };
    teacher: { fullName: string };
}

export default function ManageSchedulesPage() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Ambil daftar semua kelas untuk dropdown
    useEffect(() => {
        apiClient.get('/classes').then(res => setClasses(res.data));
    }, []);

    // Ambil data jadwal ketika kelas dipilih
    useEffect(() => {
        if (!selectedClass) {
            setSchedules([]);
            return;
        }
        setIsLoading(true);
        apiClient.get(`/schedules/class/${selectedClass}`)
            .then(res => setSchedules(res.data))
            .catch(err => console.error("Gagal mengambil jadwal:", err))
            .finally(() => setIsLoading(false));
    }, [selectedClass]);

    const handleDelete = async (scheduleId: number) => {
        if (window.confirm('Yakin ingin menghapus jadwal ini?')) {
            try {
                await apiClient.delete(`/schedules/${scheduleId}`);
                // Refresh data setelah hapus
                setSelectedClass(prev => prev); // Trik untuk re-trigger useEffect
                // Atau panggil fungsi fetch terpisah
            } catch (error) {
                alert('Gagal menghapus jadwal.');
            }
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8 text-gray-800">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manajemen Jadwal Pelajaran</h1>
                <button 
                    disabled={!selectedClass} 
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-600"
                >
                    + Tambah Jadwal
                </button>
            </div>
            
            {/* Pemilih Kelas */}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Pilih Kelas untuk Dikelola</label>
                <select 
                    value={selectedClass} 
                    onChange={e => setSelectedClass(e.target.value)}
                    className="p-2 border rounded-md w-full max-w-sm"
                >
                    <option value="">-- Pilih Kelas --</option>
                    {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                </select>
            </div>

            {/* Tabel Jadwal */}
            {selectedClass && (
                <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="py-3 px-4">Hari</th>
                                <th className="py-3 px-4">Waktu</th>
                                <th className="py-3 px-4">Mata Pelajaran</th>
                                <th className="py-3 px-4">Guru</th>
                                <th className="py-3 px-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={5} className="py-4 text-center">Memuat jadwal...</td></tr>
                            ) : schedules.length > 0 ? schedules.map(schedule => (
                                <tr key={schedule.id} className="border-b">
                                    <td className="py-3 px-4 font-semibold capitalize">{schedule.dayOfWeek.toLowerCase()}</td>
                                    <td className="py-3 px-4">{schedule.startTime} - {schedule.endTime}</td>
                                    <td className="py-3 px-4">{schedule.subject.name}</td>
                                    <td className="py-3 px-4">{schedule.teacher.fullName}</td>
                                    <td className="py-3 px-4">
                                        <button onClick={() => handleDelete(schedule.id)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="py-4 text-center text-gray-500">Belum ada jadwal untuk kelas ini.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}