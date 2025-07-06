// Path: src/controllers/announcement.controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// --- Untuk Pengguna Umum (Guru/Siswa) ---
// Mengambil beberapa pengumuman terbaru untuk ditampilkan di dashboard
export const getLatestAnnouncements = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const announcements = await prisma.announcement.findMany({
            take: 5, // Ambil 5 pengumuman terbaru
            orderBy: { createdAt: 'desc' },
            include: { author: { select: { fullName: true } } }
        });
        res.status(200).json(announcements);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil pengumuman.' });
    }
};

// --- Untuk Admin ---
// Admin mengambil semua pengumuman untuk dikelola
export const getAllAnnouncements = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const announcements = await prisma.announcement.findMany({
            orderBy: { createdAt: 'desc' },
            include: { author: { select: { fullName: true } } }
        });
        res.status(200).json(announcements);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil pengumuman.' });
    }
};

// Admin membuat pengumuman baru
export const createAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
    const { title, content } = req.body;
    const authorId = req.user?.userId;
    if (!title || !content || !authorId) {
        res.status(400).json({ message: 'Judul dan konten wajib diisi.' });
        return;
    }
    try {
        const newAnnouncement = await prisma.announcement.create({
            data: { title, content, authorId }
        });
        res.status(201).json(newAnnouncement);
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat pengumuman.' });
    }
};

// Admin menghapus pengumuman
export const deleteAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.announcement.delete({ where: { id: Number(id) } });
        res.status(200).json({ message: 'Pengumuman berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus pengumuman.' });
    }
};