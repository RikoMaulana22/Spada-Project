'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';

// Tipe untuk peran agar lebih aman dan mudah dikelola
type UserRole = 'siswa' | 'guru' | 'wali_kelas';

// Komponen untuk menampilkan kartu instruksi (Langkah 1)
const InstructionsCard = () => {
    const templateFileName = 'template_import_pengguna.csv';

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Langkah 1: Siapkan File CSV</h2>
            
            <p className="mb-3 text-gray-600">
                Gunakan format kolom di bawah ini. Isi kolom hanya sesuai dengan peran yang akan diimpor:
            </p>
            <ul className="list-disc list-inside text-sm mb-4 space-y-1 text-gray-500">
                <li>Untuk **Siswa**, kolom `nisn` wajib diisi.</li>
                <li>Untuk **Guru**, `nisn` dan `homeroomClassId` dikosongkan.</li>
                <li>Untuk **Wali Kelas**, `homeroomClassId` wajib diisi (gunakan ID kelas).</li>
            </ul>
            
            <code className="block bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap border border-gray-200 text-gray-700">
                fullName,username,email,password,nisn,homeroomClassId
            </code>
            
            <a href={`/${templateFileName}`} download className="text-blue-600 hover:text-blue-800 hover:underline mt-4 inline-block font-medium transition-colors">
                Download Template Universal
            </a>
        </div>
    );
};

// Komponen untuk menampilkan form unggah (Langkah 2)
const UploadFormCard = ({
    role,
    setRole,
    handleSubmit,
    handleFileChange,
    isLoading,
}: {
    role: UserRole;
    setRole: (role: UserRole) => void;
    handleSubmit: (e: FormEvent) => Promise<void>;
    handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    isLoading: boolean;
}) => {
    const inputClasses = "form-input w-full mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Langkah 2: Unggah File</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="role-select" className="block text-sm font-medium text-gray-700">Impor Sebagai</label>
                    <select 
                        id="role-select"
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className={inputClasses}
                    >
                        <option value="guru">Guru</option>
                        <option value="siswa">Siswa</option>
                        <option value="wali_kelas">Wali Kelas</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">Pilih File CSV</label>
                    <input 
                        id="file-upload"
                        type="file" 
                        onChange={handleFileChange} 
                        accept=".csv" 
                        required
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                </div>
                <div className="pt-2">
                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Memproses..." : "Impor Sekarang"}
                    </button>
                </div>
            </form>
        </div>
    );
};


// Komponen Utama Halaman
export default function BulkImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState<UserRole>('guru');

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
            setFile(null); // Reset state file setelah berhasil
            // Reset input file di form agar bisa memilih file yang sama lagi
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = "";

        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal mengimpor pengguna.", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto text-gray-800 p-4 md:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Impor Pengguna Massal</h1>
                <p className="text-gray-600 mt-1">Buat banyak akun sekaligus dengan mengunggah file CSV.</p>
            </header>
            
            <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <InstructionsCard />
                <UploadFormCard 
                    role={role}
                    setRole={setRole}
                    handleSubmit={handleSubmit}
                    handleFileChange={handleFileChange}
                    isLoading={isLoading}
                />
            </main>
        </div>
    );
}