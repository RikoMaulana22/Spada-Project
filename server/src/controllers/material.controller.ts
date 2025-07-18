// Path: server/src/controllers/material.controller.ts

import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export const uploadMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { topicId } = req.params;
    const { title } = req.body;

    if (!req.file) {
      res.status(400).json({ message: 'File tidak ditemukan untuk diunggah.' });
      return;
    }

    // Buat URL yang bisa diakses publik dari path file
    // Pastikan path ini sesuai dengan cara Anda menyajikan file statis
    const fileUrl = `/uploads/materials/${req.file.filename}`;

    const newMaterial = await prisma.material.create({
      data: {
        title,
        fileUrl,
        topicId: Number(topicId),
      },
    });

    res.status(201).json(newMaterial);
  } catch (error) {
    console.error("Gagal mengunggah materi:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server saat mengunggah materi." });
  }
};
// --- FUNGSI BARU: Mendapatkan materi global untuk siswa/guru ---
export const getGlobalMaterials = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const materials = await prisma.material.findMany({
            // --- PERBAIKAN DITERAPKAN DI SINI ---
            where: { topic: null }, // Filter berdasarkan relasi, bukan ID
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(materials);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil materi global.' });
    }
};

export const createMaterialForTopic = async (req: AuthRequest, res: Response): Promise<void> => {
    const { topicId } = req.params;
    const { title, content, youtubeUrl } = req.body;

    // Validasi dasar
    if (!title) {
        res.status(400).json({ message: 'Judul materi wajib diisi.' });
        return;
    }

    try {
        // Cek apakah ada file yang diunggah
        const fileUrl = req.file ? `/uploads/materials/${req.file.filename}` : undefined;

        const newMaterial = await prisma.material.create({
            data: {
                title,
                content,
                youtubeUrl,
                fileUrl, // Bisa jadi undefined jika tidak ada file
                topicId: Number(topicId),
            },
        });

        res.status(201).json(newMaterial);
    } catch (error) {
        console.error("Gagal membuat materi:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};

// --- FUNGSI UNTUK MEMBUAT MATERI GLOBAL (UNTUK ADMIN) ---
export const createGlobalMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
    const { title, content, youtubeUrl } = req.body;

    if (!title) {
        res.status(400).json({ message: 'Judul materi wajib diisi.' });
        return;
    }

    try {
        const fileUrl = req.file ? `/uploads/materials/${req.file.filename}` : undefined;

        const newMaterial = await prisma.material.create({
            data: {
                title,
                content,
                youtubeUrl,
                fileUrl,
                // topicId tidak diisi karena ini materi global
            },
        });
        res.status(201).json(newMaterial);
    } catch (error) {
        console.error("Gagal membuat materi global:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};




// --- FUNGSI TAMBAHAN YANG BERGUNA ---

// Mendapatkan semua materi dalam satu topik
export const getMaterialsForTopic = async (req: AuthRequest, res: Response): Promise<void> => {
    const { topicId } = req.params;
    try {
        const materials = await prisma.material.findMany({
            where: { topicId: Number(topicId) },
            orderBy: { createdAt: 'asc' }
        });
        res.status(200).json(materials);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil materi.' });
    }
};

// Menghapus materi
export const deleteMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
    const { materialId } = req.params;
    try {
        // Hapus file fisik jika ada (logika ini perlu disesuaikan)
        // ... kode untuk menghapus file ...

        await prisma.material.delete({ where: { id: Number(materialId) } });
        res.status(200).json({ message: 'Materi berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus materi.' });
    }
}