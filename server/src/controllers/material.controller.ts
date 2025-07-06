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