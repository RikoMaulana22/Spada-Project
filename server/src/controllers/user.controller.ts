// Path: server/src/controllers/user.controller.ts

import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Fungsi untuk mengambil rekap nilai untuk guru
export const getTeacherGradebook = async (req: AuthRequest, res: Response) => {
    const teacherId = req.user?.userId;

    if (!teacherId) {
        return res.status(401).json({ message: "Otentikasi guru diperlukan." });
    }

    try {
        // Mengambil semua submission dari tugas yang ada di kelas yang diajar oleh guru ini
        const submissions = await prisma.submission.findMany({
            where: {
                assignment: {
                    topic: {
                        class: {
                            teacherId: teacherId,
                        },
                    },
                },
                // Hanya ambil yang sudah dinilai
                score: {
                    not: null,
                },
            },
            select: {
                id: true,
                score: true,
                submissionDate: true,
                student: {
                    select: {
                        fullName: true,
                    },
                },
                assignment: {
                    select: {
                        title: true,
                        topic: {
                            select: {
                                class: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                submissionDate: 'desc', // Tampilkan yang terbaru di atas
            },
        });

        res.status(200).json(submissions);
    } catch (error) {
        console.error("Gagal mengambil rekap nilai:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};

// Fungsi yang sudah ada untuk update profil dan ganti password
export const updateProfile = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const { fullName } = req.body;
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { fullName },
        });
        res.status(200).json({ message: 'Profil berhasil diperbarui.' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui profil.' });
    }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !await bcrypt.compare(currentPassword, user.password)) {
            return res.status(401).json({ message: 'Password saat ini salah.' });
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });
        res.status(200).json({ message: 'Password berhasil diubah.' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengubah password.' });
    }
};


