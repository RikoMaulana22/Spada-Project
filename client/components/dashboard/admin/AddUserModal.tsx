// Path: src/components/dashboard/admin/AddUserModal.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';

// Komponen Ikon sederhana untuk tombol tutup
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

interface AvailableClass {
  id: number;
  name: string;
}

const initialState = {
  fullName: '',
  username: '',
  password: '',
  email: '',
  role: 'siswa',
  nisn: '',
  homeroomClassId: '',
};

export default function AddUserModal({ isOpen, onClose, onUserAdded }: AddUserModalProps) {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<AvailableClass[]>([]);

  // Reset form setiap kali modal dibuka untuk UX yang lebih baik
  useEffect(() => {
    if (isOpen) {
        setFormData(initialState);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'role' && value !== 'wali_kelas') {
        newState.homeroomClassId = '';
      }
      return newState;
    });
  };

  useEffect(() => {
    if (isOpen && formData.role === 'wali_kelas') {
      const fetchClasses = async () => {
        try {
          const response = await apiClient.get('/admin/classes/available-for-homeroom');
          setAvailableClasses(response.data);
        } catch (error) {
          toast.error("Gagal memuat daftar kelas.");
        }
      };
      fetchClasses();
    } else {
      setAvailableClasses([]);
    }
  }, [isOpen, formData.role]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading('Menyimpan pengguna...');
    try {
      const payload: any = { ...formData };
      if (payload.role !== 'siswa' || !payload.nisn) delete payload.nisn;
      if (payload.role !== 'wali_kelas' || !payload.homeroomClassId) {
        delete payload.homeroomClassId;
      }
      await apiClient.post('/admin/users', payload);
      toast.success('Pengguna baru berhasil ditambahkan!', { id: toastId });
      onUserAdded();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan pengguna.', { id: toastId });
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
        {/* Header Biru Sesuai Permintaan */}
        <header className="flex-shrink-0 bg-blue-800 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h2 className="text-lg font-bold text-white">Tambah Pengguna Baru</h2>
              <button onClick={onClose} className="text-gray-300 hover:text-white transition-colors">
                <CloseIcon />
              </button>
            </div>
          </div>
        </header>

        {/* Body dengan background terang */}
        <main className="flex-grow bg-gray-100 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              <div className="md:col-span-2">
                <label htmlFor="fullName" className={labelClasses}>Nama Lengkap</label>
                <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Masukkan nama lengkap" required className={inputClasses} />
              </div>

              <div>
                <label htmlFor="username" className={labelClasses}>Username</label>
                <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} placeholder="Masukkan username" required className={inputClasses} />
              </div>

              <div>
                <label htmlFor="password" className={labelClasses}>Password</label>
                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Masukkan password" required className={inputClasses} />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="email" className={labelClasses}>Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Masukkan email" required className={inputClasses} />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="role" className={labelClasses}>Peran</label>
                <select id="role" name="role" value={formData.role} onChange={handleChange} className={inputClasses}>
                  <option value="siswa">Siswa</option>
                  <option value="guru">Guru</option>
                  <option value="wali_kelas">Wali Kelas</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Conditional Fields */}
              {formData.role === 'siswa' && (
                <div className="md:col-span-2">
                  <label htmlFor="nisn" className={labelClasses}>NISN (Opsional)</label>
                  <input type="text" id="nisn" name="nisn" value={formData.nisn} onChange={handleChange} placeholder="Masukkan NISN siswa" className={inputClasses} />
                </div>
              )}

              {formData.role === 'wali_kelas' && (
                <div className="md:col-span-2">
                  <label htmlFor="homeroomClassId" className={labelClasses}>Tugaskan ke Kelas</label>
                  <select id="homeroomClassId" name="homeroomClassId" value={formData.homeroomClassId} onChange={handleChange} required className={inputClasses}>
                    <option value="">-- Pilih Kelas --</option>
                    {availableClasses.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="md:col-span-2 flex justify-end gap-4 pt-4 mt-4 border-t border-gray-200">
                <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium">
                  Batal
                </button>
                <button type="submit" disabled={isLoading} className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">
                  {isLoading ? 'Menyimpan...' : 'Simpan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}