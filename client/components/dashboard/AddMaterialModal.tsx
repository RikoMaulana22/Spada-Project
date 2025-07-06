// Path: client/components/dashboard/AddMaterialModal.tsx
'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import apiClient from '@/lib/axios';
import Modal from '@/components/ui/Modal';

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: number | null;
  onMaterialAdded: () => void;
}

export default function AddMaterialModal({ isOpen, onClose, topicId, onMaterialAdded }: AddMaterialModalProps) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setFile(null);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !file || !topicId) {
      setError('Judul dan file wajib diisi.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    try {
      // Panggil endpoint yang sudah kita siapkan di backend
      await apiClient.post(`/materials/topic/${topicId}/materials`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onMaterialAdded();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengunggah materi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Materi Baru">
      <form onSubmit={handleSubmit}>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="mb-4">
          <label htmlFor="material-title" className="block text-sm font-medium text-gray-700">Judul Materi</label>
          <input
            type="text" id="material-title" value={title} onChange={(e) => setTitle(e.target.value)} required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="material-file" className="block text-sm font-medium text-gray-700">File Materi</label>
          <input
            type="file" id="material-file" ref={fileInputRef} onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} required
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Batal</button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
            {isLoading ? 'Mengunggah...' : 'Unggah Materi'}
          </button>
        </div>
      </form>
    </Modal>
  );
}