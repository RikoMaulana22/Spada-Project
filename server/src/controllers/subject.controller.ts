import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export const getAllSubjects = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const subjects = await prisma.subject.findMany({
            orderBy: { name: 'asc' }
        });
        res.status(200).json(subjects);
    } catch (error) {
        console.error("Gagal mengambil data mata pelajaran:", error);
        res.status(500).json({ message: 'Gagal mengambil data mata pelajaran' });
    }
};

// Pastikan fungsi ini memiliki blok 'include' kembali
export const getGroupedSubjects = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const subjects = await prisma.subject.findMany({
            orderBy: [
                { grade: 'asc' },
                { name: 'asc' }
            ],
            // 'include' ini penting untuk menampilkan daftar kelas di bawah subjek
            include: {
                Class: {
                    select: {
                        id: true,
                        name: true,
                    },
                    orderBy: {
                        name: 'asc'
                    }
                }
            }
        });

        type SubjectWithClasses = typeof subjects[0];
        type GroupedData = Record<string, SubjectWithClasses[]>;

        const grouped = subjects.reduce((acc: GroupedData, subject: SubjectWithClasses) => {
            const grade = subject.grade.toString();
            if (!acc[grade]) {
                acc[grade] = [];
            }
            acc[grade].push(subject);
            return acc;
        }, {} as GroupedData);

        res.status(200).json(grouped);
    } catch (error) {
        // ERROR SEBENARNYA AKAN MUNCUL DI CONSOLE.ERROR INI DI TERMINAL BACKEND
        console.error("Gagal mengambil data mata pelajaran terkelompok:", error);
        res.status(500).json({ message: 'Gagal mengambil data mata pelajaran' });
    }
};
// --- FUNGSI BARU UNTUK ADMIN ---

// Membuat mata pelajaran baru
export const createSubject = async (req: AuthRequest, res: Response): Promise<void> => {
    const { name, grade } = req.body;
    if (!name || !grade) {
        res.status(400).json({ message: 'Nama dan tingkatan kelas wajib diisi.' });
        return;
    }
    try {
        const newSubject = await prisma.subject.create({
            data: { name, grade: Number(grade) },
        });
        res.status(201).json(newSubject);
    } catch (error) {
        console.error("Gagal membuat mapel:", error);
        res.status(500).json({ message: 'Gagal membuat mata pelajaran.' });
    }
};

// Mengupdate mata pelajaran
export const updateSubject = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, grade } = req.body;
    try {
        const updatedSubject = await prisma.subject.update({
            where: { id: Number(id) },
            data: { name, grade: Number(grade) },
        });
        res.status(200).json(updatedSubject);
    } catch (error) {
        console.error("Gagal mengupdate mapel:", error);
        res.status(500).json({ message: 'Gagal mengupdate mata pelajaran.' });
    }
};

// Menghapus mata pelajaran
export const deleteSubject = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        // Cek apakah ada kelas yang masih menggunakan mapel ini
        const relatedClasses = await prisma.class.count({ where: { subjectId: Number(id) } });
        if (relatedClasses > 0) {
            res.status(400).json({ message: `Tidak bisa menghapus, masih ada ${relatedClasses} kelas yang menggunakan mata pelajaran ini.` });
            return;
        }

        await prisma.subject.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({ message: 'Mata pelajaran berhasil dihapus.' });
    } catch (error) {
        console.error("Gagal menghapus mapel:", error);
        res.status(500).json({ message: 'Gagal menghapus mata pelajaran.' });
    }
};