'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';
import { User } from '@/types';
import Link from 'next/link'; // <-- 1. Impor komponen Link

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // State untuk modal tambah user akan kita gunakan nanti
    // const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await apiClient.get('/admin/users');
                setUsers(response.data);
            } catch (error) {
                console.error("Gagal mengambil data pengguna:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (isLoading) return <div className="p-8 text-center">Memuat Pengguna...</div>;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manajemen Pengguna</h1>
                
                {/* --- 2. Tambahkan tombol di sini --- */}
                <div className="flex gap-2">
                    <Link 
                        href="/admin/users/import"
                        className="btn-secondary whitespace-nowrap" // Gunakan style sekunder
                    >
                        Impor Massal
                    </Link>
                    <button className="btn-primary">+ Tambah Pengguna</button>
                </div>

            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Nama Lengkap</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Username</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Peran</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Tanggal Daftar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{user.fullName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap capitalize">{user.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(user.createdAt!).toLocaleDateString('id-ID')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}