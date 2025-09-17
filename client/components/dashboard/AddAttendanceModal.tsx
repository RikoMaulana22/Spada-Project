'use client';

import { useState, FormEvent, useEffect } from 'react';
import apiClient from '@/lib/axios';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { FaCalendarCheck, FaClock, FaInfoCircle } from 'react-icons/fa';

interface AddAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: number | null;
  onAttendanceAdded: () => void;
}

export default function AddAttendanceModal({ isOpen, onClose, topicId, onAttendanceAdded }: AddAttendanceModalProps) {
  const [title, setTitle] = useState('Absensi Pertemuan');
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi untuk reset state
  const resetForm = () => {
    setTitle('Absensi Pertemuan');
    setOpenTime('');
    setCloseTime('');
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!topicId) return;

    if (new Date(closeTime) <= new Date(openTime)) {
      toast.error('Waktu ditutup harus setelah waktu dibuka.');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Menyimpan sesi absensi...");

    try {
      await apiClient.post(`/attendance/topic/${topicId}`, { title, openTime, closeTime });
      toast.success("Sesi absensi berhasil dibuat!", { id: toastId });
      onAttendanceAdded();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal membuat sesi absensi.', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  // Gunakan handleClose untuk memastikan form direset saat ditutup manual
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className='text-gray-800'>
      <Modal isOpen={isOpen} onClose={handleClose} title="Atur Sesi Kehadiran" isFullScreen>
        {/* Wrapper untuk menengahkan konten di dalam modal fullscreen */}
        <div className="flex items-center justify-center h-full bg-gray-50 p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-200">
            {/* Header Form */}
            <div className="p-6 border-b">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                  <FaCalendarCheck size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Atur Sesi Kehadiran</h2>
                  <p className="text-sm text-gray-500">Buat jadwal agar siswa dapat melakukan absensi secara online.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-6">
                {/* Input Judul */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">Judul Absensi</label>
                  <input 
                    id="title"
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                    className="form-input w-full mt-1" 
                    placeholder="Contoh: Absensi Pertemuan ke-3"
                  />
                </div>

                {/* Input Waktu */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="openTime" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <FaClock className="text-gray-400"/>
                      Waktu Dibuka
                    </label>
                    <input 
                      id="openTime"
                      type="datetime-local" 
                      value={openTime} 
                      onChange={(e) => setOpenTime(e.target.value)} 
                      required 
                      className="form-input w-full mt-1"
                    />
                  </div>
                  <div>
                    <label htmlFor="closeTime" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <FaClock className="text-gray-400"/>
                      Waktu Ditutup
                    </label>
                    <input 
                      id="closeTime"
                      type="datetime-local" 
                      value={closeTime} 
                      onChange={(e) => setCloseTime(e.target.value)} 
                      required 
                      className="form-input w-full mt-1"
                    />
                  </div>
                </div>

                {/* Informasi Bantuan */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                  <FaInfoCircle className="text-blue-500 mt-1 flex-shrink-0" />
                  <p className="text-xs text-blue-700">
                    Siswa hanya dapat mengisi absensi di antara waktu dibuka dan ditutup. Pastikan rentang waktu sudah benar.
                  </p>
                </div>
              </div>
              
              {/* Footer Form (Tombol Aksi) */}
              <div className="flex justify-end gap-4 p-6 bg-gray-50 border-t rounded-b-xl">
                <button type="button" onClick={handleClose} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" disabled={isLoading} className="btn-primary">
                  {isLoading ? 'Menyimpan...' : 'Simpan Sesi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
}