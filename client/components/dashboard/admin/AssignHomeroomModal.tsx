// Path: client/components/admin/AssignHomeroomModal.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import { User } from '@/types';

interface AssignHomeroomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    selectedClass: { id: number; name: string } | null;
}

export default function AssignHomeroomModal({ isOpen, onClose, onSuccess, selectedClass }: AssignHomeroomModalProps) {
    const [teachers, setTeachers] = useState<User[]>([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchTeachers = async () => {
                try {
                    const res = await apiClient.get('/admin/users?role=guru');
                    setTeachers(res.data);
                } catch (error) {
                    toast.error("Gagal memuat daftar guru.");
                }
            };
            fetchTeachers();
        }
    }, [isOpen]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const toastId = toast.loading("Menyimpan...");

        try {
            await apiClient.put(`/admin/classes/${selectedClass?.id}/assign-homeroom`, {
                teacherId: selectedTeacherId // Kirim ID guru yang dipilih
            });
            toast.success("Wali kelas berhasil ditetapkan!", { id: toastId });
            onSuccess(); // Refresh data di halaman utama
            onClose();   // Tutup modal
        } catch (error) {
            toast.error("Gagal menetapkan wali kelas.", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="text-gray-800">
        <Modal isOpen={isOpen} onClose={onClose} title={`Setel Wali Kelas untuk ${selectedClass?.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Pilih Guru</label>
                    <select
                        value={selectedTeacherId}
                        onChange={(e) => setSelectedTeacherId(e.target.value)}
                        className="form-select w-full mt-1"
                        required
                    >
                        <option value="" disabled>-- Pilih Guru --</option>
                        {teachers.map(teacher => (
                            <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>
                        ))}
                    </select>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
                    <button type="submit" disabled={isSubmitting} className="btn-primary">
                        {isSubmitting ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>
            </form>
        </Modal>
        </div>
    );
}