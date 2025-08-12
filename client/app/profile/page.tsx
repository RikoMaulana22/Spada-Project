// Path: src/app/profile/page.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import { FaUserEdit, FaLock, FaChevronLeft } from 'react-icons/fa';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, revalidateUser } = useAuth(); // Ambil fungsi revalidateUser dari context

  // State untuk form update profil
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);

  // State untuk form ubah password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  // Isi form dengan data user saat komponen dimuat
  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
    }
  }, [user]);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setIsProfileSubmitting(true);
    const toastId = toast.loading('Memperbarui profil...');
    
    try {
      await apiClient.put('/users/profile', { fullName });
      toast.success('Profil berhasil diperbarui!', { id: toastId });
      revalidateUser(); // Panggil fungsi untuk memperbarui data user di context
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil.', { id: toastId });
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Password baru dan konfirmasi password tidak cocok.');
      return;
    }
    
    setIsPasswordSubmitting(true);
    const toastId = toast.loading('Mengubah password...');

    try {
      await apiClient.put('/users/change-password', { currentPassword, newPassword });
      toast.success('Password berhasil diubah!', { id: toastId });
      // Kosongkan field password setelah berhasil
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengubah password.', { id: toastId });
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  if (!user) {
    return <div className="text-center text-gray-400 p-8">Memuat data pengguna...</div>;
  }

  return (
    <div className="space-y-12 text-gray-800 p-8">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-700 font-semibold hover:underline">
                <FaChevronLeft />
                <span>Kembali ke Dashboard</span>
            </Link>
      <h1 className="text-3xl font-bold text-gray-800">Profil Saya</h1>

      {/* Form Update Profil */}
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center gap-3"><FaUserEdit /> Informasi Pribadi</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600">Nama Lengkap</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="form-input mt-1 w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              disabled // Email biasanya tidak bisa diubah
              className="form-input mt-1 w-full bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={isProfileSubmitting} 
              className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
            >
              {isProfileSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>

      {/* Form Ubah Password */}
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center gap-3"><FaLock /> Ubah Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600">Password Saat Ini</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="form-input border mt-1 w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm border font-medium text-gray-600">Password Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-input border mt-1 w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Konfirmasi Password Baru</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input border mt-1 w-full"
              required
            />
          </div>
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={isPasswordSubmitting} 
              className="px-4 py-2 bg-green-600 text-white font-semibold 
              rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
            >
              {isPasswordSubmitting ? 'Menyimpan...' : 'Ubah Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}