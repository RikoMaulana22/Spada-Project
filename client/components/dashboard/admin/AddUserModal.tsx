'use client';

import { useState, FormEvent } from 'react';
import apiClient from '@/lib/axios';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void; // Untuk me-refresh data di halaman utama
}

// State awal untuk form
const initialState = {
    fullName: '',
    username: '',
    password: '',
    role: 'siswa', // Default role
    nisn: ''
};

export default function AddUserModal({ isOpen, onClose, onUserAdded }: AddUserModalProps) {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setError(null);
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
        // Buat payload, hapus nisn jika peran bukan siswa
        const payload = { ...formData };
        if (payload.role !== 'siswa') {
            delete (payload as any).nisn;
        }

      await apiClient.post('/admin/users', payload);
      toast.success('Pengguna baru berhasil ditambahkan!');
      onUserAdded(); // Panggil fungsi refresh
      handleClose(); // Tutup dan reset modal
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menambahkan pengguna.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialState); // Reset form saat ditutup
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Tambah Pengguna Baru">
      <form onSubmit={handleSubmit} className="space-y-4 text-gray-700">
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        
        <div>
          <label className="block text-sm font-medium">Nama Lengkap</label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="form-input w-full mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">Username</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required className="form-input w-full mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required className="form-input w-full mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">Peran</label>
            <select name="role" value={formData.role} onChange={handleChange} className="form-select w-full mt-1">
                <option value="siswa">Siswa</option>
                <option value="guru">Guru</option>
            </select>
        </div>

        {/* Tampilkan input NISN hanya jika peran adalah siswa */}
        {formData.role === 'siswa' && (
            <div>
                <label className="block text-sm font-medium">NISN (Opsional)</label>
                <input type="text" name="nisn" value={formData.nisn} onChange={handleChange} className="form-input w-full mt-1" />
            </div>
        )}

        <div className="flex justify-end gap-4 pt-4 border-t mt-6">
          <button type="button" onClick={handleClose} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
            {isLoading ? 'Menyimpan...' : 'Simpan Pengguna'}
          </button>
        </div>
      </form>
    </Modal>
  );
}