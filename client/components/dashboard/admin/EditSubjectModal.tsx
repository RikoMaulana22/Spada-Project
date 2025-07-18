'use client';

import { useState, FormEvent, useEffect } from 'react';
import apiClient from '@/lib/axios';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

// Definisikan tipe Subject di sini atau impor dari @/types
interface Subject {
    id: number;
    name: string;
    grade: number;
}

interface EditSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
  onSubjectUpdated: () => void;
}

export default function EditSubjectModal({ isOpen, onClose, subject, onSubjectUpdated }: EditSubjectModalProps) {
  const [formData, setFormData] = useState({ name: '', grade: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name,
        grade: subject.grade.toString(),
      });
    }
  }, [subject]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!subject) return;
    setIsLoading(true);
    const loadingToast = toast.loading('Memperbarui data...');
    try {
      await apiClient.put(`/subjects/${subject.id}`, formData);
      toast.success('Data berhasil diperbarui!', { id: loadingToast });
      onSubjectUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui data.', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Mata Pelajaran: ${subject?.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nama Mata Pelajaran</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-input mt-1 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Tingkat Kelas</label>
          <select name="grade" value={formData.grade} onChange={handleChange} className="form-select mt-1 w-full">
            <option value="7">Kelas 7</option>
            <option value="8">Kelas 8</option>
            <option value="9">Kelas 9</option>
          </select>
        </div>
        <div className="flex justify-end gap-4 pt-4 border-t mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}