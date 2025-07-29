'use client';

import { useState } from 'react';
import apiClient from '@/lib/axios'; // <-- Impor apiClient
import toast from 'react-hot-toast'; // <-- Impor toast
import ScheduleModal from '@/components/schedule/ScheduleModal'; // <-- Impor modal baru
import Image from 'next/image'; // <-- Tambahkan impor Image dari next/image

export default function HomePage() {
    // --- TAMBAHKAN STATE BARU DI SINI ---
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [scheduleData, setScheduleData] = useState(null);
    const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);

    // --- TAMBAHKAN FUNGSI BARU DI SINI ---
    const handleShowSchedule = async () => {
        setIsLoadingSchedule(true);
        try {
            const response = await apiClient.get('/schedules/public');
            setScheduleData(response.data);
            setIsScheduleModalOpen(true);
        } catch (error) {
            toast.error("Gagal memuat jadwal pelajaran.");
        } finally {
            setIsLoadingSchedule(false);
        }
    };

    return (
        <>
            {/* Render modal di sini */}
            <ScheduleModal 
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                scheduleData={scheduleData}
            />

            <div className="space-y-10 text-gray-800">
                <section className="flex flex-col md:flex-row items-center bg-white p-8 ...">
                    <div className="md:w-1/2 space-y-4">
                        <h1 className="text-3xl font-bold ...">
                            Selamat Datang di Sistem Pembelajaran Daring
                        </h1>
                        <p className="text-gray-700 text-lg leading-relaxed"><strong>SMPN Satu Atap 1 Way Tenong</strong>.
                        Platform ini dirancang untuk mempermudah proses belajar mengajar antara guru dan siswa secara online.
                        Dengan sistem yang terintegrasi, siswa dapat mengakses materi pembelajaran, mengerjakan tugas, mengikuti ujian,
                        serta melihat jadwal pelajaran kapan saja dan di mana saja.
                        </p>
                        
                        {/* ... */}
                        <div className="flex space-x-4">
                            {/* --- UBAH TOMBOL INI --- */}
                            <button 
                                onClick={handleShowSchedule}
                                disabled={isLoadingSchedule}
                                className="bg-blue-500 font-bold text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
                            >
                                {isLoadingSchedule ? 'Memuat...' : 'Lihat Jadwal Pelajaran'}
                            </button>
                        </div>
                    </div>
                    {/* ... */}
                    {/* --- 2. TAMBAHKAN GAMBAR DI SINI --- */}
                    <div className="md:w-1/2 mt-8 md:mt-0 md:pl-16">
                        <Image
                            src="/images/pngtoga.png" // Ganti dengan path gambar Anda
                            alt="Siswa Belajar Online"
                            width={500}
                            height={350}
                            className="rounded-lg"
                            priority
                        />
                    </div>
                </section>
                {/* ... */}
            </div>
        </>
    );
}