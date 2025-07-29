'use client';

import { useState, FormEvent, useEffect } from 'react';
import apiClient from '@/lib/axios';
import Modal from '@/components/ui/Modal';
import { User } from '@/types';
import toast from 'react-hot-toast';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: () => void;
}

export default function EditUserModal({ isOpen, onClose, user, onUserUpdated }: EditUserModalProps) {
  const [formData, setFormData] = useState({ fullName: '', username: '', role: 'siswa', nisn: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
        role: user.role || 'siswa',
        nisn: user.nisn || '',
        password: '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    const loadingToast = toast.loading('Memperbarui data...');
    try {
      const dataToUpdate = { ...formData };
      if (!dataToUpdate.password) delete (dataToUpdate as any).password;
      if (dataToUpdate.role !== 'siswa') delete (dataToUpdate as any).nisn;

      await apiClient.put(`/admin/users/${user.id}`, dataToUpdate);
      toast.success('Data berhasil diperbarui!', { id: loadingToast });
      onUserUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui data.', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-gray-800">
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Pengguna: ${user?.fullName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form fields are similar to AddUserModal */}
        <div>
          <label className="block text-sm font-medium">Nama Lengkap</label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="form-input mt-1 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Username</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required className="form-input mt-1 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Peran</label>
            <select name="role" value={formData.role} onChange={handleChange} className="form-select mt-1 w-full">
                <option value="siswa">Siswa</option>
                <option value="guru">Guru</option>
                <option value="wali_kelas">Wali Kelas</option>
            </select>
        </div>
        {formData.role === 'siswa' && (
            <div>
                <label className="block text-sm font-medium">NISN (Opsional)</label>
                <input type="text" name="nisn" value={formData.nisn || ''} onChange={handleChange} className="form-input mt-1 w-full" />
            </div>
        )}
        <div>
          <label className="block text-sm font-medium">Password Baru (Opsional)</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-input mt-1 w-full" placeholder="Kosongkan jika tidak diubah" />
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </Modal>
    </div>
  );
}