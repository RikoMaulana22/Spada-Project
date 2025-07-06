'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import apiClient from '@/lib/axios';

interface Settings {
    schoolName?: string;
    // Tambahkan pengaturan lain di sini di masa depan
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get('/settings');
            setSettings(response.data);
        } catch (error) {
            console.error("Gagal mengambil pengaturan:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await apiClient.post('/settings', settings);
            alert('Pengaturan berhasil disimpan!');
        } catch (error) {
            alert('Gagal menyimpan pengaturan.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-8">Memuat pengaturan...</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Pengaturan Sistem</h1>
            
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
                <div className="space-y-6">
                    {/* Pengaturan Nama Sekolah */}
                    <div>
                        <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700">
                            Nama Sekolah / Aplikasi
                        </label>
                        <input
                            type="text"
                            id="schoolName"
                            name="schoolName"
                            value={settings.schoolName || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                        <p className="mt-2 text-xs text-gray-500">Nama ini akan ditampilkan di header dan judul halaman.</p>
                    </div>

                    {/* Tambahkan pengaturan lain di sini nanti */}

                </div>
                <div className="mt-8 pt-5 border-t">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                    </button>
                </div>
            </form>
        </div>
    );
}