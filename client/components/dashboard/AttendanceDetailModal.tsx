// Path: src/components/dashboard/AttendanceDetailModal.tsx
'use client';

import React, { useMemo } from 'react';

// Definisikan tipe data yang lebih lengkap
interface Student {
    id: number;
    fullName: string;
}
interface DailyAttendance {
    id: number;
    date: string;
    status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA';
    studentId: number;
    class: {
        subject: {
            name: string;
        }
    }
}
interface AttendanceDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student | null;
    allAttendances: DailyAttendance[]; 
    className: string; // Tambahkan prop untuk nama kelas
}

const AttendanceDetailModal = ({ isOpen, onClose, student, allAttendances, className }: AttendanceDetailModalProps) => {
    if (!isOpen || !student) return null;

    // --- LOGIKA UTAMA: Mengubah data absensi menjadi format Grid ---
    const { gridData, subjects, maxMeetings } = useMemo(() => {
        if (!allAttendances) {
            return { gridData: {}, subjects: [], maxMeetings: 8 };
        }

        const studentAttendances = allAttendances.filter(att => att.studentId === student.id);
        
        // 1. Kelompokkan absensi per mata pelajaran
        const groupedBySubject: Record<string, DailyAttendance[]> = {};
        studentAttendances.forEach(att => {
            const subjectName = att.class.subject.name;
            if (!groupedBySubject[subjectName]) {
                groupedBySubject[subjectName] = [];
            }
            groupedBySubject[subjectName].push(att);
        });

        // 2. Ubah menjadi format grid { [subject]: { [meeting_number]: status } }
        const grid: Record<string, Record<number, string>> = {};
        let maxMeetings = 0;
        const subjectKeys = Object.keys(groupedBySubject).sort();

        subjectKeys.forEach(subject => {
            grid[subject] = {};
            // Urutkan absensi berdasarkan tanggal untuk menentukan urutan "Pertemuan"
            const sortedAttendances = groupedBySubject[subject].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            sortedAttendances.forEach((att, index) => {
                const meetingNumber = index + 1; // Pertemuan 1, 2, 3, dst.
                grid[subject][meetingNumber] = att.status;
            });
            
            // Lacak jumlah pertemuan terbanyak untuk menentukan jumlah kolom
            if (sortedAttendances.length > maxMeetings) {
                maxMeetings = sortedAttendances.length;
            }
        });
        
        // Pastikan minimal ada 8 kolom seperti di contoh gambar
        if (maxMeetings < 8) maxMeetings = 8;

        return { gridData: grid, subjects: subjectKeys, maxMeetings };
    }, [allAttendances, student.id]);

    // Fungsi untuk styling sel berdasarkan status
    const getStatusColor = (status: string) => {
        switch(status) {
            case 'HADIR': return 'bg-green-100 text-green-800';
            case 'SAKIT': return 'bg-yellow-100 text-yellow-800';
            case 'IZIN': return 'bg-blue-100 text-blue-800';
            case 'ALPA': return 'bg-red-100 text-red-800';
            default: return 'bg-white';
        }
    }

    return (
        <div className="fixed inset-0 bg-black text-gray-600 bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex-grow overflow-auto">
                    {/* Header Nama dan Kelas */}
                    <div className="mb-4">
                        <table className="w-full">
                            <tbody>
                                <tr>
                                    <td className="font-semibold p-1 w-28">Nama</td>
                                    <td className="p-1">{student.fullName}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold p-1 w-28">Kelas</td>
                                    <td className="p-1">{className}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Tabel Grid Absensi */}
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-yellow-400 text-black">
                                <tr>
                                    <th className="p-2 border" rowSpan={2}>Mata Pelajaran</th>
                                    <th className="p-2 border" colSpan={maxMeetings}>Pertemuan</th>
                                </tr>
                                <tr>
                                    {/* Membuat kolom nomor pertemuan secara dinamis */}
                                    {Array.from({ length: maxMeetings }, (_, i) => i + 1).map(num => (
                                        <th key={num} className="p-2 border font-medium w-16">{num}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {subjects.length > 0 ? subjects.map(subject => (
                                    <tr key={subject} className="border-t">
                                        <td className="p-2 border font-semibold bg-yellow-100">{subject}</td>
                                        {/* Membuat sel nilai absensi secara dinamis */}
                                        {Array.from({ length: maxMeetings }, (_, i) => i + 1).map(num => (
                                            <td key={`${subject}-${num}`} className={`p-2 border text-center text-xs ${getStatusColor(gridData[subject]?.[num])}`}>
                                                {gridData[subject]?.[num] || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={maxMeetings + 1} className="p-8 text-center text-gray-500">
                                            Belum ada data absensi untuk siswa ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Legend */}
                    <div className="mt-4 flex justify-start">
                        <table className="text-xs border-collapse">
                            <tbody>
                                <tr><td className="p-1 font-semibold">Hadir</td></tr>
                                <tr><td className="p-1 font-semibold">Sakit</td></tr>
                                <tr><td className="p-1 font-semibold">Izin</td></tr>
                                <tr><td className="p-1 font-semibold">Alfa</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t mt-4">
                    <button onClick={onClose} className="btn-secondary">Tutup</button>
                </div>
            </div>
        </div>
    );
};

export default AttendanceDetailModal;