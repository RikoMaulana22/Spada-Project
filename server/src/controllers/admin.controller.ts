import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';
import bcrypt from 'bcrypt';
import Papa from 'papaparse'; // Impor papaparse
import fs from 'fs'; // Impor file system

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

// --- TAMBAHKAN FUNGSI BARU DI SINI ---
export const bulkCreateUsers = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ message: 'File CSV tidak ditemukan.' });
    }

    // Ambil peran yang dipilih dari body permintaan
    const { role } = req.body;
    // Tambahkan 'wali_kelas' sebagai peran yang valid
    if (!role || !['guru', 'siswa', 'wali_kelas'].includes(role)) {
        return res.status(400).json({ message: 'Peran (role) yang dipilih tidak valid.' });
    }

    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf8');

    try {
        const usersToCreate: any[] = [];
        
        Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            step: async (result) => {
                const row = result.data as any;
                const hashedPassword = await bcrypt.hash(row.password, 10);
                
                const userData: any = {
                    fullName: row.fullName,
                    username: row.username,
                    email: row.email,
                    password: hashedPassword,
                    role: role,
                };
                
                if (role === 'siswa') {
                    userData.nisn = row.nisn || null;
                }
                
                // Jika wali kelas, kita perlu classId dari CSV
                if (role === 'wali_kelas') {
                    userData.homeroomClassId = parseInt(row.homeroomClassId); 
                }

                usersToCreate.push(userData);
            },
            complete: async () => {
                try {
                    // Gunakan transaksi untuk membuat user dan menugaskan wali kelas
                    await prisma.$transaction(async (tx) => {
                        for (const userData of usersToCreate) {
                            const { homeroomClassId, ...restOfUserData } = userData;

                            const newUser = await tx.user.create({
                                data: restOfUserData
                            });

                            if (userData.role === 'wali_kelas' && homeroomClassId) {
                                await tx.class.update({
                                    where: { id: homeroomClassId },
                                    data: { homeroomTeacherId: newUser.id }
                                });
                            }
                        }
                    });
                    
                    fs.unlinkSync(filePath);
                    res.status(201).json({ message: `${usersToCreate.length} akun ${role} berhasil dibuat.` });

                } catch (dbError) {
                    fs.unlinkSync(filePath);
                    res.status(500).json({ message: 'Gagal menyimpan data. Pastikan tidak ada duplikasi dan classId valid.' });
                }
            }
        });

    } catch (error) {
        fs.unlinkSync(filePath);
        res.status(500).json({ message: 'Gagal memproses file CSV.' });
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
export const createUser = async (req: AuthRequest, res: Response) => {
    // Ambil homeroomClassId dari body
    const { username, email, password, fullName, role, nisn, homeroomClassId } = req.body;

    if (!username || !email || !password || !fullName || !role) {
        return res.status(400).json({ message: "Field dasar wajib diisi." });
    }

    // Validasi jika peran wali_kelas tapi tidak memilih kelas
    if (role === 'wali_kelas' && !homeroomClassId) {
        return res.status(400).json({ message: "Silakan pilih kelas untuk wali kelas." });
    }

    try {
        // Gunakan transaksi untuk memastikan kedua operasi berhasil
        const newUser = await prisma.$transaction(async (tx) => {
            const existingUser = await tx.user.findFirst({ where: { OR: [{ username }, { email }] } });
            if (existingUser) {
                throw new Error("Username atau email sudah digunakan.");
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            // 1. Buat pengguna baru
            const createdUser = await tx.user.create({
                data: {
                    username, email, password: hashedPassword, fullName, role,
                    nisn: role === 'siswa' ? nisn : null,
                }
            });

            // 2. Jika perannya wali_kelas, update kelas yang dipilih
            if (role === 'wali_kelas' && homeroomClassId) {
                await tx.class.update({
                    where: { id: parseInt(homeroomClassId) },
                    data: { homeroomTeacherId: createdUser.id }
                });
            }
            
            return createdUser;
        });

        const { password: _, ...userToReturn } = newUser;
        res.status(201).json(userToReturn);

    } catch (error: any) {
        if (error.message === "Username atau email sudah digunakan.") {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ message: "Gagal membuat pengguna baru." });
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

// --- TAMBAHKAN FUNGSI BARU DI SINI ---
export const getAvailableClassesForHomeroom = async (req: AuthRequest, res: Response) => {
    try {
        const classes = await prisma.class.findMany({
            where: {
                homeroomTeacherId: null // Hanya ambil kelas yang wali kelasnya kosong
            },
            select: {
                id: true,
                name: true,
            }
        });
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data kelas." });
    }
};

// --- FUNGSI BARU: Mengambil semua kelas untuk panel admin ---
export const getAllClasses = async (req: Request, res: Response) => {
    try {
        const classes = await prisma.class.findMany({
            include: {
                subject: { select: { name: true } },
                teacher: { select: { fullName: true } },
                homeroomTeacher: { select: { fullName: true } }
            },
            orderBy: { name: 'asc' }
        });
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data kelas." });
    }
};

// Mengambil semua user dengan peran 'guru' atau 'wali_kelas'
export const getAllTeachers = async (req: Request, res: Response) => {
    try {
        const teachers = await prisma.user.findMany({
            where: { role: { in: ['guru', 'wali_kelas'] } },
            select: { id: true, fullName: true }
        });
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data guru.' });
    }
};

// Mengambil semua mata pelajaran
export const getAllSubjects = async (req: Request, res: Response) => {
    try {
        const subjects = await prisma.subject.findMany({
            select: { id: true, name: true }
        });
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data mata pelajaran.' });
    }
};

// Membuat kelas baru
export const createClass = async (req: Request, res: Response) => {
    const { name, description, subjectId, teacherId } = req.body;

    if (!name || !subjectId || !teacherId) {
        return res.status(400).json({ message: 'Nama kelas, mata pelajaran, dan guru wajib diisi.' });
    }

    try {
        const newClass = await prisma.class.create({
            data: {
                name,
                description,
                subjectId: parseInt(subjectId),
                teacherId: parseInt(teacherId)
            }
        });
        res.status(201).json(newClass);
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat kelas baru.' });
    }
};

// --- FUNGSI BARU: Menetapkan seorang guru sebagai wali kelas ---
export const assignHomeroomTeacher = async (req: AuthRequest, res: Response) => {
    const { classId } = req.params;
    const { teacherId } = req.body;

    // Jika teacherId null/kosong, kita akan menghapus penetapan wali kelas
    if (!teacherId) {
        try {
            const updatedClass = await prisma.class.update({
                where: { id: Number(classId) },
                data: {
                    homeroomTeacherId: null
                }
            });
            return res.status(200).json(updatedClass);
        } catch (error) {
            console.error("Gagal menghapus wali kelas:", error);
            return res.status(500).json({ message: "Gagal menghapus wali kelas." });
        }
    }

    try {
        // Validasi: Pastikan user yang dipilih adalah seorang guru
        const teacher = await prisma.user.findFirst({
            where: { id: Number(teacherId), role: 'guru' }
        });
        if (!teacher) {
            return res.status(404).json({ message: "Guru tidak ditemukan atau ID tidak valid." });
        }

        const updatedClass = await prisma.class.update({
            where: { id: Number(classId) },
            data: {
                homeroomTeacherId: Number(teacherId)
            }
        });
        res.status(200).json(updatedClass);
    } catch (error) {
        console.error("Gagal menetapkan wali kelas:", error);
        res.status(500).json({ message: "Gagal menetapkan wali kelas." });
    }
};

// Mengambil data pendaftaran siswa di satu kelas
export const getClassEnrollments = async (req: Request, res: Response) => {
    const { classId } = req.params;
    try {
        const targetClass = await prisma.class.findUnique({
            where: { id: parseInt(classId) },
            include: {
                members: {
                    include: {
                        user: { select: { id: true, fullName: true, nisn: true } }
                    }
                }
            }
        });

        // Ambil juga daftar semua siswa yang BELUM terdaftar di kelas ini
        const enrolledStudentIds = targetClass?.members.map(m => m.studentId) || [];
        const availableStudents = await prisma.user.findMany({
            where: {
                role: 'siswa',
                id: { notIn: enrolledStudentIds } // Filter siswa yang belum masuk kelas
            },
            select: { id: true, fullName: true }
        });

        res.json({
            classDetails: targetClass,
            availableStudents: availableStudents
        });

    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data pendaftaran.' });
    }
};

// Mendaftarkan siswa ke kelas
export const enrollStudent = async (req: Request, res: Response) => {
    const { classId } = req.params;
    const { studentId } = req.body;
    try {
        await prisma.class_Members.create({
            data: {
                classId: parseInt(classId),
                studentId: parseInt(studentId),
            }
        });
        res.status(201).json({ message: 'Siswa berhasil didaftarkan.' });
    } catch (error) {
        res.status(409).json({ message: 'Siswa sudah terdaftar di kelas ini.' });
    }
};

// Mengeluarkan siswa dari kelas
export const unenrollStudent = async (req: Request, res: Response) => {
    const { classId, studentId } = req.params;
    try {
        await prisma.class_Members.delete({
            where: {
                studentId_classId: {
                    studentId: parseInt(studentId),
                    classId: parseInt(classId),
                }
            }
        });
        res.status(200).json({ message: 'Siswa berhasil dikeluarkan.' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengeluarkan siswa.' });
    }
};