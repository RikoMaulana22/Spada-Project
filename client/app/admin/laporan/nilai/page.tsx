'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/axios';

// Definisikan tipe data untuk item laporan
interface GradeReportItem {
    className: string;
    teacherName: string;
    assignmentTitle: string;
    totalSubmissions: number;
    totalStudents: number;
    averageScore: number;
}

export default function GradeReportPage() {
    const [reportData, setReportData] = useState<GradeReportItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get('/admin/reports/grades');
            setReportData(response.data);
        } catch (error) {
            console.error("Gagal mengambil laporan nilai:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="container mx-auto p-4 md:p-8 text-gray-800">
            <h1 className="text-3xl font-bold mb-6">Laporan Nilai Rata-Rata per Tugas</h1>

            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b bg-gray-50">
                        <tr className='bg-yellow-200 text-gray-700 border font-bold font-large text-left text-l uppercase'>
                            <th className="py-3 px-4 border border-gray-300">Nama Kelas</th>
                            <th className="py-3 px-4 border border-gray-300">Tugas / Kuis</th>
                            <th className="py-3 px-4 border border-gray-300">Guru</th>
                            <th className="py-3 px-4 border border-gray-300 text-center">Pengumpulan</th>
                            <th className="py-3 px-4 border border-gray-300 text-center">Rata-rata Nilai</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5} className="py-4 text-center">Memuat data laporan...</td></tr>
                        ) : reportData.length > 0 ? reportData.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium">{item.className}</td>
                                <td className="py-3 px-4">{item.assignmentTitle}</td>
                                <td className="py-3 px-4">{item.teacherName}</td>
                                <td className="py-3 px-4 text-center">{item.totalSubmissions} / {item.totalStudents}</td>
                                <td className="py-3 px-4 text-center">
                                    <span className={`px-2.5 py-1.5 rounded-full text-xs font-bold ${item.averageScore >= 75 ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                                        {item.averageScore.toFixed(2)}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="py-4 text-center text-gray-500">Tidak ada data nilai untuk ditampilkan.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}