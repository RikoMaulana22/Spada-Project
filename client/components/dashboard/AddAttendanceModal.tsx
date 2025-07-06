// Path: client/components/dashboard/AddAttendanceModal.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import apiClient from '@/lib/axios';
import Modal from '@/components/ui/Modal';

interface AddAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: number | null;
  onAttendanceAdded: () => void;
}

export default function AddAttendanceModal({ isOpen, onClose, topicId, onAttendanceAdded }: AddAttendanceModalProps) {
  const [title, setTitle] = useState('');
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset form setiap kali modal dibuka
    if (isOpen) {
      setTitle('Absensi Pertemuan'); // Judul default
      setOpenTime('');
      setCloseTime('');
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!topicId) return;

    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post(`/attendance/topic/${topicId}`, { title, openTime, closeTime });
      onAttendanceAdded(); // Refresh data di halaman utama
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat sesi absensi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Atur Sesi Kehadiran">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div>
          <label className="block text-sm font-medium">Judul Absensi</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="form-input w-full" placeholder="Contoh: Absensi Minggu 1" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium">Waktu Dibuka</label>
                <input type="datetime-local" value={openTime} onChange={(e) => setOpenTime(e.target.value)} required className="form-input w-full"/>
            </div>
            <div>
                <label className="block text-sm font-medium">Waktu Ditutup</label>
                <input type="datetime-local" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} required className="form-input w-full"/>
            </div>
        </div>
        <p className="text-xs text-gray-500">Siswa hanya bisa mengisi absensi di antara waktu dibuka dan ditutup.</p>
        <div className="flex justify-end gap-4 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
            {isLoading ? 'Menyimpan...' : 'Simpan Sesi'}
          </button>
        </div>
      </form>
    </Modal>
  );
}