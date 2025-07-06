// Path: src/controllers/schedule.controller.ts
import { Response } from 'express';
import { PrismaClient, DayOfWeek } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// Admin membuat jadwal baru
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

// Mengambil jadwal untuk satu kelas spesifik
export const getSchedulesByClass = async (req: AuthRequest, res: Response): Promise<void> => {
    const { classId } = req.params;
    try {
        const schedules = await prisma.schedule.findMany({
            where: { classId: Number(classId) },
            include: {
                subject: { select: { name: true } },
                teacher: { select: { fullName: true } }
            },
            // Urutkan berdasarkan hari dan jam mulai
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' }
            ]
        });
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil jadwal.' });
    }
};

// Admin menghapus jadwal
export const deleteSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.schedule.delete({ where: { id: Number(id) } });
        res.status(200).json({ message: "Jadwal berhasil dihapus." });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus jadwal.' });
    }
};