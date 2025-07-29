'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';
import AddClassModal from '@/components/dashboard/admin/AddClassModal';
import Link from 'next/link'; // <-- 1. PASTIKAN Link SUDAH DIIMPOR

// Definisikan tipe data
interface ClassInfo {
    id: number;
    name: string;
    subject: { name: string };
    teacher: { fullName: string };
    homeroomTeacher: { fullName: string } | null;
}

export default function ClassManagementPage() {
    const [classes, setClasses] = useState<ClassInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get('/admin/classes');
            setClasses(response.data);
        } catch (error) {
            console.error("Gagal mengambil data kelas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading) return <div className="p-8 text-center">Memuat Kelas...</div>;

    return (
        <div className="container mx-auto p-4  text-gray-600 md:p-8">
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
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Nama Kelas</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Mata Pelajaran</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Guru Pengajar</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Wali Kelas</th>
                                {/* --- 2. TAMBAHKAN HEADER KOLOM AKSI --- */}
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y  divide-gray-200">
                            {classes.map(cls => (
                                <tr key={cls.id}>
                                    <td className="px-6 py-4  whitespace-nowrap font-medium">{cls.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{cls.subject.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{cls.teacher.fullName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{cls.homeroomTeacher?.fullName || 'Belum Ditentukan'}</td>
                                    {/* --- 3. TAMBAHKAN SEL UNTUK LINK AKSI --- */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link 
                                            href={`/admin/classes/${cls.id}/enroll`}
                                            className="text-blue-600 hover:underline font-semibold text-sm"
                                        >
                                            Kelola Pendaftaran
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}