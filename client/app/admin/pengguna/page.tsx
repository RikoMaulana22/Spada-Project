'use client';

import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import apiClient from '@/lib/axios';
import { User } from '@/types';
import Link from 'next/link'; // <-- 1. Impor komponen Link
import toast from 'react-hot-toast';
import AddUserModal from '@/components/dashboard/admin/AddUserModal';
import EditUserModal from '@/components/dashboard/admin/EditUserModal';

export default function ManageUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterRole, setFilterRole] = useState<'semua' | 'guru' | 'siswa'>('semua');

    // State untuk mengontrol modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const url = filterRole === 'semua' ? '/admin/users' : `/admin/users?role=${filterRole}`;
        try {
            const response = await apiClient.get(url);
            setUsers(response.data);
        } catch (error) {
            console.error("Gagal mengambil data pengguna:", error);
            toast.error('Gagal memuat data pengguna.');
        } finally {
            setIsLoading(false);
        }
    }, [filterRole]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (userId: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            const loadingToast = toast.loading('Menghapus pengguna...');
            try {
                await apiClient.delete(`/admin/users/${userId}`);
                toast.success('Pengguna berhasil dihapus.', { id: loadingToast });
                fetchData();
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Gagal menghapus pengguna.', { id: loadingToast });
            }
        }
    };

    return (
        <>
            {/* Render Kedua Modal */}
            <AddUserModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onUserAdded={fetchData} 
            />
            <EditUserModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={selectedUser}
                onUserUpdated={fetchData}
            />

            <div className="container mx-auto p-4 md:p-8 text-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl text-gray-800 font-bold">Manajemen Pengguna</h1>
                    <Link 
                        href="/admin/users/import"
                        className="btn-secondary whitespace-nowrappx-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-green-700" // Gunakan style sekunder
                    >
                        Impor Massal
                    </Link>
                    <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                        + Tambah Pengguna
                    </button>
                </div>

                

                <div className="mb-4 text-gray-600">
                    <select 
                        value={filterRole} 
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterRole(e.target.value as any)}
                        className="p-2 border rounded-md"
                    >
                        <option value="semua">Semua Peran</option>
                        <option value="guru">Guru</option>
                        <option value="siswa">Siswa</option>
                         <option value="wali_kelas">Wali Kelas</option>
                    </select>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
    <table className="w-full text-left text-gray-800 border border-gray-300">
        <thead>
            <tr className="bg-yellow-200 text-gray-700 border font-bold font-large text-left text-l uppercase">
                <th className="py-2 px-3 border border-gray-300">Nama Lengkap</th>
                <th className="py-2 px-3 border border-gray-300">Username</th>
                <th className="py-2 px-3 border border-gray-300">Peran</th>
                <th className="py-2 px-3 border border-gray-300">Aksi</th>
            </tr>
        </thead>
        <tbody>
            {isLoading ? (
                <tr>
                    <td colSpan={4} className="py-4 text-center border border-gray-300">Memuat data...</td>
                </tr>
            ) : users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-3 px-3 border border-gray-300">{user.fullName}</td>
                    <td className="py-3 px-3 border border-gray-300">{user.username}</td>
                    <td className="py-3 px-3 border border-gray-300 capitalize">{user.role}</td>
                    <td className="py-3 px-3 border border-gray-300">
                        <button onClick={() => handleEdit(user)} className="text-blue-600 hover:underline mr-4">Edit</button>
                        <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:underline">Hapus</button>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
</div>

            </div>
        </>
    );
}