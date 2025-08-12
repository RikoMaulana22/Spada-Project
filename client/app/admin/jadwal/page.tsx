'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/axios';
import { FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import AddScheduleModal from '@/components/dashboard/admin/AddScheduleModal';

// Definisikan tipe data yang relevan
interface Schedule {
    id: number;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    class: { name: string };
    subject: { name: string };
    teacher: { fullName: string };
}

export default function ManageSchedulesPage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false); // State untuk modal tambah

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get('/schedules'); // Ambil semua jadwal
            setSchedules(response.data);
        } catch (error) {
            toast.error("Gagal memuat data jadwal.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async (scheduleId: number) => {
        if (window.confirm('Yakin ingin menghapus jadwal ini?')) {
            try {
                await apiClient.delete(`/schedules/${scheduleId}`);
                toast.success("Jadwal berhasil dihapus.");
                fetchData();
            } catch (error) {
                toast.error('Gagal menghapus jadwal.');
            }
        }
    };

    return (
        <>
            {/* Render Modal di sini */}
            <AddScheduleModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onScheduleAdded={fetchData}
            />

            <div className="container mx-auto p-4 md:p-8 text-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Manajemen Jadwal Pelajaran</h1>
                    {/* Hubungkan tombol ke state modal */}
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                    >
                        + Tambah Jadwal
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-gray-50">
                            <tr className='bg-yellow-200 text-gray-700 border font-bold font-large text-left text-l uppercase'>
                                <th className="py-3 px-4 border border-gray-300">Hari</th>
                                <th className="py-3 px-4 border border-gray-300">Waktu</th>
                                <th className="py-3 px-4 border border-gray-300">Kelas</th>
                                <th className="py-3 px-4 border border-gray-300">Mata Pelajaran</th>
                                <th className="py-3 px-4 border border-gray-300">Guru</th>
                                <th className="py-3 px-4 border border-gray-300">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="py-4 text-center">Memuat jadwal...</td></tr>
                            ) : schedules.length > 0 ? schedules.map(schedule => (
                                <tr key={schedule.id} className="border-b">
                                    <td className="py-3 px-4 font-semibold capitalize">{schedule.dayOfWeek.toLowerCase()}</td>
                                    <td className="py-3 px-4">{schedule.startTime} - {schedule.endTime}</td>
                                    <td className="py-3 px-4">{schedule.class.name}</td>
                                    <td className="py-3 px-4">{schedule.subject.name}</td>
                                    <td className="py-3 px-4">{schedule.teacher.fullName}</td>
                                    <td className="py-3 px-4">
                                        <button onClick={() => handleDelete(schedule.id)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={6} className="py-4 text-center text-gray-500">Belum ada jadwal yang dibuat.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}