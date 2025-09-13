'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // <-- Impor useAuth
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import ScheduleModal from '@/components/schedule/ScheduleModal';
import Image from 'next/image';

export default function HomePage() {
    const { settings, isLoading } = useAuth(); // <-- Ambil settings dari context
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [scheduleData] = useState(null);

   

    // Tampilkan loading jika data settings belum siap
    if (isLoading) {
        return <div className="text-center p-12">Memuat halaman...</div>;
    }

    return (
        <>
            <ScheduleModal 
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                scheduleData={scheduleData}
            />

            <div className="space-y-12 text-gray-800">
                {/* HERO SECTION */}
                <section className="flex flex-col md:flex-row items-center bg-white p-8 rounded-lg">
                    <div className="md:w-1/2 space-y-5">
                        <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                            {/* Teks dinamis dari settings, dengan fallback */}
                            {settings?.homeHeroTitle || "Selamat Datang di Sistem Pembelajaran Daring"}
                        </h1>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            {/* Teks dinamis dari settings, dengan fallback */}
                            {settings?.homeHeroSubtitle || "Platform ini dirancang untuk mempermudah proses belajar mengajar antara guru dan siswa secara online. Dengan sistem yang terintegrasi, siswa dapat mengakses materi pembelajaran, mengerjakan tugas, serta melihat jadwal pelajaran kapan saja dan di mana saja."}
                        </p>
                        
                       
                    </div>
                    
                    <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center md:justify-end">
                        <Image
                            // Gambar dinamis dari settings, dengan fallback
                            src={settings?.homeHeroImage || "/images/pngtoga.png"}
                            alt="Siswa Belajar Online"
                            width={500}
                            height={350}
                            className="rounded-lg object-cover"
                            priority
                        />
                    </div>
                </section>

                 {/* PROFILE SECTION */}
                 {settings?.schoolProfile && (
                    <section className="bg-white p-8 rounded-lg">
                         <h2 className="text-3xl font-bold text-gray-900 mb-4">Profil Sekolah</h2>
                         {/* Tampilkan profil sekolah, ubah baris baru menjadi paragraf */}
                         <div className="prose max-w-none text-gray-600">
                             {settings.schoolProfile.split('\n').map((paragraph, index) => (
                                 <p key={index}>{paragraph}</p>
                             ))}
                         </div>
                    </section>
                )}
            </div>
        </>
    );
}