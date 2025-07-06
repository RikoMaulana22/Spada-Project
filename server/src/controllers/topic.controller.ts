// Path: src/controllers/topic.controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// Fungsi untuk mengedit judul topik
export const updateTopic = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title } = req.body;
  const userId = req.user?.userId;

  try {
    // 1. Verifikasi kepemilikan: Pastikan pengguna adalah guru dari kelas tempat topik ini berada
    const topic = await prisma.topic.findUnique({
      where: { id: Number(id) },
      include: { class: true },
    });

    if (!topic) {
      res.status(404).json({ message: 'Topik tidak ditemukan.' });
      return;
    }
    if (topic.class.teacherId !== userId) {
      res.status(403).json({ message: 'Akses ditolak. Anda bukan pemilik kelas ini.' });
      return;
    }

    // 2. Lakukan update
    const updatedTopic = await prisma.topic.update({
      where: { id: Number(id) },
      data: { title },
    });

    res.status(200).json(updatedTopic);
  } catch (error) {
    console.error("Gagal mengedit topik:", error);
    res.status(500).json({ message: 'Gagal mengedit topik.' });
  }
};

// Fungsi untuk menghapus topik
export const deleteTopic = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.userId;

  try {
    // 1. Verifikasi kepemilikan (sama seperti edit)
    const topic = await prisma.topic.findUnique({
      where: { id: Number(id) },
      include: { class: true },
    });

    if (!topic) {
      res.status(404).json({ message: 'Topik tidak ditemukan.' });
      return;
    }
    if (topic.class.teacherId !== userId) {
      res.status(403).json({ message: 'Akses ditolak.' });
      return;
    }

    // 2. Lakukan delete
    // Catatan: Ini akan berhasil jika materi/tugas di dalam topik bisa dihapus (cascading delete)
    await prisma.topic.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: 'Topik berhasil dihapus.' });
  } catch (error)
  {
    console.error("Gagal menghapus topik:", error);
    res.status(500).json({ message: 'Gagal menghapus topik.' });
  }
};