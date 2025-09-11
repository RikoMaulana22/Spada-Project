'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import apiClient from '@/lib/axios';
import { FaTrash, FaBullhorn } from 'react-icons/fa';

interface Announcement {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    author: { fullName: string };
}

export default function ManageAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // State untuk form
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get('/announcements/all'); // Panggil endpoint admin
            setAnnouncements(response.data);
        } catch (error) {
            console.error("Gagal mengambil data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiClient.post('/announcements', { title, content });
            alert('Pengumuman berhasil dibuat!');
            setTitle('');
            setContent('');
            fetchData();
        } catch (error) {
            alert('Gagal membuat pengumuman.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async (id: number) => {
        if (window.confirm('Yakin ingin menghapus pengumuman ini?')) {
            try {
                await apiClient.delete(`/announcements/${id}`);
                alert('Pengumuman berhasil dihapus.');
                fetchData();
            } catch (error) {
                alert('Gagal menghapus pengumuman.');
            }
        }
    };

    return (
        <div className="container mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 text-gray-800">
            {/* Kolom Kiri: Form Buat Pengumuman */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Buat Pengumuman Baru</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium border-gray-500">Judul</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="form-input w-full mt-1 py-2 px-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium border-gray-500">Isi Pengumuman</label>
                            <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={8} className="form-textarea w-full mt-1 py-2 px-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"></textarea>
                        </div>
                        <div className="text-right">
                            <button type="submit" disabled={isSubmitting} className="w-full px-6 py-2 bg-blue-600 border-gray-500 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                                {isSubmitting ? 'Mengirim...' : 'Kirim Pengumuman'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Kolom Kanan: Daftar Pengumuman */}
            <div className="lg:col-span-2">
                 <h2 className="text-xl font-bold mb-4 text-gray-800">Daftar Pengumuman</h2>
                 <div className="space-y-4">
                    {isLoading ? <p>Memuat...</p> : announcements.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-lg shadow-md">
                           <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg">{item.title}</h3>
                                    <p className="text-xs text-gray-500">Oleh {item.author.fullName} - {new Date(item.createdAt).toLocaleString('id-ID')}</p>
                                    <p className="mt-2 text-gray-700">{item.content}</p>
                                </div>
                                <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-600 ml-4"><FaTrash /></button>
                           </div>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
}