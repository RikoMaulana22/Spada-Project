'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ViewTranscriptModal from '@/components/dashboard/ViewTranscriptModal';
import AttendanceDetailModal from '@/components/dashboard/AttendanceDetailModal';

// Modal untuk detail absensi harian siswa
interface AttendanceDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student | null;
    allAttendances: DailyAttendance[];
}




// Definisikan tipe data
interface Student { id: number; fullName: string; nisn: string; }
interface Note { id: number; content: string; student: { fullName: string }; createdAt: string; }
interface DailyAttendance { id: number; date: string; status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA'; }
interface Grade { id: number; score: number; studentId: number; component: { name: string; subject: { name: string } }; }
interface StudentDetails { grades: Grade[]; dailyAttendances: DailyAttendance[]; }
interface GradeComponent { id: number; name: string; subject: { name: string }; grades: Grade[]; }
interface EditStudentDataModalProps {
    student: Student | null;
    onClose: () => void;
    onDataUpdated: () => void;
}

// Komponen Modal terpisah untuk mengedit data siswa
const EditStudentDataModal = ({ student, onClose, onDataUpdated }: EditStudentDataModalProps) => {
    const [details, setDetails] = useState<StudentDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
    }, [student]);

    useEffect(() => { fetchDetails(); }, [fetchDetails]);

    const handleGradeChange = async (gradeId: number, newScore: string) => {
    const scoreValue = parseFloat(newScore);
    if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
        toast.error("Nilai harus berupa angka antara 0 dan 100.");
        return;
    }

    try {
        await apiClient.put(`/homeroom/grades/${gradeId}`, { score: scoreValue });
        toast.success("Nilai berhasil diperbarui!");
        fetchDetails(); // Memuat ulang detail di dalam modal
        onDataUpdated(); // Memuat ulang data utama di dashboard
    } catch (error) {
        toast.error("Gagal memperbarui nilai.");
    }
};

const handleAttendanceChange = async (attendanceId: number, newStatus: string) => {
     try {
        await apiClient.put(`/homeroom/attendance/${attendanceId}`, { status: newStatus });
        toast.success("Absensi berhasil diperbarui!");
        fetchDetails(); // Memuat ulang detail di dalam modal
        onDataUpdated(); // Memuat ulang data utama di dashboard
    } catch (error) {
        toast.error("Gagal memperbarui absensi.");
    }
};

    if (!student) return null;

    async function handleDeleteAttendance(id: number): Promise<void> {
        if (!window.confirm('Apakah Anda yakin ingin menghapus catatan absensi ini?')) return;
        try {
            await apiClient.delete(`/homeroom/attendance/${id}`);
            toast.success('Catatan absensi berhasil dihapus.');
            fetchDetails(); // Refresh detail data in modal
            onDataUpdated(); // Refresh main dashboard data
        } catch (error) {
            toast.error('Gagal menghapus catatan absensi.');
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex text-gray-600 justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <h2 className="text-xl font-bold mb-4">Kelola Data: {student.fullName}</h2>
                {isLoading ? <p>Memuat detail...</p> : (
                    <div className="flex-grow overflow-y-auto pr-2 space-y-6">
    {/* Bagian Nilai */}
    <div>
        <h3 className="font-semibold text-lg mb-2">Perbarui Nilai</h3>
        <div className="space-y-2">
            {details?.grades.map(grade => (
                <div key={grade.id} className="grid grid-cols-3 items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="col-span-2 text-sm">{grade.component.subject.name} - {grade.component.name}</span>
                    <input 
                        type="number" 
                        defaultValue={grade.score} 
                        onBlur={(e) => handleGradeChange(grade.id, e.target.value)} 
                        className="form-input w-full text-center" 
                    />
                </div>
            ))}
            {details?.grades.length === 0 && <p className="text-sm text-gray-500">Belum ada nilai.</p>}
        </div>
    </div>
    {/* Bagian Absensi */}
    <div>
        <h3 className="font-semibold text-lg mb-2">Perbarui Absensi Harian</h3>
         <div className="space-y-2">
            {details?.dailyAttendances.map(att => (
                <div key={att.id} className="grid grid-cols-3 items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="col-span-2 text-sm">
                        {new Date(att.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <select 
                        defaultValue={att.status} 
                        onChange={(e) => handleAttendanceChange(att.id, e.target.value)} 
                        className="form-select w-full"
                    >
                        <option value="HADIR">Hadir</option>
                        <option value="SAKIT">Sakit</option>
                        <option value="IZIN">Izin</option>
                        <option value="ALPA">Alpa</option>
                    </select>
                    <button
                     onClick={() => handleDeleteAttendance(att.id)}
                     className="text-red-600 hover:underline text-sm font-semibold"
                     >
                     Hapus
                     </button>
                </div>
            ))}
            {details?.dailyAttendances.length === 0 && <p className="text-sm text-gray-500">Belum ada catatan absensi.</p>}
        </div>
    </div>
</div>
                )}
                <div className="flex justify-end pt-4 border-t mt-4">
                    <button onClick={onClose} className="btn-secondary">Tutup</button>
                </div>
            </div>
        </div>
    );
};

// Fungsi untuk generate PDF
const generateTranscriptPDF = (student: Student, components: GradeComponent[], className: string) => { /* ... (kode generateTranscriptPDF) ... */ };

export default function HomeroomDashboardPage() {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('manage');
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [noteContent, setNoteContent] = useState('');
    const [selectedStudentIdForNote, setSelectedStudentIdForNote] = useState<string>('');
    const [isAttendanceDetailModalOpen, setIsAttendanceDetailModalOpen] = useState(false);

const openAttendanceDetailModal = (student: Student) => {
        setSelectedStudent(student);
        setIsAttendanceDetailModalOpen(true);
    };

    // --- HOOKS useMemo DIPINDAHKAN KE ATAS ---
    const students: Student[] = useMemo(() => 
        dashboardData?.members.map((member: any) => member.user) || [],
        [dashboardData]
    );

    const attendanceRecap = useMemo(() => {
    if (!dashboardData || !Array.isArray(dashboardData.dailyAttendances)) {
        return {}; // Jika data belum ada atau bukan array, kembalikan objek kosong
    }

    const recap: Record<number, { HADIR: number, SAKIT: number, IZIN: number, ALPA: number }> = {};
    students.forEach(student => {
        recap[student.id] = { HADIR: 0, SAKIT: 0, IZIN: 0, ALPA: 0 };
    });

    // Kode ini sekarang aman untuk dijalankan
    dashboardData.dailyAttendances.forEach((rec: { studentId: number; status: string; }) => {
        if (recap[rec.studentId] && rec.status in recap[rec.studentId]) {
            recap[rec.studentId][rec.status as 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA']++;
        }
    });
    return recap;
}, [dashboardData, students]);
    // --- AKHIR PEMINDAHAN ---

    const fetchData = useCallback(async () => {
         setIsLoading(true);
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

    useEffect(() => { fetchData(); }, [fetchData]);
    
    const openEditModal = (student: Student) => {
        setSelectedStudent(student);
        setIsEditModalOpen(true);
    };
     const openViewModal = (student: Student) => {
        setSelectedStudent(student);
        setIsViewModalOpen(true);
    };

    const handleAddNote = async (e: React.FormEvent) => { /* ... (logika handleAddNote) ... */ };

    // Return kondisional sekarang aman karena semua hook sudah dipanggil
    if (isLoading) return <div className="p-8 text-center">Memuat Dashboard...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    async function handleDelete(id: number): Promise<void> {
        if (!window.confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) return;
        try {
            await apiClient.delete(`/homeroom/student/${id}`);
            toast.success('Data siswa berhasil dihapus.');
            fetchData(); // Refresh dashboard data
        } catch (error) {
            toast.error('Gagal menghapus data siswa.');
        }
    }

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
    {activeTab === 'manage' && (
        <div className="grid grid-cols-1 md:grid-cols-3  text-gray-800 gap-6">
            <div className="md:col-span-1">
                <h3 className="text-lg font-semibold mb-2">Tambah Catatan Baru</h3>
                <form onSubmit={handleAddNote} className="space-y-4 p-4 bg-white rounded-lg shadow">
                    <div>
                        <label className="block text-sm font-medium">Pilih Siswa</label>
                        <select value={selectedStudentIdForNote} onChange={(e) => setSelectedStudentIdForNote(e.target.value)} className="form-select mt-1 w-full" required>
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
                                            {/* Tambah kolom Aksi */}
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
                                                {/* Tambah sel dengan tombol View */}
                                                <td className="px-6 py-4 text-center space-x-4">
                                                    <button 
                                                        onClick={() => openAttendanceDetailModal(student)}
                                                        className="text-blue-600 hover:underline font-semibold text-sm"
                                                    >
                                                        View
                                                    </button>
                                                    
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
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
    
    {/* --- PERUBAHAN DI SINI --- */}
    <td className="px-6 py-4 text-center">
        {/* Gunakan flexbox untuk mengatur jarak tombol */}
        <div className="flex items-center justify-center gap-x-5 ">
            {/* Tombol View dengan warna hijau */}
            <button
             onClick={() => openViewModal(student)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
            >
            View 
            </button>
            
            {/* Tombol Cetak Transkrip
            <button
                onClick={() => generateTranscriptPDF(student, dashboardData.gradeComponents, dashboardData.name)}
                className="btn-secondary text-sm"
            >
                Cetak Transkrip
            </button> */}
        </div>
    </td>
    {/* --- AKHIR PERUBAHAN --- */}
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