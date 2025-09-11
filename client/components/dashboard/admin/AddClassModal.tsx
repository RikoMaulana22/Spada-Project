'use client';

import { useState, useEffect, FormEvent } from 'react';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';

// Komponen Ikon sederhana untuk tombol tutup
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface Teacher { id: number; fullName: string; }
interface Subject { id: number; name: string; }

interface AddClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onClassCreated: () => void;
}

export default function AddClassModal({ isOpen, onClose, onClassCreated }: AddClassModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Reset state form setiap kali modal dibuka
            setName('');
            setDescription('');
            setSubjectId('');
            setTeacherId('');
            setIsLoading(false);

            const fetchPrerequisites = async () => {
                try {
                    const [teachersRes, subjectsRes] = await Promise.all([
                        apiClient.get('/admin/teachers'),
                        apiClient.get('/admin/subjects')
                    ]);
                    setTeachers(teachersRes.data);
                    setSubjects(subjectsRes.data);
                } catch (error) {
                    toast.error("Gagal memuat data guru/mapel.");
                }
            };
            fetchPrerequisites();
        }
    }, [isOpen]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const toastId = toast.loading("Membuat kelas...");
        try {
            await apiClient.post('/admin/classes', { name, description, subjectId, teacherId });
            toast.success("Kelas berhasil dibuat!", { id: toastId });
            onClassCreated();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal membuat kelas.", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;
    
    const inputClasses = "w-full px-4 py-2 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="fixed inset-0 z-50 bg-white text-gray-900">
            <div className="w-full h-full flex flex-col">
                {/* Header Gelap */}
                <header className="flex-shrink-0 bg-blue-800 shadow-md">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <h2 className="text-lg font-bold text-white">Buat Kelas Baru</h2>
                            <button onClick={onClose} className="text-gray-300 hover:text-white transition-colors">
                               <CloseIcon/>
                            </button>
                        </div>
                    </div>
                </header>   
                
                {/* Body dengan background terang */}
                <main className="flex-grow bg-gray-100 overflow-y-auto">
                    <div className="max-w-3xl mx-auto p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-sm">
                            
                            <div>
                                <label htmlFor="name" className={labelClasses}>Nama Kelas</label>
                                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className={inputClasses} placeholder="Contoh: Fisika XI IPA 1" />
                            </div>

                            {/* Grid untuk Mata Pelajaran dan Guru */}
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                                <div>
                                    <label htmlFor='subject' className={labelClasses}>Mata Pelajaran</label>
                                    <select id='subject' value={subjectId} onChange={e => setSubjectId(e.target.value)} required className={inputClasses}>
                                        <option value="" disabled>-- Pilih Mata Pelajaran --</option>
                                        {subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor='teacher' className={labelClasses}>Guru Pengajar</label>
                                    <select id='teacher' value={teacherId} onChange={e => setTeacherId(e.target.value)} required className={inputClasses}>
                                        <option value="" disabled>-- Pilih Guru --</option>
                                        {teachers.map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="description" className={labelClasses}>Deskripsi (Opsional)</label>
                                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className={inputClasses} placeholder="Jelaskan sedikit mengenai kelas ini..." />
                            </div>

                            {/* Tombol Aksi */}
                            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                                <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium">
                                    Batal
                                </button>
                                <button type="submit" disabled={isLoading} className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">
                                    {isLoading ? "Menyimpan..." : "Simpan Kelas"}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}