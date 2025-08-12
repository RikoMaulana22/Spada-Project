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
// --- GANTIKAN SELURUH FUNGSI INI DENGAN VERSI BARU ---
export const markAttendanceRecord = async (req: AuthRequest, res: Response) => {
    const { id: attendanceId } = req.params;
    const studentId = req.user?.userId;
    const { status, notes } = req.body;
    const proofFile = req.file;

    if (!studentId) {
        return res.status(401).json({ message: 'Otentikasi diperlukan.' });
    }
    if (!status) {
        return res.status(400).json({ message: 'Status kehadiran wajib diisi.' });
    }

    try {
        const attendanceSession = await prisma.attendance.findUnique({
            where: { id: parseInt(attendanceId) },
            include: { topic: { select: { classId: true } } }
        });

        if (!attendanceSession) {
            return res.status(404).json({ message: 'Sesi absensi tidak ditemukan.' });
        }
        
        const now = new Date();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const existingRecord = await prisma.dailyAttendance.findFirst({
            where: {
                studentId: studentId,
                classId: attendanceSession.topic.classId,
                date: {
                    gte: todayStart,
                    lt: todayEnd
                }
            }
            
        });

        if (existingRecord) {
            return res.status(409).json({ message: 'Anda sudah mencatat kehadiran untuk kelas ini hari ini.' });
        }

        // --- PERBAIKAN UTAMA: GUNAKAN `UPSERT` BUKAN `CREATE` ---

        // Data yang akan di-create atau di-update
        const dataForUpsert = {
            date: todayStart, // Gunakan awal hari agar tanggalnya selalu sama untuk hari yang sama
            status,
            notes: notes || null,
            proofUrl: proofFile ? proofFile.path.replace('public', '').replace(/\\/g, '/') : null,
            student: { connect: { id: studentId } },
            class: { connect: { id: attendanceSession.topic.classId } },
            recordedBy: { connect: { id: studentId } }
        };

        const record = await prisma.dailyAttendance.upsert({
             where: {
                // Cari record berdasarkan kombinasi unik yang baru
                date_studentId_classId: {
                    date: todayStart,
                    studentId: studentId,
                    classId: attendanceSession.topic.classId
                }
            },
            update: {
                status,
                notes: notes || null,
                proofUrl: proofFile ? proofFile.path.replace('public', '').replace(/\\/g, '/') : null,
                recordedBy: { connect: { id: studentId } } // Update juga siapa yang merekam
            },
           create: dataForUpsert
        });

        res.status(201).json({ message: 'Kehadiran berhasil dicatat!', record });

    } catch (error: any) {
        console.error("Gagal mencatat kehadiran:", error);
        res.status(500).json({ message: 'Gagal mencatat kehadiran. Periksa log server.' });
    }
};

