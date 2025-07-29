    // Path: src/controllers/attendance.controller.ts
    import { Response } from 'express';
    import { PrismaClient } from '@prisma/client';
    import { AuthRequest } from '../middlewares/auth.middleware';

    const prisma = new PrismaClient();

   

    // ==========================
// 📌 Buat Sesi Absensi
// ==========================
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
      where: { id: parseInt(topicId) },
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

    // ✅ Cek apakah sudah ada sesi absensi untuk topik ini
    const existingAttendance = await prisma.attendance.findFirst({
      where: { topicId: parseInt(topicId) }
    });

    if (existingAttendance) {
      res.status(409).json({ message: 'Sesi absensi untuk topik ini sudah ada.' });
      return;
    }

    // 🆕 Buat sesi absensi baru
    const newAttendance = await prisma.attendance.create({
      data: {
        title,
        openTime: new Date(openTime),
        closeTime: new Date(closeTime),
        topicId: parseInt(topicId),
      },
    });

    res.status(201).json(newAttendance);
  } catch (error) {
    console.error("Gagal membuat sesi absensi:", error);
    res.status(500).json({ message: 'Gagal membuat sesi absensi.' });
  }
};

// ==========================
// 📌 Detail Sesi Absensi
// ==========================
export const getAttendanceDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const attendanceDetails = await prisma.attendance.findUnique({
      where: { id: parseInt(id) },
      include: {
        records: {
          orderBy: { timestamp: 'asc' },
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                nisn: true,
              }
            }
          }
        }
      }
    });

    if (!attendanceDetails) {
      res.status(404).json({ message: "Sesi absensi tidak ditemukan." });
      return;
    }

    res.status(200).json(attendanceDetails);
  } catch (error) {
    console.error("Gagal mengambil detail absensi:", error);
    res.status(500).json({ message: "Gagal mengambil detail absensi." });
  }
};

// ==========================
// 📌 Catat Kehadiran Siswa
// ==========================
export const markAttendanceRecord = async (req: AuthRequest, res: Response) => {
  const { id: attendanceId } = req.params;
  const studentId = req.user?.userId;
  const { status, notes } = req.body;

  if (!studentId) {
    return res.status(401).json({ message: 'Otentikasi diperlukan.' });
  }

  if (!status) {
    return res.status(400).json({ message: 'Status kehadiran wajib diisi.' });
  }

  try {
    const attendanceSession = await prisma.attendance.findUnique({
      where: { id: parseInt(attendanceId) }
    });

    if (!attendanceSession) {
      return res.status(404).json({ message: 'Sesi absensi tidak ditemukan.' });
    }

    const now = new Date();
    if (now < attendanceSession.openTime || now > attendanceSession.closeTime) {
      return res.status(403).json({ message: 'Sesi absensi tidak sedang dibuka.' });
    }

    const proofUrl = req.file ? `/uploads/materials/${req.file.filename}` : undefined;

    const newRecord = await prisma.attendanceRecord.create({
      data: {
        studentId,
        attendanceId: parseInt(attendanceId),
        status,
        notes,
        proofUrl,
      },
    });

    res.status(201).json({ message: 'Kehadiran berhasil dicatat!', record: newRecord });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Anda sudah mencatat kehadiran untuk sesi ini.' });
    }
    console.error("Gagal mencatat kehadiran:", error);
    res.status(500).json({ message: 'Gagal mencatat kehadiran.' });
  }
};
