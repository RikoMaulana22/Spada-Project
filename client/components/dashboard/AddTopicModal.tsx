// Path: client/components/dashboard/AddTopicModal.tsx
'use client';

import { useState, FormEvent } from 'react';
import apiClient from '@/lib/axios';
import Modal from '@/components/ui/Modal'; // Impor komponen modal dasar

interface AddTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
  nextOrder: number; // Kita butuh urutan untuk topik baru
  onTopicCreated: () => void; // Fungsi untuk refresh data di halaman utama
}

export default function AddTopicModal({ isOpen, onClose, classId, nextOrder, onTopicCreated }: AddTopicModalProps) {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError('Judul topik tidak boleh kosong.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post(`/classes/${classId}/topics`, {
        title,
        order: nextOrder,
      });
      // Beritahu halaman utama bahwa topik baru telah dibuat
      onTopicCreated(); 
      onClose(); // Tutup modal setelah berhasil
      setTitle(''); // Reset form
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat topik.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buat Topik Baru">
      <form onSubmit={handleSubmit}>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="mb-4">
          <label htmlFor="topic-title" className="block text-sm font-medium text-gray-700">
            Judul Topik
          </label>
          <input
            type="text"
            id="topic-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="Contoh: Pertemuan 1 - Pengenalan"
          />
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            Batal
          </button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
            {isLoading ? 'Menyimpan...' : 'Simpan Topik'}
          </button>
        </div>
      </form>
    </Modal>
  );
}