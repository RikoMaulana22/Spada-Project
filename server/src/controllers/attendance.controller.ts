// Path: src/controllers/attendance.controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export const createAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  const { topicId } = req.params;
  const { title, openTime, closeTime } = req.body;
  const userId = req.user?.userId;

  if (!title || !openTime || !closeTime) {
    res.status(400).json({ message: 'Judul, waktu buka, dan waktu tutup wajib diisi.' });
    return;
  }

  try {
    // Verifikasi bahwa pengguna adalah guru dari kelas tempat topik ini berada
    const topic = await prisma.topic.findUnique({
      where: { id: Number(topicId) },
      include: { class: true },
    });

    if (!topic) {
      res.status(404).json({ message: 'Topik tidak ditemukan.' });
      return;
    }
    if (topic.class.teacherId !== userId) {
      res.status(403).json({ message: 'Akses ditolak. Anda bukan guru pemilik kelas ini.' });
      return;
    }

    // Buat sesi absensi baru
    const newAttendance = await prisma.attendance.create({
      data: {
        title,
        openTime: new Date(openTime),
        closeTime: new Date(closeTime),
        topicId: Number(topicId),
      },
    });

    res.status(201).json(newAttendance);
  } catch (error: any) {
    // Tangani error jika absensi untuk topik ini sudah ada (karena topicId unik)
    if (error.code === 'P2002') {
      res.status(409).json({ message: 'Sesi absensi untuk topik ini sudah ada.' });
      return;
    }
    console.error("Gagal membuat sesi absensi:", error);
    res.status(500).json({ message: 'Gagal membuat sesi absensi.' });
  }
};
export const markAttendanceRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id: attendanceId } = req.params; // ID dari sesi absensi
  const studentId = req.user?.userId;

  if (!studentId) {
    res.status(401).json({ message: 'Otentikasi diperlukan.' });
    return;
  }

  try {
    // 1. Cek apakah sesi absensi ada dan sedang dibuka
    const attendanceSession = await prisma.attendance.findUnique({
      where: { id: Number(attendanceId) },
    });

    if (!attendanceSession) {
      res.status(404).json({ message: 'Sesi absensi tidak ditemukan.' });
      return;
    }

    const now = new Date();
    if (now < attendanceSession.openTime || now > attendanceSession.closeTime) {
      res.status(403).json({ message: 'Sesi absensi tidak sedang dibuka.' });
      return;
    }
    
    // 2. Buat catatan kehadiran baru
    // @@unique([studentId, attendanceId]) di skema akan mencegah duplikasi
    const newRecord = await prisma.attendanceRecord.create({
      data: {
        studentId: studentId,
        attendanceId: Number(attendanceId),
      },
    });

    res.status(201).json({ message: 'Kehadiran berhasil dicatat!', record: newRecord });
  } catch (error: any) {
    // Tangani jika siswa sudah pernah absen (error duplikasi dari database)
    if (error.code === 'P2002') {
      res.status(409).json({ message: 'Anda sudah mencatat kehadiran untuk sesi ini.' });
      return;
    }
    console.error("Gagal mencatat kehadiran:", error);
    res.status(500).json({ message: 'Gagal mencatat kehadiran.' });
  }
};