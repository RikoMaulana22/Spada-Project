// Path: client/app/tugas/[id]/submissions/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation'; // <-- Import useRouter
import apiClient from '@/lib/axios';
import GradeSubmissionModal from '@/components/dashboard/GradeSubmissionModal';
import { FaArrowLeft, FaEdit } from 'react-icons/fa'; // <-- Import ikon

// --- PERBAIKAN 1: Definisikan tipe data yang lebih lengkap ---
interface Submission {
    id: number;
    submissionDate: string;
    score: number | null;
    student: { fullName: string };
}

interface AssignmentWithSubmissions {
    id: number;
    title: string;
    submissions: Submission[];
}

export default function SubmissionsPage() {
    const params = useParams();
    const router = useRouter(); // <-- Inisialisasi useRouter untuk navigasi
    const assignmentId = params.id;

    // --- PERBAIKAN 2: Gunakan state tunggal untuk data yang lebih lengkap ---
    const [data, setData] = useState<AssignmentWithSubmissions | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    const fetchData = useCallback(() => {
        if (!assignmentId) return;
        setIsLoading(true);

        // --- PERBAIKAN 3: Panggil endpoint yang sudah kita perbaiki di controller ---
        apiClient.get(`/assignments/${assignmentId}/submissions`)
            .then(response => setData(response.data))
            .catch(error => console.error("Gagal mengambil submissions:", error))
            .finally(() => setIsLoading(false));
    }, [assignmentId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenGradeModal = (submission: Submission) => {
        setSelectedSubmission(submission);
        setIsModalOpen(true);
    };

    if (isLoading) return <div className="p-8 text-center">Memuat data...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Gagal memuat data atau tugas tidak ditemukan.</div>

    return (
        <>
            <GradeSubmissionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                submission={selectedSubmission}
                onGradeSuccess={fetchData}
            />

            <div className="container mx-auto p-4 md:p-8 text-gray-800 space-y-6">
                {/* Tombol kembali untuk navigasi yang lebih baik */}
                <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-blue-600 hover:underline font-semibold">
                    <FaArrowLeft />
                    Kembali
                </button>

                {/* --- PERBAIKAN 4: Tampilkan judul tugas secara dinamis --- */}
                <h1 className="text-2xl md:text-3xl font-bold">
                    Rekap Pengumpulan: <span className="text-blue-700">{data.title}</span>
                </h1>

                <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="p-3 font-medium uppercase text-sm text-gray-600">Nama Siswa</th>
                                <th className="p-3 font-medium uppercase text-sm text-gray-600">Tanggal Mengumpulkan</th>
                                <th className="p-3 font-medium uppercase text-sm text-gray-600">Nilai</th>
                                <th className="p-3 font-medium uppercase text-sm text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* --- PERBAIKAN 5: Baca submissions dari state 'data' --- */}
                            {data.submissions.length > 0 ? data.submissions.map(sub => (
                                <tr key={sub.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-medium">{sub.student.fullName}</td>
                                    <td className="p-3 text-sm">{new Date(sub.submissionDate).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</td>
                                    <td className="p-3">
                                        {sub.score !== null ? (
                                            <span className={`px-3 py-1 text-sm font-bold rounded-full ${sub.score >= 75 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {sub.score}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-500 italic">Belum Dinilai</span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => handleOpenGradeModal(sub)}
                                            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2 text-sm"
                                        >
                                            <FaEdit />
                                            <span>{sub.score !== null ? 'Ubah Nilai' : 'Beri Nilai'}</span>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="text-center py-8 text-gray-500">Belum ada siswa yang mengumpulkan.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}