import { Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Fungsi getUsers (sudah ada dan benar)
export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const role = req.query.role as Role;
    const whereCondition: { role?: Role } = {};
    if (role && (role === 'guru' || role === 'siswa')) {
        whereCondition.role = role;
    }
    try {
        const users = await prisma.user.findMany({
            where: whereCondition,
            select: { id: true, username: true, fullName: true, nisn: true, role: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(users);
    } catch (error) {
        console.error(`Gagal mengambil data pengguna:`, error);
        res.status(500).json({ message: `Gagal mengambil data pengguna` });
    }
};

// --- FUNGSI BARU UNTUK LAPORAN ---

// Mengambil Laporan Kehadiran
export const getAttendanceReport = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const attendanceData = await prisma.class.findMany({
            orderBy: { name: 'asc' },
            select: {
                name: true,
                teacher: { select: { fullName: true } },
                _count: { select: { members: true } },
                topics: {
                    where: { attendance: { isNot: null } },
                    select: {
                        title: true,
                        attendance: {
                            select: {
                                title: true,
                                openTime: true,
                                _count: { select: { records: true } }
                            }
                        }
                    }
                }
            }
        });
        const report = attendanceData.flatMap(cls => 
            cls.topics.map(topic => ({
                className: cls.name,
                teacherName: cls.teacher.fullName,
                totalStudents: cls._count.members,
                topicTitle: topic.title,
                attendanceTitle: topic.attendance!.title,
                studentsPresent: topic.attendance!._count.records,
                openTime: topic.attendance!.openTime,
            }))
        );
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil laporan kehadiran.' });
    }
};

// Mengambil Laporan Nilai
export const getGradeReport = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const classesWithAssignments = await prisma.class.findMany({
            include: {
                teacher: { select: { fullName: true } },
                _count: { select: { members: true } },
                topics: {
                    include: {
                        assignments: {
                            include: {
                                _count: { select: { submissions: true } },
                                submissions: {
                                    where: { score: { not: null } },
                                    select: { score: true }
                                }
                            }
                        }
                    }
                }
            }
        });

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
                        className: cls.name,
                        teacherName: cls.teacher.fullName,
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
        res.status(500).json({ message: 'Gagal mengambil laporan nilai.' });
    }
};

// Fungsi createUser (sudah ada dan benar)
export const createUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { username, password, fullName, role, nisn } = req.body;
    if (!username || !password || !fullName || !role) {
        res.status(400).json({ message: 'Username, password, nama lengkap, dan peran wajib diisi.' });
        return;
    }
    if (role === 'admin') {
        res.status(403).json({ message: 'Tidak diizinkan membuat pengguna dengan peran admin.'});
        return;
    }
    try {
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            res.status(409).json({ message: 'Username sudah digunakan.' });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: { username, password: hashedPassword, fullName, role, nisn }
        });
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error('Gagal membuat pengguna:', error);
        res.status(500).json({ message: 'Gagal membuat pengguna' });
    }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { fullName, username, role, nisn, password } = req.body;
    try {
        const dataToUpdate: any = { fullName, username, role, nisn };
        if (password) {
            dataToUpdate.password = await bcrypt.hash(password, 10);
        }
        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: dataToUpdate,
        });
        const { password: _, ...userWithoutPassword } = updatedUser;
        res.status(200).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengupdate pengguna' });
    }
};

// --- FUNGSI DELETE BARU DENGAN PENGECEKAN ---
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const adminId = req.user?.userId;
    const userIdToDelete = Number(id);

    if (userIdToDelete === adminId) {
        res.status(400).json({ message: "Anda tidak dapat menghapus akun Anda sendiri." });
        return;
    }
    try {
        const teachingClasses = await prisma.class.count({ where: { teacherId: userIdToDelete } });
        if (teachingClasses > 0) {
            res.status(400).json({ message: `Gagal: Pengguna ini masih menjadi guru di ${teachingClasses} kelas.` });
            return;
        }
        const announcements = await prisma.announcement.count({ where: { authorId: userIdToDelete } });
        if (announcements > 0) {
            res.status(400).json({ message: `Gagal: Pengguna ini adalah penulis dari ${announcements} pengumuman.` });
            return;
        }
        const schedules = await prisma.schedule.count({ where: { teacherId: userIdToDelete } });
        if (schedules > 0) {
            res.status(400).json({ message: `Gagal: Pengguna ini masih memiliki ${schedules} jadwal mengajar.` });
            return;
        }
        
        await prisma.user.delete({ where: { id: userIdToDelete } });
        res.status(200).json({ message: 'Pengguna berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus pengguna.' });
    }
};
// --- MANAJEMEN MATERI GLOBAL ---
export const uploadGlobalMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
    const { title } = req.body;
    if (!req.file || !title) {
        res.status(400).json({ message: 'Judul dan file wajib diisi.' });
        return;
    }
    try {
        const fileUrl = `/uploads/materials/${req.file.filename}`;
        const newMaterial = await prisma.material.create({
            data: { title, fileUrl },
        });
        res.status(201).json(newMaterial);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengunggah materi." });
    }
};

export const getGlobalMaterialsAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const materials = await prisma.material.findMany({
            where: { topic: null },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(materials);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil materi global.' });
    }
};

export const deleteGlobalMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.material.delete({ where: { id: Number(id) } });
        res.status(200).json({ message: 'Materi global berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus materi.' });
    }
};