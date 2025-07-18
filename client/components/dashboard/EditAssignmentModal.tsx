'use client';

import { useState, useEffect, FormEvent } from 'react';
import apiClient from '@/lib/axios';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { AssignmentDetails, AssignmentType } from '@/types'; // Asumsi tipe ini ada

interface EditAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignmentUpdated: () => void;
  assignment: AssignmentDetails | null; // Data tugas yang akan diedit
}

export default function EditAssignmentModal({ isOpen, onClose, onAssignmentUpdated, assignment }: EditAssignmentModalProps) {
    const [formData, setFormData] = useState<Partial<AssignmentDetails>>({});

    useEffect(() => {
        // Isi form dengan data tugas yang ada saat modal dibuka
        if (assignment) {
            setFormData({
                ...assignment,
                dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().substring(0, 10) : '',
            });
        }
    }, [assignment]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev: Partial<AssignmentDetails>) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!assignment) return;
        
        const loadingToast = toast.loading("Menyimpan perubahan...");
        try {
            await apiClient.put(`/assignments/${assignment.id}`, formData);
            toast.success("Tugas berhasil diperbarui.", { id: loadingToast });
            onAssignmentUpdated();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Gagal memperbarui tugas.", { id: loadingToast });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Tugas / Kuis">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Judul */}
                <div>
                    <label className="block text-sm font-medium">Judul Tugas</label>
                    <input type="text" name="title" value={formData.title || ''} onChange={handleChange} required className="form-input mt-1 w-full" />
                </div>
                {/* Tipe Tugas */}
                <div>
                    <label className="block text-sm font-medium">Tipe Tugas</label>
                    <select name="type" value={formData.type || 'pilgan'} onChange={handleChange} className="form-select mt-1 w-full">
                        <option value="pilgan">Pilihan Ganda</option>
                        <option value="esai">Esai</option>
                        <option value="link_google">Tugas Link (Google Docs, dll)</option>
                    </select>
                </div>
                {/* URL (jika tipe link) */}
                {formData.type === 'link_google' && (
                    <div>
                        <label className="block text-sm font-medium">URL Google Doc/Form</label>
                        <input type="url" name="externalUrl" value={formData.externalUrl || ''} onChange={handleChange} required className="form-input mt-1 w-full" />
                    </div>
                )}
                {/* Tanggal Tenggat */}
                <div>
                    <label className="block text-sm font-medium">Tanggal Tenggat</label>
                    <input type="date" name="dueDate" value={formData.dueDate || ''} onChange={handleChange} required className="form-input mt-1 w-full" />
                </div>
                {/* Tombol Aksi */}
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
                    <button type="submit" className="btn-primary">Simpan Perubahan</button>
                </div>
            </form>
        </Modal>
    );
}