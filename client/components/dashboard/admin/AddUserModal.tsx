// Path: src/components/dashboard/admin/AddUserModal.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import apiClient from '@/lib/axios';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'role' && value !== 'wali_kelas') {
        setFormData(prev => ({...prev, homeroomClassId: ''}));
    }
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

      if (payload.role !== 'siswa') delete payload.nisn;
      if (payload.role !== 'wali_kelas') delete payload.homeroomClassId;
      
      await apiClient.post('/admin/users', payload);
      toast.success('Pengguna baru berhasil ditambahkan!', { id: toastId });
      onUserAdded();
      handleClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan pengguna.', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialState);
    onClose();
  };

  return (
    <div className='text-gray-900'>
    <Modal isOpen={isOpen} onClose={handleClose} title="Tambah Pengguna Baru">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input untuk fullName, username, password, email */}
        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nama Lengkap" required className="form-input max-w-md p-2 border-2 border-gray-400 rounded-md w-full" />
        <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username" required className="form-input max-w-md p-2 border-2 border-gray-400 rounded-md w-full" />
        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required className="form-input max-w-md p-2 border-2 border-gray-400 rounded-md w-full" />
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="form-input max-w-md p-2 border-2 border-gray-400 rounded-md w-full" />
        
        <div>
          <label className="block text-sm font-medium">Peran</label>
          <select name="role" value={formData.role} onChange={handleChange} className="form-input max-w-md p-2 border-2 border-gray-400 rounded-md w-full">
            <option value="siswa">Siswa</option>
            <option value="guru">Guru</option>
            <option value="wali_kelas">Wali Kelas</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {formData.role === 'siswa' && (
          <div>
            <label className="block text-sm font-medium">NISN (Opsional)</label>
            <input type="text" name="nisn" value={formData.nisn} onChange={handleChange} className="form-input max-w-md p-2 border-2 border-gray-400 rounded-md w-full" />
          </div>
        )}

        {formData.role === 'wali_kelas' && (
          <div>
            <label className="block text-sm font-medium">Tugaskan ke Kelas</label>
            <select name="homeroomClassId" value={formData.homeroomClassId} onChange={handleChange} required className="form-select w-full mt-1">
              <option value="">-- Pilih Kelas --</option>
              {availableClasses.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-4 pt-4 border-t mt-6">
          <button type="button" onClick={handleClose} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? 'Menyimpan...' : 'Simpan Pengguna'}
          </button>
        </div>
      </form>
    </Modal>
    </div>
  );
}