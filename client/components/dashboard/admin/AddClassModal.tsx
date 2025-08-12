'use client';

import { useState, useEffect, FormEvent } from 'react';
import apiClient from '@/lib/axios';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

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

    return (
        <div className=' text-gray-800'>
        <Modal isOpen={isOpen} onClose={onClose} title="Buat Kelas Baru">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Nama Kelas</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="form-input w-full mt-1" placeholder="Contoh: Kelas 7A" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Deskripsi (Opsional)</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="form-textarea w-full mt-1" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Mata Pelajaran</label>
                    <select value={subjectId} onChange={e => setSubjectId(e.target.value)} required className="form-select w-full mt-1">
                        <option value="">-- Pilih Mata Pelajaran --</option>
                        {subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">Guru Pengajar</label>
                    <select value={teacherId} onChange={e => setTeacherId(e.target.value)} required className="form-select w-full mt-1">
                        <option value="">-- Pilih Guru --</option>
                        {teachers.map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>)}
                    </select>
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
                    <button type="submit" disabled={isLoading} className="btn-primary">
                        {isLoading ? "Menyimpan..." : "Simpan Kelas"}
                    </button>
                </div>
            </form>
        </Modal>
        </div>
    );
}