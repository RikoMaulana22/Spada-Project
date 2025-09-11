// Path: server/src/controllers/class.controller.ts
import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// --- TIDAK ADA PERUBAHAN PADA FUNGSI INI ---
export const createClass = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, description, subjectId } = req.body;
        const teacherId = req.user?.userId;

        // --- PERBAIKAN DI SINI ---
        // Hapus 'public' dari path sebelum disimpan ke database
        const imageUrl = req.file ? req.file.path.replace('public', '').replace(/\\/g, '/') : null;

        if (!name || !subjectId || !teacherId) {
            res.status(400).json({ message: 'Nama kelas, ID mata pelajaran, dan ID guru wajib diisi.' });
            return;
        }

        const newClass = await prisma.class.create({
            data: {
                name,
                description,
                teacherId,
                subjectId: Number(subjectId),
                imageUrl: imageUrl, // Path yang disimpan sekarang lebih bersih (misal: /uploads/materials/...)
            }
        });
        res.status(201).json(newClass);
    } catch (error) {
        // ... (blok catch tidak berubah)
        console.error("Gagal membuat kelas:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
            res.status(400).json({ message: 'ID Mata Pelajaran tidak valid.' });
            return;
        }
        res.status(500).json({ message: 'Terjadi kesalahan pada server saat membuat kelas.' });
    }
};

// --- TIDAK ADA PERUBAHAN PADA FUNGSI INI ---
export const getTeacherClasses = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const teacherId = req.user?.userId;
        if (!teacherId) {
            res.status(401).json({ message: 'Otentikasi guru diperlukan.' });
            return;
        }
        const classes = await prisma.class.findMany({
            where: { teacherId },
            select: { // <-- Ubah dari include menjadi select
                id: true,
                name: true,
                imageUrl: true, // <-- TAMBAHKAN INI
                subject: true,
                _count: {
                    select: { members: true }
                }
            }
        });
        res.status(200).json(classes);
    } catch (error) {
        console.error("Gagal mengambil data kelas:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil data kelas.' });
    }
};

// --- PERBAIKAN PADA FUNGSI INI ---
// GANTIKAN FUNGSI LAMA DENGAN VERSI BARU INI
// Path: server/src/controllers/class.controller.ts

export const getClassById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        const classData = await prisma.class.findUnique({
            where: { id: Number(id) },
            // Query ini sudah benar, tidak perlu diubah
            include: {
                subject: true,
                teacher: { 
                    select: { 
                        id: true, 
                        fullName: true 
                    } 
                },
                members: {
                    where: { studentId: userId },
                    select: { studentId: true }
                },
                topics: {
                    orderBy: { order: 'asc' },
                    include: {
                        materials: { orderBy: { createdAt: 'asc' } },
                        assignments: {
                            orderBy: { createdAt: 'asc' },
                            include: {
                                submissions: {
                                    where: { studentId: userId }
                                }
                            }
                        },
                        attendance: true
                    }
                },
            },
        });

        if (!classData) {
            res.status(404).json({ message: 'Kelas tidak ditemukan.' });
            return;
        }
        
        // --- PERBAIKAN DIMULAI DI SINI ---
        // Logika untuk memproses data pengerjaan siswa
        const processedTopics = classData.topics.map(topic => {
            const processedAssignments = topic.assignments.map(assignment => {
                // Ambil submissions dari hasil query (tipenya any karena tidak ada di model include awal)
                const submissions = (assignment as any).submissions || [];
                
                // Buat objek studentProgress yang bersih
                const studentProgress = {
                    attemptCount: submissions.length,
                    highestScore: submissions.length > 0
                        ? Math.max(...submissions.map((sub: { score: number | null }) => sub.score || 0))
                        : null
                };

                // Hapus properti submissions mentah agar tidak dikirim ke frontend
                delete (assignment as any).submissions;

                // Kembalikan assignment dengan properti studentProgress yang baru
                return { ...assignment, studentProgress };
            });

            // Kembalikan topik dengan data assignment yang sudah diproses
            return { ...topic, assignments: processedAssignments };
        });
        
        const isEnrolled = classData.members.length > 0 || (classData.teacher && classData.teacher.id === userId);
        const { members, ...responseData } = classData;

        // Kirim data yang sudah diproses sepenuhnya ke frontend
        res.status(200).json({ ...responseData, topics: processedTopics, isEnrolled });
        // --- AKHIR PERBAIKAN ---

    } catch (error) {
        console.error("Gagal mengambil detail kelas:", error);
        res.status(500).json({ message: 'Gagal mengambil detail kelas.' });
    }
};

// --- TIDAK ADA PERUBAHAN PADA FUNGSI INI ---
export const enrolInClass = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id: classId } = req.params;
    const studentId = req.user?.userId;

    if (!studentId) {
        res.status(401).json({ message: "Otentikasi diperlukan." });
        return;
    }
    try {
        const existingMembership = await prisma.class_Members.findUnique({
            where: {
                studentId_classId: {
                    studentId,
                    classId: Number(classId)
                }
            }
        });

        if (existingMembership) {
            res.status(409).json({ message: "Anda sudah terdaftar di kelas ini." });
            return;
        }

        await prisma.class_Members.create({
            data: {
                studentId,
                classId: Number(classId)
            }
        });
        
        res.status(201).json({ message: "Pendaftaran berhasil!" });
    } catch (error) {
        console.error("Gagal mendaftar ke kelas:", error);
        res.status(500).json({ message: "Gagal mendaftar ke kelas" });
    }
};


// --- FIX DI SINI: FUNGSI DITAMBAHKAN NAMUN MEMBUTUHKAN PERBAIKAN SKEMA PRISMA ---
// Fungsi ini untuk membuat Topik/Pertemuan baru di dalam sebuah kelas.
export const createTopicForClass = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id: classId } = req.params;
        const { title, order } = req.body;

        if (!title || order === undefined) {
            res.status(400).json({ message: "Judul topik dan urutan wajib diisi." });
            return;
        }

        // PERHATIAN: Baris di bawah ini akan menyebabkan error jika model 'Topic' tidak ada di schema.prisma.
        // Pastikan Anda telah menambahkan model 'Topic' dan menjalankan 'npx prisma generate'.
        const newTopic = await prisma.topic.create({
            data: {
                title,
                order: Number(order),
                classId: Number(classId),
            }
        });
        res.status(201).json(newTopic);
    } catch (error) {
        // Galat ini kemungkinan besar terjadi karena 'prisma.topic' tidak ada.
        console.error("Gagal membuat topik:", error);
        res.status(500).json({ message: 'Gagal membuat topik. Pastikan model Topic ada di skema database.' });
    }
};

export const getAllClasses = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const classes = await prisma.class.findMany({
            select: {
                id: true,
                name: true
            },
            orderBy: { name: 'asc' }
        });
        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil daftar kelas." });
    }
};

// GANTIKAN FUNGSI LAMA DENGAN VERSI BARU INI
export const getStudentClasses = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const studentId = req.user?.userId;
        if (!studentId) {
            res.status(401).json({ message: 'Otentikasi siswa diperlukan.' });
            return;
        }

        const memberships = await prisma.class_Members.findMany({
            where: {
                studentId: studentId,
            },
            select: {
                classId: true,
            },
        });

        const enrolledClassIds = memberships.map(member => member.classId);

        if (enrolledClassIds.length === 0) {
            res.status(200).json([]);
            return;
        }

        const enrolledClasses = await prisma.class.findMany({
            where: {
                id: {
                    in: enrolledClassIds,
                },
            },
             select: { // <-- Ubah dari include menjadi select
                id: true,
                name: true,
                imageUrl: true, // <-- TAMBAHKAN INI
                subject: {
                    select: { name: true }
                },
                teacher: {
                    select: { fullName: true }
                },
                _count: {
                    select: { members: true }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        res.status(200).json(enrolledClasses);

    } catch (error) {
        console.error("Gagal mengambil data kelas siswa:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil data kelas.' });
    }
};

export const deleteClass = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.class.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: 'Kelas berhasil dihapus' });
  } catch (error) {
    console.error('Gagal menghapus kelas:', error);
    res.status(500).json({ message: 'Gagal menghapus kelas', error });
  }
};