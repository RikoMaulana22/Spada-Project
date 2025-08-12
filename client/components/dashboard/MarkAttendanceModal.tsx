'use client';

import { useState, FormEvent, useEffect } from 'react';
import apiClient from '@/lib/axios';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

interface MarkAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    attendanceId: number | null;
    studentName: string;
}

export default function MarkAttendanceModal({ isOpen, onClose, onSuccess, attendanceId, studentName }: MarkAttendanceModalProps) {
    const [status, setStatus] = useState<'HADIR' | 'SAKIT' | 'IZIN'>('HADIR');
    const [notes, setNotes] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Reset form state every time the modal is opened
    useEffect(() => {
        if (isOpen) {
            setStatus('HADIR');
            setNotes('');
            setProofFile(null);
            setIsLoading(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const toastId = toast.loading("Mencatat kehadiran...");
        
        const formData = new FormData();
        formData.append('status', status);
        formData.append('notes', notes);
        if (proofFile) {
            formData.append('proof', proofFile);
        }

        try {
            await apiClient.post(`/attendance/${attendanceId}/record`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success("Kehadiran berhasil dicatat!", { id: toastId });
            onSuccess(); // Refresh the class page data
            onClose();   // Close the modal
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal mencatat kehadiran.', { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='text-gray-800'>
        <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Kehadiran">
            <form onSubmit={handleSubmit} className="space-y-4 text-gray-800">
                <div>
                    <label className="block text-sm font-medium">Nama Siswa</label>
                    <input type="text" value={studentName} disabled className="form-input w-full mt-1 bg-gray-100 cursor-not-allowed" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Status Kehadiran</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="form-select w-full mt-1">
                        <option value="HADIR">Hadir</option>
                        <option value="SAKIT">Sakit</option>
                        <option value="IZIN">Izin</option>
                        <option value="ALFA">Alfa</option>
                    </select>
                </div>
                {(status === 'SAKIT' || status === 'IZIN') && (
                     <>
                        <div>
                            <label className="block text-sm font-medium">Keterangan</label>
                            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="form-textarea w-full mt-1" placeholder="Contoh: Ada acara keluarga" required></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Unggah Bukti (Surat, dll)</label>
                            <input 
                                type="file" 
                                onChange={(e) => setProofFile(e.target.files ? e.target.files[0] : null)} 
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                                required 
                            />
                        </div>
                     </>
                )}
                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
                    <button type="submit" disabled={isLoading} className="btn-primary">
                        {isLoading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </form>
        </Modal>
        </div>
    );
}