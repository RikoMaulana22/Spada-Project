"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

//=========================================================
// 1. Tipe Data (Interface) yang Sudah Diperbaiki
//=========================================================
interface Student {
    id: number;
    fullName: string;
    nisn?: string;
}

interface Teacher {
    id: number;
    fullName: string;
}

interface EnrolledMember {
    user: Student;
}

// Tipe EnrollmentData yang digabung menjadi satu
interface EnrollmentData {
    classDetails: {
        id: number;
        name: string;
        members: EnrolledMember[];
        homeroomTeacher: Teacher | null; // Wali kelas bisa null
    };
    availableStudents: Student[];
    availableTeachers: Teacher[];
}

//=========================================================
// Komponen React
//=========================================================
export default function EnrollManagementPage() {
    const params = useParams();
    const classId = params.id;

    // State untuk data dan UI
    const [data, setData] = useState<EnrollmentData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');

    // Fungsi untuk mengambil semua data dari server
    const fetchData = useCallback(async () => {
        if (!classId) return;
        // Set loading hanya pada fetch pertama
        if (!data) setIsLoading(true);
        try {
            const response = await apiClient.get(`/admin/classes/${classId}/enrollments`);
            setData(response.data);
        } catch (error) {
            toast.error("Gagal memuat data.");
        } finally {
            setIsLoading(false);
        }
    }, [classId, data]);

    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classId]); // Dijalankan hanya ketika classId berubah

    // Handler untuk mendaftarkan siswa
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

    // Handler untuk mengeluarkan siswa
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

    // Handler untuk menetapkan wali kelas
    const handleSetHomeroomTeacher = async () => {
        if (!selectedTeacherId) {
            toast.error("Pilih guru terlebih dahulu.");
            return;
        }
        try {
            await apiClient.put(`/admin/classes/${classId}/homeroom`, { teacherId: selectedTeacherId });
            toast.success("Wali kelas berhasil ditetapkan!");
            fetchData(); // Muat ulang data untuk menampilkan wali kelas baru
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal menetapkan wali kelas.");
        }
    };

    if (isLoading) return <div className="p-8 text-center">Memuat...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Gagal memuat data kelas.</div>;

    const enrolledStudents = data.classDetails.members.map(m => m.user);
    const currentHomeroomTeacher = data.classDetails.homeroomTeacher;

    return (
        <div className="container mx-auto p-4 md:p-8 text-gray-800">
            {/* Header Halaman */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/kelas" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                    <FaArrowLeft size={20} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Kelola Pendaftaran & Wali Kelas</h1>
                    <h2 className="text-xl text-gray-600">Kelas: {data.classDetails.name}</h2>
                </div>
            </div>

            {/* Bagian untuk Kelola Wali Kelas */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Wali Kelas</h3>
                <div className="mb-4">
                    <p className="font-medium">Wali Kelas Saat Ini:</p>
                    <p className="text-blue-600 font-semibold text-lg">
                        {currentHomeroomTeacher ? currentHomeroomTeacher.fullName : 'Belum Ditetapkan'}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pilih Wali Kelas Baru:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <select
                            value={selectedTeacherId}
                            onChange={(e) => setSelectedTeacherId(e.target.value)}
                            className="form-select w-full"
                        >
                            <option value="">-- Pilih dari wali kelas yang tersedia --</option>
                            {data.availableTeachers?.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>
                            ))}
                        </select>
                        <button onClick={handleSetHomeroomTeacher} className="btn-primary whitespace-nowrap">
                            Jadikan Wali Kelas
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid untuk Kelola Pendaftaran Siswa */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Kolom untuk mendaftarkan siswa baru */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Daftarkan Siswa ke Kelas</h3>
                    <div className="flex flex-col sm:flex-row gap-2">
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
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Siswa Terdaftar ({enrolledStudents.length})</h3>
                    <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto pr-2">
                        {enrolledStudents.length > 0 ? enrolledStudents.map(student => (
                            <li key={student.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{student.fullName}</p>
                                    <p className="text-sm text-gray-500">NISN: {student.nisn || 'N/A'}</p>
                                </div>
                                <button onClick={() => handleUnenroll(student.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">
                                    Keluarkan
                                </button>
                            </li>
                        )) : (
                            <p className="text-gray-500 text-center py-4">Belum ada siswa yang terdaftar.</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}