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

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get('/subjects');
            setSubjects(response.data);
        } catch (error) {
            console.error("Gagal mengambil data mapel:", error);
            toast.error("Gagal memuat data mata pelajaran.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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

            <div className="container mx-auto p-4 md:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Manajemen Mata Pelajaran</h1>
                    <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                        + Tambah Mapel
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full text-left text-gray-800">
                        <thead>
                            <tr className="border-b">
                                <th className="py-2 px-3">Nama Mata Pelajaran</th>
                                <th className="py-2 px-3">Tingkat Kelas</th>
                                <th className="py-2 px-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={3} className="py-4 text-center">Memuat data...</td></tr>
                            ) : subjects.map(subject => (
                                <tr key={subject.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-3 font-medium">{subject.name}</td>
                                    <td className="py-3 px-3">Kelas {subject.grade}</td>
                                    <td className="py-3 px-3">
                                        <button onClick={() => handleEdit(subject)} className="text-blue-600 hover:underline mr-4">Edit</button>
                                        <button onClick={() => handleDelete(subject.id)} className="text-red-600 hover:underline">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}