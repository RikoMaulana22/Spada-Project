// Path: server/src/controllers/class.controller.ts
import { Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// --- TIDAK ADA PERUBAHAN PADA FUNGSI INI ---
export const createClass = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, description, subjectId } = req.body;
        const teacherId = req.user?.userId;

        if (!name || !subjectId || !teacherId) {
            res.status(400).json({ message: 'Nama kelas, ID mata pelajaran, dan ID guru wajib diisi.' });
            return;
        }

        const newClass = await prisma.class.create({
            data: {
                name,
                description,
                teacherId,
                subjectId: Number(subjectId)
            }
        });
        res.status(201).json(newClass);
    } catch (error) {
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
            include: {
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
            // Query ini memastikan SEMUA data yang dibutuhkan frontend diambil
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
                // Ini adalah bagian paling penting
                topics: {
                    orderBy: {
                        order: 'asc'
                    },
                    include: {
                        materials: { // <-- Mengambil semua materi
                            orderBy: { createdAt: 'asc' }
                        },
                        assignments: { // <-- Mengambil semua tugas
                            orderBy: { createdAt: 'asc' }
                        },
                        attendance: true // <-- Mengambil data absensi
                    }
                },
            },
        });

        if (!classData) {
            res.status(404).json({ message: 'Kelas tidak ditemukan.' });
            return;
        }

        const isEnrolled = classData.members.length > 0 || classData.teacher.id === userId;
        const { members, ...responseData } = classData;

        res.status(200).json({ ...responseData, isEnrolled });
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
            include: {
                subject: true,
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