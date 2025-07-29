'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';

// Definisikan tipe data
interface Student { id: number; fullName: string; nisn?: string; }
interface EnrolledMember { user: Student; }
interface EnrollmentData {
    classDetails: { id: number; name: string; members: EnrolledMember[]; };
    availableStudents: Student[];
}

export default function EnrollManagementPage() {
    const params = useParams();
    const classId = params.id;
    const [data, setData] = useState<EnrollmentData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');

    const fetchData = useCallback(async () => {
        if (!classId) return;
        try {
            const response = await apiClient.get(`/admin/classes/${classId}/enrollments`);
            setData(response.data);
        } catch (error) {
            toast.error("Gagal memuat data.");
        } finally {
            setIsLoading(false);
        }
    }, [classId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEnroll = async () => {
        if (!selectedStudentId) {
            toast.error("Pilih siswa terlebih dahulu.");
            return;
        }
        try {
            await apiClient.post(`/admin/classes/${classId}/enrollments`, { studentId: selectedStudentId });
            toast.success("Siswa berhasil didaftarkan!");
            setSelectedStudentId('');
            fetchData(); // Muat ulang data
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal mendaftarkan siswa.");
        }
    };

    const handleUnenroll = async (studentId: number) => {
        if (window.confirm("Apakah Anda yakin ingin mengeluarkan siswa ini dari kelas?")) {
            try {
                await apiClient.delete(`/admin/classes/${classId}/enrollments/${studentId}`);
                toast.success("Siswa berhasil dikeluarkan!");
                fetchData(); // Muat ulang data
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Gagal mengeluarkan siswa.");
            }
        }
    };

    if (isLoading) return <div className="p-8 text-center">Memuat...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Gagal memuat data kelas.</div>;

    const enrolledStudents = data.classDetails.members.map(m => m.user);

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold">Kelola Pendaftaran Siswa</h1>
            <h2 className="text-xl text-gray-600 mb-6">Kelas: {data.classDetails.name}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Kolom untuk mendaftarkan siswa baru */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Daftarkan Siswa ke Kelas</h3>
                    <div className="flex gap-2">
                        <select
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                            className="form-select w-full"
                        >
                            <option value="">-- Pilih dari siswa yang tersedia --</option>
                            {data.availableStudents.map(student => (
                                <option key={student.id} value={student.id}>{student.fullName}</option>
                            ))}
                        </select>
                        <button onClick={handleEnroll} className="btn-primary whitespace-nowrap">Daftarkan</button>
                    </div>
                </div>

                {/* Kolom untuk melihat siswa yang sudah terdaftar */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Siswa Terdaftar ({enrolledStudents.length})</h3>
                    <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                        {enrolledStudents.map(student => (
                            <li key={student.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{student.fullName}</p>
                                    <p className="text-sm text-gray-500">NISN: {student.nisn || 'N/A'}</p>
                                </div>
                                <button onClick={() => handleUnenroll(student.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">
                                    Keluarkan
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}