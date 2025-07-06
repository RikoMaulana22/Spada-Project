'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/axios';

// Definisikan tipe data untuk Subject
interface Subject {
    id: number;
    name: string;
    grade: number;
}

// TODO: Buat komponen modal ini di file terpisah
// import AddSubjectModal from '@/components/admin/AddSubjectModal';
// import EditSubjectModal from '@/components/admin/EditSubjectModal';

export default function ManageSubjectsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get('/subjects');
            setSubjects(response.data);
        } catch (error) {
            console.error("Gagal mengambil data mapel:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async (subjectId: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) {
            try {
                const response = await apiClient.delete(`/subjects/${subjectId}`);
                alert(response.data.message);
                fetchData(); // Refresh data
            } catch (error: any) {
                alert(error.response?.data?.message || 'Gagal menghapus mapel.');
                console.error(error);
            }
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Manajemen Mata Pelajaran</h1>
                <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                    + Tambah Mapel
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <table className="w-full text-left text-gray-800">
                    <thead>
                        <tr className="border-b">
                            <th className="py-2">Nama Mata Pelajaran</th>
                            <th className="py-2">Tingkat Kelas</th>
                            <th className="py-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={3} className="py-4 text-center">Memuat data...</td></tr>
                        ) : subjects.map(subject => (
                            <tr key={subject.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 font-medium">{subject.name}</td>
                                <td className="py-3">Kelas {subject.grade}</td>
                                <td className="py-3">
                                    <button className="text-blue-600 hover:underline mr-4">Edit</button>
                                    <button onClick={() => handleDelete(subject.id)} className="text-red-600 hover:underline">Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}