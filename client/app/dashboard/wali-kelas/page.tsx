'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import ViewTranscriptModal from '@/components/dashboard/ViewTranscriptModal';
import AttendanceDetailModal from '@/components/dashboard/AttendanceDetailModal';
import * as XLSX from 'xlsx';
import Modal from '@/components/ui/Modal';

// --- DEFINISI TIPE DATA ---
interface Student {
    id: number;
    fullName: string;
    nisn: string;
}

interface DailyAttendance {
    id: number;
    date: string;
    status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA';
    studentId: number;
    class?: { subject?: { name: string } };
    notes?: string;
}

interface Grade {
    id: number;
    score: number;
    component: {
        name: string;
        subject: { name: string };
    };
}

interface StudentDetails {
    grades: Grade[];
    dailyAttendances: DailyAttendance[];
}

interface EditStudentDataModalProps {
    student: Student | null;
    onClose: () => void;
    onDataUpdated: () => void;
}

interface AttendanceDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student | null;
    allAttendances: DailyAttendance[];
    className: string; // Menambahkan prop yang hilang
}

// --- KOMPONEN MODAL EDIT (SUDAH DIPERBAIKI) ---
const EditStudentDataModal = ({ student, onClose, onDataUpdated }: EditStudentDataModalProps) => {
    const [details, setDetails] = useState<StudentDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState<string>('');

    const fetchDetails = useCallback(async () => {
        if (!student) return;
        setIsLoading(true);
        try {
            const res = await apiClient.get(`/homeroom/student/${student.id}`);
            setDetails(res.data);
        } catch (error) {
            toast.error("Gagal memuat detail siswa.");
            onClose();
        } finally {
            setIsLoading(false);
        }
    }, [student, onClose]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const availableSubjects = useMemo(() => {
        if (!details?.grades) return [];
        return [...new Set(details.grades.map(g => g.component.subject.name))].sort();
    }, [details]);

    const filteredGrades = useMemo(() => {
        if (!details?.grades) return [];
        if (!selectedSubject) return details.grades;
        return details.grades.filter(g => g.component.subject.name === selectedSubject);
    }, [details, selectedSubject]);

    const handleGradeChange = async (gradeId: number, newScore: string) => {
        const scoreValue = parseFloat(newScore);
        if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
            toast.error("Nilai harus berupa angka antara 0 dan 100.");
            return;
        }
        try {
            await apiClient.put(`/homeroom/grades/${gradeId}`, { score: scoreValue });
            toast.success("Nilai berhasil diperbarui!");
            fetchDetails();
            onDataUpdated();
        } catch (error) {
            toast.error("Gagal memperbarui nilai.");
        }
    };

    const handleAttendanceChange = async (attendanceId: number, newStatus: string) => {
        try {
            await apiClient.put(`/homeroom/attendance/${attendanceId}`, { status: newStatus });
            toast.success("Absensi berhasil diperbarui!");
            fetchDetails();
            onDataUpdated();
        } catch (error) {
            toast.error("Gagal memperbarui absensi.");
        }
    };

    if (!student) return null;

    return (
        <Modal
            isOpen={!!student}
            onClose={onClose}
            title={`Kelola Data Siswa: ${student.fullName}`}
            isFullScreen={true}
        >
            <div className="flex flex-col h-full bg-gray-50">
                {isLoading ? (
                    <div className="flex-grow flex items-center justify-center">
                        <p>Memuat detail...</p>
                    </div>
                ) : (
                    <div className="flex-grow overflow-y-auto p-6 space-y-8 text-gray-800">
                        {/* Bagian Perbarui Nilai */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-lg mb-4 text-gray-800">Perbarui Nilai</h3>
                            <div className="mb-4">
                                <label htmlFor="subject-filter" className="block text-sm font-medium text-gray-700 ">
                                    Filter Mata Pelajaran
                                </label>
                                <select
                                    id="subject-filter"
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="mt-1 block w-full md:w-1/3 py-4 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    <option value="">Semua Mata Pelajaran</option>
                                    {availableSubjects.map(subject => (
                                        <option key={subject} value={subject}>{subject}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                {filteredGrades && filteredGrades.length > 0 ? (
                                    filteredGrades.map(grade => (
                                        <div key={grade.id} className="grid grid-cols-3 items-center gap-2 p-2 bg-gray-50 rounded py-2">
                                            <span className="col-span-2 text-sm">{grade.component.subject.name} - {grade.component.name}</span>
                                            <input
                                                type="number"
                                                defaultValue={grade.score}
                                                onBlur={(e) => handleGradeChange(grade.id, e.target.value)}
                                                className="form-input w-full text-center py-2 px-3 border border-gray-300 rounded"
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        {details?.grades.length === 0 ? "Belum ada nilai." : "Tidak ada nilai untuk mata pelajaran ini."}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Bagian Absensi */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-lg mb-4 text-gray-800">Perbarui Absensi Harian</h3>
                            <div className="space-y-2">
                                {details?.dailyAttendances.map(att => (
                                    <div key={att.id} className="grid grid-cols-1 md:grid-cols-3 items-center gap-2 p-2 bg-gray-50 rounded py-2">
                                        <span className="md:col-span-2 text-sm">
                                            {new Date(att.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                        <select
                                            defaultValue={att.status}
                                            onChange={(e) => handleAttendanceChange(att.id, e.target.value)}
                                            className="form-select w-full py-2 px-3 border border-gray-300 rounded"
                                        >
                                            <option value="HADIR">Hadir</option>
                                            <option value="SAKIT">Sakit</option>
                                            <option value="IZIN">Izin</option>
                                            <option value="ALPA">Alpa</option>
                                        </select>
                                    </div>
                                ))}
                                {details?.dailyAttendances.length === 0 && <p className="text-sm text-gray-500">Belum ada catatan absensi.</p>}
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex-shrink-0 flex justify-end p-4 border-t bg-white">
                    <button onClick={onClose} className="btn-secondary">Tutup</button>
                </div>
            </div>
        </Modal>
    );
};


// --- KOMPONEN UTAMA HALAMAN ---
export default function HomeroomDashboardPage() {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('manage');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isAttendanceDetailModalOpen, setIsAttendanceDetailModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const [noteContent, setNoteContent] = useState('');
    const [selectedStudentIdForNote, setSelectedStudentIdForNote] = useState<string>('');

    const fetchData = useCallback(async () => {
        // Tidak perlu setIsLoading(true) di sini karena sudah diatur di luar
        try {
            const response = await apiClient.get('/homeroom/dashboard');
            setDashboardData(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal memuat data.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setIsLoading(true);
        fetchData();
    }, [fetchData]);

    const students: Student[] = useMemo(() =>
        dashboardData?.members?.map((member: any) => member.user) || [],
        [dashboardData]
    );

    const attendanceRecap = useMemo(() => {
        if (!dashboardData?.dailyAttendances) return {};
        const recap: Record<number, { HADIR: number, SAKIT: number, IZIN: number, ALPA: number }> = {};
        students.forEach(student => {
            recap[student.id] = { HADIR: 0, SAKIT: 0, IZIN: 0, ALPA: 0 };
        });
        dashboardData.dailyAttendances.forEach((rec: { studentId: number; status: keyof typeof recap[number] }) => {
            if (recap[rec.studentId] && rec.status in recap[rec.studentId]) {
                recap[rec.studentId][rec.status]++;
            }
        });
        return recap;
    }, [dashboardData, students]);


    // --- FUNGSI-FUNGSI HELPER ---
    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteContent.trim() || !selectedStudentIdForNote) {
            toast.error("Siswa dan isi catatan tidak boleh kosong.");
            return;
        }
        try {
            await apiClient.post('/homeroom/notes', {
                studentId: parseInt(selectedStudentIdForNote, 10),
                content: noteContent
            });
            toast.success("Catatan berhasil ditambahkan!");
            setNoteContent('');
            setSelectedStudentIdForNote('');
            fetchData();
        } catch (error) {
            toast.error("Gagal menambahkan catatan.");
        }
    };

    const handleExportGradesToExcel = async (student: Student) => {
        const toastId = toast.loading('Mempersiapkan data nilai...');
        try {
            const response = await apiClient.get<StudentDetails>(`/homeroom/student/${student.id}`);
            const details = response.data;
            if (!details.grades || details.grades.length === 0) {
                toast.error('Siswa ini belum memiliki data nilai untuk diekspor.', { id: toastId });
                return;
            }
            const dataForSheet = details.grades.map(grade => ({
                'Mata Pelajaran': grade.component.subject.name,
                'Komponen Nilai': grade.component.name,
                'Nilai': grade.score,
            }));
            const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Transkrip Nilai");
            worksheet['!cols'] = [{ wch: 30 }, { wch: 40 }, { wch: 10 }];
            const fileName = `Nilai_${student.fullName.replace(/ /g, '_')}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            toast.success('File Excel berhasil dibuat!', { id: toastId });
        } catch (error) {
            toast.error('Gagal mengambil data nilai untuk diekspor.', { id: toastId });
            console.error("Export Error:", error);
        }
    };
    
    const handleExportToExcel = (student: Student, allAttendances: DailyAttendance[] = []) => {
        if (!allAttendances || !Array.isArray(allAttendances) || allAttendances.length === 0) {
            toast.error("Data absensi tidak tersedia untuk diekspor.");
            return;
        }
        const studentAttendances = allAttendances.filter(att => att.studentId === student.id);
        if (studentAttendances.length === 0) {
            toast.error("Siswa ini belum memiliki data absensi.");
            return;
        }
        const dataForSheet = studentAttendances.map(att => ({
            'Tanggal': new Date(att.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
            'Mata Pelajaran': att.class?.subject?.name || 'Harian',
            'Status': att.status,
            'Keterangan': att.notes || '-',
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Absensi");
        worksheet['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 10 }, { wch: 40 }];
        const fileName = `Absensi_${student.fullName.replace(/ /g, '_')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    // --- FUNGSI BUKA MODAL ---
    const openEditModal = (student: Student) => {
        setSelectedStudent(student);
        setIsEditModalOpen(true);
    };
    const openViewModal = (student: Student) => {
        setSelectedStudent(student);
        setIsViewModalOpen(true);
    };
    const openAttendanceDetailModal = (student: Student) => {
        setSelectedStudent(student);
        setIsAttendanceDetailModalOpen(true);
    };

    if (isLoading) return <div className="p-8 text-center">Memuat Dashboard...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <>
            {isEditModalOpen && <EditStudentDataModal student={selectedStudent} onClose={() => setIsEditModalOpen(false)} onDataUpdated={fetchData} />}
            {isViewModalOpen && <ViewTranscriptModal student={selectedStudent} className={dashboardData.name} onClose={() => setIsViewModalOpen(false)} />}
            <AttendanceDetailModal
                isOpen={isAttendanceDetailModalOpen}
                onClose={() => setIsAttendanceDetailModalOpen(false)}
                student={selectedStudent}
                allAttendances={dashboardData?.dailyAttendances || []}
                className={dashboardData?.name || ''}
            />

            <div className="container mx-auto p-4 md:p-8 text-gray-800">
                <h1 className="text-3xl font-bold">Dashboard Wali Kelas</h1>
                <h2 className="text-xl text-gray-600 mb-6">Kelas: {dashboardData.name}</h2>

                <div className="border-b">
                    <nav className="-mb-px flex space-x-8">
                        <button onClick={() => setActiveTab('manage')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'manage' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Kelola Siswa & Catatan</button>
                        <button onClick={() => setActiveTab('attendance')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'attendance' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Rekap Absensi</button>
                        <button onClick={() => setActiveTab('grades')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'grades' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Transkrip Nilai</button>
                    </nav>
                </div>

                <div className="mt-6">
                    {/* TAB KELOLA SISWA */}
                    {activeTab === 'manage' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 text-gray-800 gap-6">
                            <div className="md:col-span-1">
                                <h3 className="text-lg font-semibold mb-2">Tambah Catatan Baru</h3>
                                <form onSubmit={handleAddNote} className="space-y-4 p-4 bg-white rounded-lg shadow">
                                    <div>
                                        <label className="block text-sm font-medium">Pilih Siswa</label>
                                        <select value={selectedStudentIdForNote} onChange={(e) => setSelectedStudentIdForNote(e.target.value)} className="form-select mt-1 w-full py-2 px-3 border border-gray-300 rounded" required>
                                            <option value="">-- Pilih Siswa --</option>
                                            {students.map((student) => <option key={student.id} value={student.id}>{student.fullName}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Isi Catatan</label>
                                        <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} rows={5} className="form-textarea w-full mt-1" placeholder={`Tulis catatan...`}></textarea>
                                    </div>
                                    <button type="submit" className="btn-primary w-full">Simpan Catatan</button>
                                </form>
                            </div>
                            <div className="md:col-span-2 bg-white p-4 rounded-lg shadow">
                                <h3 className="font-semibold mb-2">Daftar Siswa</h3>
                                <p className="text-sm text-gray-600 mb-4">Pilih siswa untuk mengedit nilai & absensi.</p>
                                <div className="overflow-x-auto max-h-96">
                                    <table className="min-w-full divide-y">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Nama Siswa</th>
                                                <th className="px-6 py-3 text-center text-xs font-medium uppercase">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {students.map((student) => (
                                                <tr key={student.id}>
                                                    <td className="px-6 py-4 font-medium">{student.fullName}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button onClick={() => openEditModal(student)} className="btn-primary text-sm">
                                                            Kelola Data
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB REKAP ABSENSI */}
                    {activeTab === 'attendance' && (
                        <div className="bg-white p-4 rounded-lg text-gray-800 shadow">
                            <h3 className="text-lg font-semibold mb-4">Rekapitulasi Absensi Harian</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Nama Siswa</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium uppercase text-green-600">Hadir</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium uppercase text-yellow-600">Sakit</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium uppercase text-blue-600">Izin</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium uppercase text-red-600">Alpa</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium uppercase">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {students.map((student) => (
                                            <tr key={student.id}>
                                                <td className="px-6 py-4 font-medium">{student.fullName}</td>
                                                <td className="px-6 py-4 text-center font-semibold">{attendanceRecap[student.id]?.HADIR || 0}</td>
                                                <td className="px-6 py-4 text-center font-semibold">{attendanceRecap[student.id]?.SAKIT || 0}</td>
                                                <td className="px-6 py-4 text-center font-semibold">{attendanceRecap[student.id]?.IZIN || 0}</td>
                                                <td className="px-6 py-4 text-center font-semibold">{attendanceRecap[student.id]?.ALPA || 0}</td>
                                                <td className="px-6 py-4 text-center space-x-4">
                                                    <button onClick={() => openAttendanceDetailModal(student)} className="text-blue-600 hover:underline font-semibold text-sm">
                                                        View
                                                    </button>
                                                    <button onClick={() => handleExportToExcel(student, dashboardData?.dailyAttendances || [])} className="text-green-600 hover:underline font-semibold text-sm">
                                                        Ekspor
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB TRANSKRIP NILAI */}
                    {activeTab === 'grades' && (
                         <div className="bg-white p-4 rounded-lg shadow text-gray-800">
                            <h3 className="text-lg font-semibold mb-4">Cetak Transkrip Nilai Siswa</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Nama Siswa</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">NISN</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium uppercase">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {students.map((student) => (
                                            <tr key={student.id}>
                                                <td className="px-6 py-4 font-medium">{student.fullName}</td>
                                                <td className="px-6 py-4 text-gray-500">{student.nisn || 'N/A'}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-x-4">
                                                        <button onClick={() => openViewModal(student)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm">
                                                            View
                                                        </button>
                                                        <button onClick={() => handleExportGradesToExcel(student)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm">
                                                            Ekspor
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}