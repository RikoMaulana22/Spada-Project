'use client';

import { useState, useEffect, FormEvent } from 'react';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import { User, Subject } from '@/types';

// Komponen Ikon sederhana untuk tombol tutup
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface Class { id: number; name: string; }
interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleAdded: () => void;
}

const initialState = {
  dayOfWeek: 'SENIN',
  startTime: '07:00',
  endTime: '08:30',
  classId: '',
  subjectId: '',
  teacherId: ''
};

export default function AddScheduleModal({ isOpen, onClose, onScheduleAdded }: AddScheduleModalProps) {
    const [formData, setFormData] = useState(initialState);
    const [isLoading, setIsLoading] = useState(false);
    
    const [classes, setClasses] = useState<Class[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    useEffect(() => {
        if (isOpen) {
            // Reset form setiap kali modal dibuka
            setFormData(initialState);

            const fetchDropdownData = async () => {
                const loadingToast = toast.loading("Memuat data form...");
                try {
                    const classPromise = apiClient.get('/admin/classes'); // Pastikan endpoint benar
                    const teacherPromise = apiClient.get('/admin/users?role=guru');
                    const subjectPromise = apiClient.get('/admin/subjects'); // Pastikan endpoint benar
                    
                    const [classRes, teacherRes, subjectRes] = await Promise.all([classPromise, teacherPromise, subjectPromise]);
                    
                    setClasses(classRes.data);
                    setTeachers(teacherRes.data);
                    setSubjects(subjectRes.data);
                    toast.dismiss(loadingToast);
                } catch (error) {
                    toast.error("Gagal memuat data untuk form.", { id: loadingToast });
                }
            };
            fetchDropdownData();
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const loadingToast = toast.loading('Menyimpan jadwal...');
        try {
            await apiClient.post('/schedules', formData); // Pastikan endpoint benar
            toast.success('Jadwal baru berhasil ditambahkan!', { id: loadingToast });
            onScheduleAdded();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal menambahkan jadwal.', { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };
    
    if(!isOpen) return null;

    const inputClasses = "w-full px-4 py-2 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="fixed inset-0 z-50 bg-white text-gray-900">
            <div className="w-full h-full flex flex-col">
                {/* Header Biru Sesuai Permintaan */}
                <header className="flex-shrink-0 bg-blue-800 shadow-md">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <h2 className="text-lg font-bold text-white">Tambah Jadwal Pelajaran Baru</h2>
                            <button onClick={onClose} className="text-gray-200 hover:text-white transition-colors">
                               <CloseIcon/>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Body dengan background terang */}
                <main className="flex-grow bg-gray-100 overflow-y-auto">
                    <div className="max-w-4xl mx-auto p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            
                            <div>
                                <label htmlFor="classId" className={labelClasses}>Kelas</label>
                                <select id="classId" name="classId" value={formData.classId} onChange={handleChange} required className={inputClasses}>
                                    <option value="" disabled>Pilih Kelas</option>
                                    {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="dayOfWeek" className={labelClasses}>Hari</label>
                                <select id="dayOfWeek" name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange} required className={inputClasses}>
                                    <option value="SENIN">Senin</option>
                                    <option value="SELASA">Selasa</option>
                                    <option value="RABU">Rabu</option>
                                    <option value="KAMIS">Kamis</option>
                                    <option value="JUMAT">Jumat</option>
                                    <option value="SABTU">Sabtu</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="subjectId" className={labelClasses}>Mata Pelajaran</label>
                                <select id="subjectId" name="subjectId" value={formData.subjectId} onChange={handleChange} required className={inputClasses}>
                                    <option value="" disabled>Pilih Mata Pelajaran</option>
                                    {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name} (Kelas {sub.grade})</option>)}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="teacherId" className={labelClasses}>Guru Pengajar</label>
                                <select id="teacherId" name="teacherId" value={formData.teacherId} onChange={handleChange} required className={inputClasses}>
                                    <option value="" disabled>Pilih Guru</option>
                                    {teachers.map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>)}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="startTime" className={labelClasses}>Jam Mulai</label>
                                <input id="startTime" type="time" name="startTime" value={formData.startTime} onChange={handleChange} required className={inputClasses} />
                            </div>
                            
                            <div>
                                <label htmlFor="endTime" className={labelClasses}>Jam Selesai</label>
                                <input id="endTime" type="time" name="endTime" value={formData.endTime} onChange={handleChange} required className={inputClasses} />
                            </div>

                            {/* Tombol Aksi */}
                            <div className="md:col-span-2 flex justify-end gap-4 pt-4 mt-4 border-t border-gray-200">
                                <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium">
                                    Batal
                                </button>
                                <button type="submit" disabled={isLoading} className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">
                                    {isLoading ? 'Menyimpan...' : 'Simpan Jadwal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}