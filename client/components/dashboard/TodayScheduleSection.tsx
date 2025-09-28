'use client';

import { FaClock } from 'react-icons/fa';

// Definisikan tipe data yang diterima oleh komponen ini
// Pastikan ini cocok dengan data yang dikirim oleh API /schedules/my
interface ScheduleItem {
    id: number;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    class: { name: string };
    subject: { name: string };
}

interface TodayScheduleProps {
    schedules: ScheduleItem[];
    isLoading: boolean;
}

// Komponen Skeleton untuk loading
const ScheduleSkeleton = () => (
    <div className="p-3 bg-gray-200 rounded-md animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-3/4"></div>
    </div>
);

export default function TodayScheduleSection({ schedules, isLoading }: TodayScheduleProps) {
    // Array nama hari dalam bahasa Indonesia untuk mencocokkan dengan enum Prisma
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    // Dapatkan nama hari ini, contoh: "Senin"
    const todayName = dayNames[new Date().getDay()].toUpperCase(); // Ubah ke uppercase agar cocok dengan enum 'SENIN'

    // Filter jadwal untuk menampilkan hanya jadwal hari ini
    const todaySchedules = schedules.filter(s => s.dayOfWeek.toUpperCase() === todayName);

    // Jangan tampilkan section sama sekali jika sedang tidak loading dan tidak ada jadwal hari ini
    if (!isLoading && todaySchedules.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Jadwal Hari Ini</h2>
                <p className="text-sm text-gray-500">Tidak ada jadwal untuk hari ini. Selamat beristirahat!</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-blue-900 border-b-2 border-yellow-400 pb-2 mb-4">Jadwal Hari Ini ({dayNames[new Date().getDay()]})</h2>
            <div className="space-y-3">
                {isLoading ? (
                    // Tampilkan skeleton saat loading
                    <>
                        <ScheduleSkeleton />
                        <ScheduleSkeleton />
                    </>
                ) : (
                    // Tampilkan jadwal hari ini jika ada
                    todaySchedules.map(schedule => (
                        <div key={schedule.id} className="flex items-center gap-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-md">
                            <FaClock className="text-blue-500" />
                            <div>
                                <p className="font-bold text-gray-800">{schedule.startTime} - {schedule.endTime}</p>
                                <p className="text-sm text-gray-600">{schedule.subject.name} - <span className="italic">{schedule.class.name}</span></p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}