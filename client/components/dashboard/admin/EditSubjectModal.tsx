'use client';

import { useState, FormEvent, useEffect } from 'react';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';


// Definisikan tipe Subject di sini atau impor dari @/types
interface Subject {
    id: number;
    name: string;
    grade: number;
}

interface EditSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    subject: Subject | null;
    onSubjectUpdated: () => void;
}

export default function EditSubjectModal({ isOpen, onClose, subject, onSubjectUpdated }: EditSubjectModalProps) {
    const [formData, setFormData] = useState({ name: '', grade: '' });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (subject) {
            setFormData({
                name: subject.name,
                grade: subject.grade.toString(),
            });
        }
    }, [subject]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!subject) return;
        setIsLoading(true);
        const loadingToast = toast.loading('Memperbarui data...');
        try {
            await apiClient.put(`/subjects/${subject.id}`, formData);
            toast.success('Data berhasil diperbarui!', { id: loadingToast });
            onSubjectUpdated();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal memperbarui data.', { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`Edit Mata Pelajaran: ${subject?.name}`}
            isFullScreen={true}
        >
            <form onSubmit={handleSubmit} className="p-6 h-full text-gray-600 flex flex-col">
                <div className="flex-grow space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Nama Mata Pelajaran</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-input border border-gray-600 rounded py-2 px-3 mt-1 w-full" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Tingkat Kelas</label>
                        <select name="grade" value={formData.grade} onChange={handleChange} className="form-select border border-gray-600 rounded py-2 px-3mt-1 w-full">
                            <option value="7">Kelas 7</option>
                            <option value="8">Kelas 8</option>
                            <option value="9">Kelas 9</option>
                        </select>
                    </div>
                </div>
                {/* Bagian footer form dibuat sticky di bawah */}
                <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
                    <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
                        {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}