'use client';
import { Html, Head, Main, NextScript } from 'next/document'

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ScheduleModal from '@/components/schedule/ScheduleModal';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BookOpen, ClipboardCheck, CalendarDays, Building2 } from 'lucide-react';

export default function HomePage() {
    const { settings, isLoading } = useAuth();
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [scheduleData] = useState(null);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-500"></div>
                <p className="mt-4 text-lg text-slate-600">Memuat Halaman...</p>
            </div>
        );
    }

    return (
        <>
            <ScheduleModal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                scheduleData={scheduleData}
            />

            <div className="bg-slate-50 text-slate-800 w-full">
                {/* HERO SECTION */}
                <section className="relative w-full">
                    <div className="w-full bg-indigo-600">
                        <div className="container mx-auto px-6 py-24">
                            <div className="grid md:grid-cols-2 gap-12 items-center w-full">
                                {/* Kolom Teks */}
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.7, ease: "easeOut" }}
                                    className="text-white"
                                >
                                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                                        {/* Teks ini dinamis dari admin, dengan fallback */}
                                        {settings?.homeHeroTitle || "Selamat Datang di Sistem Pembelajaran Daring"}
                                    </h1>
                                    <p className="mt-4 text-lg text-indigo-200 leading-relaxed text-justify">
                                        {/* Teks ini dinamis dari admin, dengan fallback */}
                                        {settings?.homeHeroSubtitle || "Platform ini dirancang untuk mempermudah proses belajar mengajar antara guru dan siswa secara online. Dengan sistem yang terintegrasi, siswa dapat mengakses materi pembelajaran, mengerjakan tugas, serta melihat jadwal pelajaran kapan saja dan di mana saja."}
                                    </p>
                                </motion.div>

                                {/* Kolom Gambar */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                                    className="mt-12 md:mt-0 flex justify-center"
                                >
                                    <div className="relative w-80 h-80 lg:w-96 lg:h-96">
                                        <Image
                                            // Gambar ini dinamis dari admin, dengan fallback
                                            src={settings?.homeHeroImage || "/logosekolah.svg"}
                                            alt="Siswa Belajar Online"
                                            fill
                                            className="object-contain" // object-contain lebih baik untuk gambar seperti ini
                                            priority
                                        />
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FITUR */}
                

                {/* PROFIL SEKOLAH */}
                {settings?.schoolProfile && (
                    <section className="py-20 bg-white w-full">
                        <div className="container mx-auto px-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="text-center"
                            >
                                <div className="inline-flex items-center gap-3 mb-4">
                                    <Building2 className="w-8 h-8 text-indigo-500" />
                                    <h2 className="text-3xl font-bold">Profil Sekolah</h2>
                                </div>
                                <div className="prose prose-lg max-w-3xl mx-auto text-slate-600 text-left">
                                    {/* Teks profil ini juga dinamis dari admin */}
                                    {settings.schoolProfile.split('\n').map((paragraph, index) => (
                                        paragraph && <p key={index}>{paragraph}</p>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}