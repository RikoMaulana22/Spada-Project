'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/axios';
import { User } from '@/types'; // Asumsikan tipe User sudah ada

// TODO: Buat komponen modal ini di file terpisah nanti
// import AddUserModal from '@/components/admin/AddUserModal';
// import EditUserModal from '@/components/admin/EditUserModal';

export default function ManageUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterRole, setFilterRole] = useState<'semua' | 'guru' | 'siswa'>('semua');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
// Kembalikan ke 'users' agar cocok dengan API di backend
        const url = filterRole === 'semua' ? '/admin/users' : `/admin/users?role=${filterRole}`;
        try {
            const response = await apiClient.get(url);
            setUsers(response.data);
        } catch (error) {
            console.error("Gagal mengambil data pengguna:", error);
        } finally {
            setIsLoading(false);
        }
    }, [filterRole]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async (userId: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            try {
                await apiClient.delete(`/admin/users/${userId}`);
                alert('Pengguna berhasil dihapus.');
                fetchData(); // Refresh data
            } catch (error) {
                alert('Gagal menghapus pengguna.');
                console.error(error);
            }
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl text-gray-800 font-bold">Manajemen Pengguna</h1>
                <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                    + Tambah Pengguna
                </button>
            </div>

            {/* Filter */}
            <div className="mb-4 text-gray-600">
                <select 
                    value={filterRole} 
                    onChange={(e) => setFilterRole(e.target.value as any)}
                    className="p-2 border rounded-md"
                >
                    <option value="semua">Semua Peran</option>
                    <option value="guru">Guru</option>
                    <option value="siswa">Siswa</option>
                </select>
            </div>

            {/* Tabel Pengguna */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <table className="w-full text-left text-gray-800">
                    <thead>
                        <tr className="border-b">
                            <th className="py-2">Nama Lengkap</th>
                            <th className="py-2">Username</th>
                            <th className="py-2">Peran</th>
                            <th className="py-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={4} className="py-4 text-center">Memuat data...</td></tr>
                        ) : users.map(user => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                <td className="py-3">{user.fullName}</td>
                                <td className="py-3">{user.username}</td>
                                <td className="py-3 capitalize">{user.role}</td>
                                <td className="py-3">
                                    <button className="text-blue-600 hover:underline mr-4">Edit</button>
                                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:underline">Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}