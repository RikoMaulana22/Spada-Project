// Path: client/app/tugas/[id]/submissions/page.tsx (File Baru)
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/axios';
import GradeSubmissionModal from '@/components/dashboard/GradeSubmissionModal';


// Definisikan tipe data
interface Submission {
    id: number;
    submissionDate: string;
    score: number | null;
    student: { fullName: string };
}

export default function SubmissionsPage() {
    const params = useParams();
    const assignmentId = params.id;
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- 2. TAMBAHKAN STATE UNTUK MENGONTROL MODAL ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    const fetchData = useCallback(() => {
        if (!assignmentId) return;
        setIsLoading(true);
        apiClient.get(`/submissions/assignment/${assignmentId}`)
            .then(response => setSubmissions(response.data))
            .catch(error => console.error("Gagal mengambil submissions:", error))
            .finally(() => setIsLoading(false));
    }, [assignmentId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- 3. BUAT FUNGSI UNTUK MEMBUKA MODAL ---
    const handleOpenGradeModal = (submission: Submission) => {
        setSelectedSubmission(submission);
        setIsModalOpen(true);
    };

    if (isLoading) return <div className="p-8 text-center">Memuat data...</div>;

    return (
        <>
            {/* --- 4. RENDER MODAL DI SINI --- */}
            <GradeSubmissionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                submission={selectedSubmission}
                onGradeSuccess={fetchData} // Refresh data setelah berhasil menilai
            />

            <div className="container mx-auto p-8 text-gray-800">
                <h1 className="text-3xl font-bold mb-6">Rekap Pengumpulan Tugas</h1>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="py-2">Nama Siswa</th>
                                <th className="py-2">Tanggal Mengumpulkan</th>
                                <th className="py-2">Nilai</th>
                                <th className="py-2">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.length > 0 ? submissions.map(sub => (
                                <tr key={sub.id} className="border-b">
                                    <td className="py-3">{sub.student.fullName}</td>
                                    <td className="py-3">{new Date(sub.submissionDate).toLocaleString('id-ID')}</td>
                                    <td className="py-3 font-bold text-lg">{sub.score ?? 'Belum Dinilai'}</td>
                                    <td className="py-3">
                                        {/* --- 5. HUBUNGKAN TOMBOL KE FUNGSI HANDLER --- */}
                                        <button 
                                            onClick={() => handleOpenGradeModal(sub)}
                                            className="text-blue-600 hover:underline font-semibold"
                                        >
                                            Beri Nilai
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="text-center py-4 text-gray-500">Belum ada siswa yang mengumpulkan.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}