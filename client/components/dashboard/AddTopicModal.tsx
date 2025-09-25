'use client';

import { useState, FormEvent } from 'react';
import apiClient from '@/lib/axios';
import Modal from '@/components/ui/Modal';
import { FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface AddTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
  nextOrder: number;
  onTopicCreated: () => void;
}

export default function AddTopicModal({ isOpen, onClose, classId, nextOrder, onTopicCreated }: AddTopicModalProps) {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fungsi inilah yang menangani penyimpanan topik ke server.
   * Dipanggil saat tombol 'Simpan Topik' ditekan.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Validasi input tidak boleh kosong
    if (!title.trim()) {
      setError('Judul topik tidak boleh kosong.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      // Mengirim data ke backend API
      await apiClient.post(`/classes/${classId}/topics`, {
        title,
        order: nextOrder,
      });
      toast.success('Topik baru berhasil dibuat!');
      
      onTopicCreated(); // Memuat ulang data topik di halaman sebelumnya
      handleClose(); // Menutup dan mereset modal
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Gagal membuat topik.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk membersihkan state dan menutup modal
  const handleClose = () => {
    setTitle('');
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="" isFullScreen>
      <div className="flex flex-col h-screen bg-gray-50/50 backdrop-blur-sm">
        <main className="flex-grow w-full flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border flex flex-col overflow-hidden animate-fade-in-up">
            
            <header className="flex items-center justify-between p-5 border-b bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Buat Topik Baru</h2>
             
            </header>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="bg-red-100 border-l-4  border-red-500 text-red-700 px-4 py-3 rounded-md" role="alert">
                  <p className="font-bold">Terjadi Kesalahan</p>
                  <p>{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="topic-title" className="block text-base font-semibold text-gray-700 mb-2">
                  Judul Topik
                </label>
                <input
                  type="text"
                  id="topic-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-1 block w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="Contoh: Pertemuan 1 - Pengenalan Basis Data"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Berikan judul yang jelas dan deskriptif untuk topik ini.
                </p>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={handleClose} 
                  className="btn-secondary"
                >
                  Batal
                </button>
                {/* Tombol ini akan memicu fungsi handleSubmit */}
                <button 
                  type="submit" 
                  disabled={isLoading || !title.trim()} 
                  className="btn-primary"
                >
                  {isLoading ? 'Menyimpan...' : 'Simpan Topik'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </Modal>
  );
}