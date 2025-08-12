'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import AddSubjectModal from '@/components/dashboard/admin/AddSubjectModal';
import EditSubjectModal from '@/components/dashboard/admin/EditSubjectModal';

interface Subject {
    id: number;
    name: string;
    grade: number;
}

export default function ManageSubjectsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // State untuk kontrol modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

    // 1. State baru untuk menampung nilai filter
    const [selectedGrade, setSelectedGrade] = useState<string>('');

    // 2. Modifikasi fetchData untuk menangani filter
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Tambahkan parameter 'grade' ke request jika filter dipilih
            const url = selectedGrade ? `/subjects?grade=${selectedGrade}` : '/subjects';
            const response = await apiClient.get(url);
            setSubjects(response.data);
        } catch (error) {
            console.error("Gagal mengambil data mapel:", error);
            toast.error("Gagal memuat data mata pelajaran.");
        } finally {
            setIsLoading(false);
        }
    }, [selectedGrade]); // fetchData akan dibuat ulang jika selectedGrade berubah

    useEffect(() => {
        fetchData();
    }, [fetchData]); // useEffect akan berjalan saat pertama kali & saat fetchData berubah

    const handleEdit = (subject: Subject) => {
        setSelectedSubject(subject);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (subjectId: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini? Ini mungkin akan gagal jika masih ada kelas yang menggunakan mapel ini.')) {
            const loadingToast = toast.loading('Menghapus...');
            try {
                const response = await apiClient.delete(`/subjects/${subjectId}`);
                toast.success(response.data.message, { id: loadingToast });
                fetchData();
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Gagal menghapus mapel.', { id: loadingToast });
            }
        }
    };

    return (
        <>
            <AddSubjectModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubjectAdded={fetchData}
            />
            <EditSubjectModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                subject={selectedSubject}
                onSubjectUpdated={fetchData}
            />

            <div className="container mx-auto p-4 md:p-8 ">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Manajemen Mata Pelajaran</h1>
                    <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                        + Tambah Mapel
                    </button>
                </div>

                {/* 3. Tambahkan UI untuk filter */}
                <div className="mb-4 flex justify-end text-gray-800">
                    <div className="w-full md:w-1/4">
                        <label className="block text-sm font-medium mb-1">Filter Berdasarkan Kelas</label>
                        <select
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value)}
                            className="w-full p-2 border border-gray-300 bg-white font-bold rounded-md shadow-sm"
                        >
                            <option value="">Semua Kelas</option>
                            <option value="7">Kelas 7</option>
                            <option value="8">Kelas 8</option>
                            <option value="9">Kelas 9</option>
                        </select>
                    </div>
                </div>

                <div className=" bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-yellow-200 border-b border border-gray-300 font-bold font-large text-gray-600 text-xl">
                                <th className="py-2 px-3 border border-gray-300 ">Nama Mata Pelajaran</th>
                                <th className="py-2 px-3 border border-gray-300">Tingkat Kelas</th>
                                <th className="py-2 px-3 border border-gray-300">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={3} className="py-4 text-center">Memuat data...</td></tr>
                            ) : subjects.length > 0 ? (
                                subjects.map(subject => (
                                    <tr key={subject.id} className="border-b hover:bg-gray-50 text-gray-800">
                                        <td className="py-3 px-3 border border-gray-300 font-medium">{subject.name}</td>
                                        <td className="py-3 px-3 border border-gray-300">Kelas {subject.grade}</td>
                                        <td className="py-3 px-3 border border-gray-300">
                                            <button onClick={() => handleEdit(subject)} className="text-blue-600 hover:underline mr-4">Edit</button>
                                            <button onClick={() => handleDelete(subject.id)} className="text-red-600 hover:underline">Hapus</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={3} className="py-4 text-center text-gray-500">Tidak ada mata pelajaran yang ditemukan.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}