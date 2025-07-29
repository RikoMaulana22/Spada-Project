// Path: server/src/controllers/schedule.controller.ts
import { Request,Response } from 'express';
import { PrismaClient, DayOfWeek } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// Admin membuat jadwal baru (tidak berubah, sudah baik)
export const createSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
    const { classId, subjectId, teacherId, dayOfWeek, startTime, endTime } = req.body;
    if (!classId || !subjectId || !teacherId || !dayOfWeek || !startTime || !endTime) {
        res.status(400).json({ message: 'Semua field wajib diisi.' });
        return;
    }
    try {
        const newSchedule = await prisma.schedule.create({
            data: {
                classId: Number(classId),
                subjectId: Number(subjectId),
                teacherId: Number(teacherId),
                dayOfWeek: dayOfWeek as DayOfWeek,
                startTime,
                endTime,
            }
        });
        res.status(201).json(newSchedule);
    } catch (error) {
        console.error("Gagal membuat jadwal:", error);
        res.status(500).json({ message: 'Gagal membuat jadwal.' });
    }
};

// Mengambil jadwal untuk satu kelas spesifik (tidak berubah, sudah baik)
export const getSchedulesByClass = async (req: AuthRequest, res: Response): Promise<void> => {
    const { classId } = req.params;
    try {
        const schedules = await prisma.schedule.findMany({
            where: { classId: Number(classId) },
            include: {
                subject: { select: { name: true } },
                teacher: { select: { fullName: true } }
            },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
        });
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil jadwal.' });
    }
};

export const getPublicSchedules = async (req: Request, res: Response) => {
    try {
        const schedules = await prisma.schedule.findMany({
            // Ambil juga data relasinya
            include: {
                class: { select: { name: true } },
                subject: { select: { name: true } },
                teacher: { select: { fullName: true } }
            },
            // Urutkan berdasarkan hari lalu jam mulai
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' }
            ]
        });

        // Kelompokkan jadwal berdasarkan hari
        const groupedSchedules = schedules.reduce((acc, schedule) => {
            const day = schedule.dayOfWeek;
            if (!acc[day]) {
                acc[day] = [];
            }
            acc[day].push(schedule);
            return acc;
        }, {} as Record<string, typeof schedules>);

        res.json(groupedSchedules);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data jadwal." });
    }
};

// Admin menghapus jadwal (tidak berubah, sudah baik)
export const deleteSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.schedule.delete({ where: { id: Number(id) } });
        res.status(200).json({ message: "Jadwal berhasil dihapus." });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus jadwal.' });
    }
};


// --- MODIFIKASI: FUNGSI-FUNGSI BARU DI BAWAH INI ---

// Admin mengambil SEMUA jadwal untuk halaman manajemen utama
export const getAllSchedules = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const schedules = await prisma.schedule.findMany({
            include: {
                class: { select: { name: true } },
                subject: { select: { name: true } },
                teacher: { select: { fullName: true } }
            },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
        });
        res.status(200).json(schedules);
    } catch (error) {
        console.error("Gagal mengambil semua jadwal:", error);
        res.status(500).json({ message: 'Gagal mengambil semua jadwal.' });
    }
};

// Siswa atau Guru mengambil jadwal personal mereka
export const getMySchedule = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId || !role) {
        res.status(401).json({ message: 'Otentikasi diperlukan.' });
        return;
    }

    try {
        let schedules;
        if (role === 'guru') {
            // Jika guru, ambil jadwal berdasarkan teacherId
            schedules = await prisma.schedule.findMany({
                where: { teacherId: userId },
                include: { class: true, subject: true },
                orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
            });
        } else { // Jika siswa
            // 1. Cari semua kelas yang diikuti siswa
            const studentMemberships = await prisma.class_Members.findMany({
                where: { studentId: userId },
                select: { classId: true }
            });
            const enrolledClassIds = studentMemberships.map(m => m.classId);

            // 2. Ambil semua jadwal dari kelas-kelas tersebut
            schedules = await prisma.schedule.findMany({
                where: { classId: { in: enrolledClassIds } },
                include: { class: true, subject: true, teacher: { select: { fullName: true } } },
                orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
            });
        }
        res.status(200).json(schedules);
    } catch (error) {
        console.error("Gagal mengambil jadwal personal:", error);
        res.status(500).json({ message: 'Gagal mengambil jadwal Anda.' });
    }
};

// Admin mengupdate jadwal yang ada
export const updateSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { dayOfWeek, startTime, endTime, classId, subjectId, teacherId } = req.body;
    try {
        const updatedSchedule = await prisma.schedule.update({
            where: { id: Number(id) },
            data: {
                dayOfWeek: dayOfWeek as DayOfWeek,
                startTime,
                endTime,
                classId: Number(classId),
                subjectId: Number(subjectId),
                teacherId: Number(teacherId),
            }
        });
        res.status(200).json(updatedSchedule);
    } catch (error) {
        console.error("Gagal mengupdate jadwal:", error);
        res.status(500).json({ message: 'Gagal mengupdate jadwal.' });
    }
};