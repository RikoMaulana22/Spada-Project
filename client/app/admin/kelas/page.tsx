"use client";

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/axios';
import AddClassModal from '@/components/dashboard/admin/AddClassModal';
import Link from 'next/link';
import toast from 'react-hot-toast'; // 1. Impor toast untuk notifikasi

// Definisikan tipe data ClassInfo
interface ClassInfo {
    id: number;
    name: string;
    subject: { name: string; grade: number; }; // Tambahkan grade untuk filter
    teacher: { fullName: string };
    homeroomTeacher: { fullName: string } | null;
}

export default function ClassManagementPage() {
    const [classes, setClasses] = useState<ClassInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // 2. State baru untuk menampung nilai filter
    const [selectedGrade, setSelectedGrade] = useState<string>('');

    // 3. Modifikasi fetchData untuk menangani filter
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Tambahkan parameter 'grade' ke request jika filter dipilih
            const url = selectedGrade ? `/admin/classes?grade=${selectedGrade}` : '/admin/classes';
            const response = await apiClient.get(url);
            setClasses(response.data);
        } catch (error) {
            console.error("Gagal mengambil data kelas:", error);
            toast.error("Gagal memuat data kelas.");
        } finally {
            setIsLoading(false);
        }
    }, [selectedGrade]); // fetchData akan dibuat ulang jika selectedGrade berubah

    useEffect(() => {
        fetchData();
    }, [fetchData]); // useEffect akan berjalan saat pertama kali & saat fetchData berubah

    // 4. Fungsi untuk menangani penghapusan kelas
    const handleDeleteClass = async (classId: number) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus kelas ini? Semua data terkait akan ikut terhapus secara permanen.')) {
            return;
        }

        const toastId = toast.loading('Menghapus kelas...');
        try {
            await apiClient.delete(`/admin/classes/${classId}`);
            toast.success('Kelas berhasil dihapus.', { id: toastId });
            fetchData(); // Muat ulang data setelah berhasil dihapus
        } catch (error) {
            toast.error('Gagal menghapus kelas.', { id: toastId });
            console.error(error);
        }
    };

    if (isLoading && classes.length === 0) return <div className="p-8 text-center">Memuat Kelas...</div>;

    return (
        <div className="container mx-auto p-4 text-gray-600 md:p-8">
            <AddClassModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onClassCreated={fetchData} 
            />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manajemen Kelas</h1>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                    + Tambah Kelas Baru
                </button>
            </div>

            {/* 5. Tambahkan UI untuk filter */}
            <div className="mb-4 flex justify-end">
                <div className="w-full md:w-1/4">
                    <label className="block text-sm font-medium mb-1  ">Filter Berdasarkan Kelas</label>
                    <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className="form-select font-bold w-full bg-white border border-gray-300 rounded-md px-4 py-2"
                    >
                        <option value="">Semua Kelas</option>
                        <option value="7">Kelas 7</option>
                        <option value="8">Kelas 8</option>
                        <option value="9">Kelas 9</option>
                    </select>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr className='bg-yellow-200 text-gray-700 border font-bold font-large text-left text-l uppercase'>
                                <th className="px-6 py-3 border border-gray-300">Nama Kelas</th>
                                <th className="px-6 py-3 border border-gray-300">Mata Pelajaran</th>
                                <th className="px-6 py-3 border border-gray-300">Guru Pengajar</th>
                                <th className="px-6 py-3 border border-gray-300">Wali Kelas</th>
                                <th className="px-6 py-3 border border-gray-300">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading && (
                                <tr>
                                    <td colSpan={5} className="text-center py-4">Memuat...</td>
                                </tr>
                            )}
                            {!isLoading && classes.map(cls => (
                                <tr key={cls.id}>
                                    <td className="px-6 py-4 border border-gray-300 whitespace-nowrap font-medium">{cls.name}</td>
                                    <td className="px-6 py-4 border border-gray-300 whitespace-nowrap">{cls.subject.name} (Kelas {cls.subject.grade})</td>
                                    <td className="px-6 py-4 border border-gray-300 whitespace-nowrap">{cls.teacher.fullName}</td>
                                    <td className="px-6 py-4 border border-gray-300 whitespace-nowrap">{cls.homeroomTeacher?.fullName || 'Belum Ditentukan'}</td>
                                    {/* 6. Tambahkan tombol Hapus */}
                                    <td className="px-6 py-4 border border-gray-300 whitespace-nowrap space-x-4">
                                        <Link 
                                            href={`/admin/classes/${cls.id}/enroll`}
                                            className="text-blue-600 hover:underline font-semibold text-sm"
                                        >
                                            Kelola Pendaftaran
                                        </Link>
                                        <button 
                                            onClick={() => handleDeleteClass(cls.id)}
                                            className="text-red-600 hover:underline font-semibold text-sm"
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))}
                             {!isLoading && classes.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-4 text-gray-500">
                                        Tidak ada kelas yang ditemukan untuk filter ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}