'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Settings } from '@/types';
import Image from 'next/image';

// --- STYLING TERPUSAT UNTUK FORM INPUT ---
// Menambahkan 'border border-gray-300' untuk memberikan garis tepi
const inputBaseClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
const fileInputClasses = "mt-1 block w-full text-sm text-gray-500 border border-gray-300 rounded-md cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100";


// Komponen Form terpisah untuk kerapian
const SettingInput = ({ label, id, value, onChange, helpText }: any) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        {/* Menggunakan styling terpusat */}
        <input type="text" id={id} name={id} value={value || ''} onChange={onChange} className={inputBaseClasses}/>
        <p className="mt-2 text-xs text-gray-500">{helpText}</p>
    </div>
);

const SettingTextarea = ({ label, id, value, onChange, helpText }: any) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        {/* Menggunakan styling terpusat */}
        <textarea id={id} name={id} value={value || ''} onChange={onChange} rows={4} className={inputBaseClasses}/>
        <p className="mt-2 text-xs text-gray-500">{helpText}</p>
    </div>
);

const SettingImageUpload = ({ label, id, preview, onChange, helpText }: any) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        {preview && <Image src={preview} alt={`Preview ${label}`} width={200} height={100} className="my-2 p-2 border rounded-md object-contain"/>}
        {/* Menggunakan styling terpusat */}
        <input type="file" id={id} name={id} onChange={onChange} accept="image/png, image/jpeg, image/svg+xml, image/webp" className={fileInputClasses}/>
        <p className="mt-2 text-xs text-gray-500">{helpText}</p>
    </div>
);


export default function SettingsPage() {
    const { settings: initialSettings, refetchSettings, isLoading: isAuthLoading } = useAuth();
    const [settings, setSettings] = useState<Settings>({});
    const [isSaving, setIsSaving] = useState(false);
    
    const [files, setFiles] = useState<{ [key: string]: File | null }>({});
    const [previews, setPreviews] = useState<{ [key: string]: string | null }>({});

    useEffect(() => {
        if (initialSettings) {
            setSettings(initialSettings);
            setPreviews({
                headerLogo: initialSettings.headerLogo || null,
                loginLogo: initialSettings.loginLogo || null,
                homeHeroImage: initialSettings.homeHeroImage || null,
            });
        }
    }, [initialSettings]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, files: inputFiles } = e.target;
        if (inputFiles && inputFiles[0]) {
            const file = inputFiles[0];
            setFiles(prev => ({ ...prev, [name]: file }));
            setPreviews(prev => ({ ...prev, [name]: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const toastId = toast.loading('Menyimpan pengaturan...');
        
        const formData = new FormData();
        Object.entries(settings).forEach(([key, value]) => {
            if(value) formData.append(key, value);
        });
        Object.entries(files).forEach(([key, file]) => {
            if (file) formData.append(key, file);
        });

        try {
            await apiClient.post('/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await refetchSettings();
            toast.success('Pengaturan berhasil disimpan!', { id: toastId });
        } catch (error) {
            toast.error('Gagal menyimpan pengaturan.', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    if (isAuthLoading) {
        return <div className="p-8">Memuat pengaturan...</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8 text-gray-800">
            <h1 className="text-3xl font-bold mb-2">Pengaturan Sistem</h1>
            <p className="text-gray-600 mb-6">Sesuaikan tampilan dan konten aplikasi dari sini.</p>
            
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-3xl border border-gray-200">
                <div className="space-y-8 divide-y divide-gray-200">
                    {/* Bagian Pengaturan Umum */}
                    <div className="pt-4 space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Pengaturan Umum</h3>
                        <SettingInput id="schoolName" label="Nama Sekolah / Aplikasi" value={settings.schoolName} onChange={handleInputChange} helpText="Tampil di header utama."/>
                        <SettingImageUpload id="headerLogo" label="Logo Header" preview={previews.headerLogo} onChange={handleFileChange} helpText="Logo di pojok kiri atas halaman."/>
                        <SettingImageUpload id="loginLogo" label="Logo Halaman Login" preview={previews.loginLogo} helpText="Logo di halaman login Wali Kelas."/>
                    </div>

                    {/* Bagian Halaman Depan */}
                    <div className="pt-8 space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Halaman Depan (Beranda)</h3>
                        <SettingInput id="homeHeroTitle" label="Judul Utama (Headline)" value={settings.homeHeroTitle} onChange={handleInputChange} helpText="Teks besar yang pertama kali dilihat pengunjung."/>
                        <SettingTextarea id="homeHeroSubtitle" label="Subjudul / Paragraf Deskripsi" value={settings.homeHeroSubtitle} onChange={handleInputChange} helpText="Paragraf singkat di bawah judul utama."/>
                        <SettingImageUpload id="homeHeroImage" label="Gambar Utama" preview={previews.homeHeroImage} onChange={handleFileChange} helpText="Gambar yang tampil di samping teks pada halaman depan."/>
                    </div>
                     {/* Bagian Profile Sekolah */}
                     <div className="pt-8 space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Profil Sekolah</h3>
                        <SettingTextarea id="schoolProfile" label="Profil Singkat Sekolah" value={settings.schoolProfile} onChange={handleInputChange} helpText="Tampilkan profil atau sejarah singkat sekolah di halaman depan."/>
                    </div>
                     {/* Bagian Footer */}
                     <div className="pt-8 space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Footer</h3>
                        <SettingInput id="footerText" label="Teks Footer" value={settings.footerText} onChange={handleInputChange} helpText="Teks yang akan ditampilkan di bagian bawah setiap halaman."/>
                    </div>
                </div>

                <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end">
                    <button type="submit" disabled={isSaving} className="btn-primary">
                        {isSaving ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}
                    </button>
                </div>
            </form>
        </div>
    );
}