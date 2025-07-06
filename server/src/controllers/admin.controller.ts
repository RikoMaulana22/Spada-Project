import { Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Fungsi untuk mendapatkan daftar pengguna (bisa difilter berdasarkan peran)
export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    // Ambil query parameter 'role' dari URL, contoh: /api/admin/users?role=siswa
    const role = req.query.role as Role;

    // Buat kondisi filter. Jika ada query 'role', filter berdasarkan itu.
    const whereCondition: { role?: Role } = {};
    if (role && (role === 'guru' || role === 'siswa')) {
        whereCondition.role = role;
    }

    try {
        const users = await prisma.user.findMany({
            where: whereCondition,
            select: { // Pilih hanya field yang aman untuk ditampilkan
                id: true,
                username: true,
                fullName: true,
                nisn: true,
                role: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json(users);
    } catch (error) {
        console.error(`Gagal mengambil data pengguna:`, error);
        res.status(500).json({ message: `Gagal mengambil data pengguna` });
    }
};

// Fungsi untuk membuat pengguna baru (guru atau siswa)
export const createUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { username, password, fullName, role, nisn } = req.body;

    // Validasi input dasar
    if (!username || !password || !fullName || !role) {
        res.status(400).json({ message: 'Username, password, nama lengkap, dan peran wajib diisi.' });
        return;
    }
    if (role === 'admin') {
        res.status(403).json({ message: 'Tidak diizinkan membuat pengguna dengan peran admin.'});
        return;
    }

    try {
        // Cek apakah username sudah ada
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            res.status(409).json({ message: 'Username sudah digunakan.' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                fullName,
                role,
                nisn// nisn bisa null jika tidak diisi
            }
        });

        // Jangan pernah kirim balik password, bahkan yang sudah di-hash
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error('Gagal membuat pengguna:', error);
        res.status(500).json({ message: 'Gagal membuat pengguna' });
    }
};
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { fullName, username, role, nisn } = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: { fullName, username, role, nisn },
        });

        const { password, ...userWithoutPassword } = updatedUser;
        res.status(200).json(userWithoutPassword);
    } catch (error) {
        console.error('Gagal mengupdate pengguna:', error);
        res.status(500).json({ message: 'Gagal mengupdate pengguna' });
    }
};

// --- FUNGSI BARU: Menghapus pengguna ---
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const adminId = req.user?.userId;

    if (Number(id) === adminId) {
        res.status(400).json({ message: "Anda tidak dapat menghapus akun Anda sendiri." });
        return;
    }

    try {
        await prisma.user.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({ message: 'Pengguna berhasil dihapus.' });
    } catch (error) {
        console.error('Gagal menghapus pengguna:', error);
        res.status(500).json({ message: 'Gagal menghapus pengguna.' });
    }
};
// --- FUNGSI BARU: Mengambil Laporan Kehadiran ---
export const getAttendanceReport = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const attendanceData = await prisma.class.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                teacher: { select: { fullName: true } },
                _count: { // Menghitung total siswa di kelas
                    select: { members: true }
                },
                topics: {
                    where: {
                        // Hanya ambil topik yang memiliki sesi absensi
                        attendance: { isNot: null }
                    },
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        title: true,
                        attendance: {
                            select: {
                                id: true,
                                title: true,
                                openTime: true,
                                closeTime: true,
                                _count: { // Menghitung jumlah siswa yang hadir
                                    select: { records: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Struktur ulang data agar lebih mudah digunakan di frontend
        const report = attendanceData.flatMap(cls => 
            cls.topics.map(topic => ({
                classId: cls.id,
                className: cls.name,
                teacherName: cls.teacher.fullName,
                totalStudents: cls._count.members,
                topicId: topic.id,
                topicTitle: topic.title,
                attendanceId: topic.attendance!.id,
                attendanceTitle: topic.attendance!.title,
                studentsPresent: topic.attendance!._count.records,
                openTime: topic.attendance!.openTime,
                closeTime: topic.attendance!.closeTime
            }))
        );

        res.status(200).json(report);

    } catch (error) {
        console.error('Gagal mengambil laporan kehadiran:', error);
        res.status(500).json({ message: 'Gagal mengambil laporan kehadiran.' });
    }
};
// --- FUNGSI BARU: Mengambil Laporan Nilai ---
export const getGradeReport = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // 1. Ambil semua kelas beserta relasi yang dibutuhkan
        const classesWithAssignments = await prisma.class.findMany({
            include: {
                teacher: { select: { fullName: true } },
                _count: { select: { members: true } },
                topics: {
                    include: {
                        assignments: {
                            include: {
                                // Ambil semua submission untuk dihitung rata-ratanya
                                submissions: {
                                    where: { score: { not: null } }, // Hanya yang sudah dinilai
                                    select: { score: true }
                                },
                                // Dapatkan juga jumlah total submission
                                _count: {
                                    select: { submissions: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        // 2. Proses dan struktur ulang data agar mudah dibaca oleh frontend
        const report = [];
        for (const cls of classesWithAssignments) {
            for (const topic of cls.topics) {
                for (const assignment of topic.assignments) {
                    const gradedSubmissions = assignment.submissions;
                    let averageScore = 0;
                    if (gradedSubmissions.length > 0) {
                        const totalScore = gradedSubmissions.reduce((sum, sub) => sum + (sub.score ?? 0), 0);
                        averageScore = totalScore / gradedSubmissions.length;
                    }

                    report.push({
                        classId: cls.id,
                        className: cls.name,
                        teacherName: cls.teacher.fullName,
                        assignmentId: assignment.id,
                        assignmentTitle: assignment.title,
                        totalSubmissions: assignment._count.submissions,
                        totalStudents: cls._count.members,
                        averageScore: parseFloat(averageScore.toFixed(2)),
                    });
                }
            }
        }

        res.status(200).json(report);

    } catch (error) {
        console.error('Gagal mengambil laporan nilai:', error);
        res.status(500).json({ message: 'Gagal mengambil laporan nilai.' });
    }
};
// Admin mengunggah materi global
export const uploadGlobalMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
    const { title } = req.body;
    if (!req.file) {
        res.status(400).json({ message: 'File tidak ditemukan.' });
        return;
    }
    if (!title) {
        res.status(400).json({ message: 'Judul materi wajib diisi.' });
        return;
    }

    try {
        const fileUrl = `/uploads/materials/${req.file.filename}`;
        const newMaterial = await prisma.material.create({
            data: {
                title,
                fileUrl,
                // topicId dibiarkan kosong (null), menandakan ini materi global
            },
        });
        res.status(201).json(newMaterial);
    } catch (error) {
        console.error("Gagal unggah materi global:", error);
        res.status(500).json({ message: "Gagal mengunggah materi." });
    }
};

export const getGlobalMaterialsAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const materials = await prisma.material.findMany({
            // --- PERBAIKAN FINAL DI SINI ---
            where: { topic: null }, // Filter berdasarkan relasi, bukan ID
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(materials);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil materi global.' });
    }
};

// Admin menghapus materi global
export const deleteGlobalMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        // TODO: Tambahkan logika untuk menghapus file fisik dari storage jika diperlukan
        await prisma.material.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({ message: 'Materi global berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus materi.' });
    }
};