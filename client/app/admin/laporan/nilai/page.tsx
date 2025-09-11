'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
    
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState('');
    
    const [availableClasses, setAvailableClasses] = useState<string[]>([]);
    const [availableTeachers, setAvailableTeachers] = useState<string[]>([]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // --- PERBAIKAN DI SINI ---
            // Beri tahu TypeScript bahwa kita mengharapkan array GradeReportItem
            const response = await apiClient.get<GradeReportItem[]>('/admin/reports/grades');
            // -------------------------

            setReportData(response.data);

            if (response.data && response.data.length > 0) {
                // Sekarang TypeScript tahu response.data adalah GradeReportItem[], jadi tidak ada error
                const uniqueClasses = [...new Set(response.data.map(item => item.className))];
                const uniqueTeachers = [...new Set(response.data.map(item => item.teacherName))];
                setAvailableClasses(uniqueClasses.sort());
                setAvailableTeachers(uniqueTeachers.sort());
            }

        } catch (error) {
            console.error("Gagal mengambil laporan nilai:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredData = useMemo(() => {
        return reportData.filter(item => {
            const classMatch = selectedClass ? item.className === selectedClass : true;
            const teacherMatch = selectedTeacher ? item.teacherName === selectedTeacher : true;
            return classMatch && teacherMatch;
        });
    }, [reportData, selectedClass, selectedTeacher]);

    const handleResetFilters = () => {
        setSelectedClass('');
        setSelectedTeacher('');
    };

    return (
        <div className="container mx-auto p-4 md:p-8 text-gray-800">
            <h1 className="text-3xl font-bold mb-6">Laporan Nilai Rata-Rata per Tugas</h1>

            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label htmlFor="classFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter Nama Kelas</label>
                        <select
                            id="classFilter"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Semua Kelas</option>
                            {availableClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="teacherFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter Guru</label>
                        <select
                            id="teacherFilter"
                            value={selectedTeacher}
                            onChange={(e) => setSelectedTeacher(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Semua Guru</option>
                            {availableTeachers.map(teacher => <option key={teacher} value={teacher}>{teacher}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-start md:justify-end">
                        <button 
                            onClick={handleResetFilters}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium"
                        >
                            Reset Filter
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b bg-gray-50">
                        <tr className='bg-gray-100 text-gray-600 border font-bold text-left text-xs uppercase'>
                            <th className="py-3 px-4">Nama Kelas</th>
                            <th className="py-3 px-4">Tugas / Kuis</th>
                            <th className="py-3 px-4">Guru</th>
                            <th className="py-3 px-4 text-center">Pengumpulan</th>
                            <th className="py-3 px-4 text-center">Rata-rata Nilai</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5} className="py-8 text-center text-gray-500">Memuat data laporan...</td></tr>
                        ) : filteredData.length > 0 ? filteredData.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
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
                            <tr><td colSpan={5} className="py-8 text-center text-gray-500">
                                {reportData.length > 0 ? 'Tidak ada data yang cocok dengan filter Anda.' : 'Tidak ada data nilai untuk ditampilkan.'}
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}