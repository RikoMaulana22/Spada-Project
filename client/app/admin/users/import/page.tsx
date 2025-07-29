'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';

export default function BulkImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    // Tambahkan 'wali_kelas' sebagai pilihan peran
    const [role, setRole] = useState<'siswa' | 'guru' | 'wali_kelas'>('guru');

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error("Silakan pilih file CSV terlebih dahulu.");
            return;
        }
        setIsLoading(true);
        const toastId = toast.loading("Mengunggah dan memproses file...");
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('role', role);

        try {
            const response = await apiClient.post('/admin/users/bulk', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success(response.data.message, { id: toastId, duration: 5000 });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal mengimpor pengguna.", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto text-gray-800 p-4 md:p-8">
            <h1 className="text-3xl font-bold">Impor Pengguna Massal</h1>
            <p className="text-gray-600 mb-6">Buat banyak akun sekaligus dengan mengunggah file CSV.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Langkah 1: Siapkan File CSV</h2>
                    
                    {/* Instruksi dinamis berdasarkan peran */}
                    {role === 'wali_kelas' ? (
                        <>
                            <p className="mb-2">Gunakan format kolom berikut. Kolom `homeroomClassId` **wajib diisi**.</p>
                            <code className="block bg-gray-100 p-2 rounded text-sm whitespace-pre">
                                fullName,username,email,password,homeroomClassId
                            </code>
                        </>
                    ) : (
                        <>
                           <p className="mb-2">Gunakan format kolom berikut. Kolom `nisn` **wajib diisi jika Anda mengimpor siswa**.</p>
                            <code className="block bg-gray-100 p-2 rounded text-sm whitespace-pre">
                                fullName,username,email,password,nisn
                            </code>
                        </>
                    )}
                    
                    <a href="/contoh-import-guru.csv" download className="text-blue-600 hover:underline mt-2 inline-block">
                        Download Template Contoh
                    </a>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Langkah 2: Unggah File</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Impor Sebagai</label>
                            <select 
                                value={role}
                                onChange={(e) => setRole(e.target.value as any)}
                                className="form-select w-full mt-1"
                            >
                                <option value="guru">Guru</option>
                                <option value="siswa">Siswa</option>
                                <option value="wali_kelas">Wali Kelas</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Pilih File CSV</label>
                            <input 
                                type="file" 
                                onChange={handleFileChange} 
                                accept=".csv" 
                                required
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                        <div className="mt-6">
                            <button type="submit" disabled={isLoading} className="btn-primary w-full">
                                {isLoading ? "Memproses..." : "Impor Sekarang"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}