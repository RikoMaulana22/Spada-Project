'use client';

import { useState, FormEvent, useEffect } from 'react';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';

// Komponen Ikon sederhana untuk tombol tutup
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubjectAdded: () => void;
}

const initialState = { name: '', grade: '7' }; // Default ke kelas 7

export default function AddSubjectModal({ isOpen, onClose, onSubjectAdded }: AddSubjectModalProps) {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setFormData(initialState);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading('Menambahkan mata pelajaran...');
    try {
      await apiClient.post('/admin/subjects', formData);
      toast.success('Mata pelajaran baru berhasil ditambahkan!', { id: loadingToast });
      onSubjectAdded();
      onClose(); // handleClose tidak perlu dipanggil karena onClose sudah cukup dan state direset oleh useEffect
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan mapel.', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClasses = "w-full px-4 py-2 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 bg-white text-gray-900">
      <div className="w-full h-full flex flex-col">
        {/* Header Gelap */}
        <header className="flex-shrink-0 bg-blue-800 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h2 className="text-lg font-bold text-white">Tambah Mata Pelajaran Baru</h2>
              <button onClick={onClose} className="text-gray-300 hover:text-white transition-colors">
                <CloseIcon />
              </button>
            </div>
          </div>
        </header>

        {/* Body dengan background terang */}
        <main className="flex-grow bg-gray-100 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className={labelClasses}>Nama Mata Pelajaran</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                    placeholder="Contoh: Matematika"
                  />
                </div>
                <div>
                  <label htmlFor="grade" className={labelClasses}>Tingkat Kelas</label>
                  <select
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className={inputClasses}
                  >
                    <option value="7">Kelas 7</option>
                    <option value="8">Kelas 8</option>
                    <option value="9">Kelas 9</option>
                  </select>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="flex justify-end gap-4 pt-8 mt-6 border-t border-gray-200">
                <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium">
                  Batal
                </button>
                <button type="submit" disabled={isLoading} className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">
                  {isLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}