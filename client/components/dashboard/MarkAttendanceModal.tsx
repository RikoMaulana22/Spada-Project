'use client';

import { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import apiClient from '@/lib/axios';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { FaUserCheck, FaNotesMedical, FaFileAlt, FaRegCalendarCheck, FaTimes, FaRegTimesCircle } from 'react-icons/fa';

interface MarkAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    attendanceId: number | null;
    studentName: string;
}

// Tipe data baru untuk status agar lebih aman
type AttendanceStatus = 'HADIR' | 'SAKIT' | 'IZIN' | 'ALFA';

export default function MarkAttendanceModal({ isOpen, onClose, onSuccess, attendanceId, studentName }: MarkAttendanceModalProps) {
    // Gunakan tipe data yang sudah didefinisikan
    const [status, setStatus] = useState<AttendanceStatus>('HADIR');
    const [notes, setNotes] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Reset form state setiap kali modal dibuka
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
            onSuccess(); // Refresh data di halaman utama
            onClose();   // Tutup modal
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal mencatat kehadiran.', { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };
    
    // Perubahan kecil untuk handleFileChange
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setProofFile(e.target.files[0]);
        } else {
            setProofFile(null);
        }
    };

    return (
        <div className='text-gray-800'>
            <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Kehadiran" isFullScreen>
                {/* Wrapper untuk menengahkan konten di modal fullscreen */}
                <div className="flex items-center justify-center min-h-full bg-gray-50 p-4">
                    <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-200">
                        {/* Header Form */}
                        <div className="p-6 border-b text-center">
                            <FaUserCheck className="mx-auto text-blue-600 h-12 w-12 bg-blue-100 p-3 rounded-full" />
                            <h2 className="text-2xl font-bold text-gray-800 mt-4">Konfirmasi Kehadiran</h2>
                            <p className="text-sm text-gray-500">Untuk siswa: <span className="font-semibold">{studentName}</span></p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-6">
                                {/* Pilihan Status Kehadiran (dibuat lebih visual) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status Kehadiran</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {(['HADIR', 'SAKIT', 'IZIN', 'ALFA'] as AttendanceStatus[]).map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setStatus(s)}
                                                className={`p-3 rounded-lg border text-center transition-all ${status === s ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white hover:bg-gray-100 border-gray-300'}`}
                                            >
                                                <span className="font-semibold text-sm">{s}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Form Kondisional untuk Sakit atau Izin */}
                                {(status === 'SAKIT' || status === 'IZIN') && (
                                    <div className="p-4 bg-gray-50 border border-dashed rounded-lg space-y-4 animate-fade-in">
                                        <h3 className="font-semibold text-gray-700">Lengkapi Keterangan</h3>
                                        <div>
                                            <label htmlFor="notes" className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                                <FaNotesMedical /> Keterangan
                                            </label>
                                            <textarea 
                                                id="notes"
                                                value={notes} 
                                                onChange={(e) => setNotes(e.target.value)} 
                                                rows={3} 
                                                className="form-textarea w-full mt-1" 
                                                placeholder={`Contoh: Ada acara keluarga mendadak.`} 
                                                required
                                            ></textarea>
                                        </div>
                                        <div>
                                            <label htmlFor="proofFile" className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                                <FaFileAlt /> Unggah Bukti (Surat, dll)
                                            </label>
                                            <input 
                                                id="proofFile"
                                                type="file" 
                                                onChange={handleFileChange} 
                                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Opsional, tapi sangat disarankan untuk melampirkan bukti.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Footer Form (Tombol Aksi) */}
                            <div className="flex justify-end gap-4 p-6 bg-gray-50 border-t rounded-b-xl">
                                <button type="button" onClick={onClose} className="btn-secondary">
                                    Batal
                                </button>
                                <button type="submit" disabled={isLoading} className="btn-primary flex items-center gap-2">
                                    <FaRegCalendarCheck />
                                    {isLoading ? 'Menyimpan...' : 'Simpan Kehadiran'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Modal>
        </div>
    );
}