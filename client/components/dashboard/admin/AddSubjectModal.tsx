'use client';

import { useState, FormEvent } from 'react';
import apiClient from '@/lib/axios';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubjectAdded: () => void;
}

const initialState = { name: '', grade: '7' }; // Default ke kelas 7

export default function AddSubjectModal({ isOpen, onClose, onSubjectAdded }: AddSubjectModalProps) {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading('Menambahkan mata pelajaran...');
    try {
      await apiClient.post('/subjects', formData);
      toast.success('Mata pelajaran baru berhasil ditambahkan!', { id: loadingToast });
      onSubjectAdded();
      handleClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan mapel.', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialState);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Tambah Mata Pelajaran Baru">
      <form onSubmit={handleSubmit} className="space-y-4 text-gray-700">
        <div>
          <label className="block text-sm font-medium">Nama Mata Pelajaran</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-input mt-1 w-full" placeholder="Contoh: Matematika"/>
        </div>
        <div>
          <label className="block text-sm font-medium">Tingkat Kelas</label>
          <select name="grade" value={formData.grade} onChange={handleChange} className="form-select mt-1 w-full">
            <option value="7">Kelas 7</option>
            <option value="8">Kelas 8</option>
            <option value="9">Kelas 9</option>
            {/* Tambahkan tingkatan lain jika perlu */}
          </select>
        </div>
        <div className="flex justify-end gap-4 pt-4 border-t mt-6">
          <button type="button" onClick={handleClose} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
            {isLoading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}