import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export const getHomeroomDashboard = async (req: AuthRequest, res: Response) => {
    const teacherId = req.user?.userId;
    try {
        // 1. Cari kelas di mana user ini adalah wali kelasnya
        const homeroomClass = await prisma.class.findFirst({
            where: { homeroomTeacherId: teacherId },
            include: {
                // 2. Ambil daftar siswa di kelas tersebut
                members: {
                    select: {
                        user: {
                            select: { id: true, fullName: true, nisn: true }
                        }
                    }
                },
                // 3. Ambil semua catatan wali kelas untuk kelas ini
                studentNotes: {
                    orderBy: { date: 'desc' },
                    include: {
                        student: { select: { fullName: true } }
                    }
                },
                // 4. Ambil semua data absensi harian untuk kelas ini
                dailyAttendances: true,
                // 5. Ambil semua komponen nilai dan nilai siswa untuk kelas ini
                gradeComponents: {
                    include: {
                        grades: true,
                        subject: { select: { name: true } } // Ambil nama mapel
                    }
                }
            }
        });

        if (!homeroomClass) {
            return res.status(404).json({ message: 'Anda tidak ditugaskan sebagai wali kelas di kelas mana pun.' });
        }

        res.json(homeroomClass);
    } catch (error) {
        console.error("Error getHomeroomDashboard:", error);
        res.status(500).json({ message: 'Gagal memuat data dashboard.' });
    }
};

export const addHomeroomNote = async (req: AuthRequest, res: Response) => {
    const teacherId = req.user?.userId;
    const { content, studentId, classId, type } = req.body;

    try {
        const isHomeroomTeacher = await prisma.class.findFirst({
            where: { id: classId, homeroomTeacherId: teacherId }
        });

        if (!isHomeroomTeacher) {
            return res.status(403).json({ message: 'Akses ditolak. Anda bukan wali kelas dari kelas ini.' });
        }

        const newNote = await prisma.studentNote.create({
            data: {
                content,
                studentId,
                classId,
                authorId: teacherId!,
                type: type || 'BIMBINGAN_KONSELING'
            }
        });

        res.status(201).json(newNote);
    } catch (error) {
        console.error("Error addHomeroomNote:", error);
        res.status(500).json({ message: 'Gagal menyimpan catatan.' });
    }
};

// Mengambil detail nilai dan absensi untuk satu siswa
export const getStudentDetailsForHomeroom = async (req: AuthRequest, res: Response) => {
    const { studentId } = req.params;
    const teacherId = req.user?.userId;
    try {
        // Cek apakah guru ini adalah wali kelas dari siswa ini
        const student = await prisma.user.findUnique({
            where: { id: parseInt(studentId) },
            include: { memberships: { include: { class: true } } }
        });

        const isHomeroomTeacher = student?.memberships.some(m => m.class.homeroomTeacherId === teacherId);
        if (!isHomeroomTeacher) {
            return res.status(403).json({ message: 'Akses ditolak.' });
        }

        // Ambil data detail siswa
        const dailyAttendances = await prisma.dailyAttendance.findMany({ where: { studentId: parseInt(studentId) }, orderBy: { date: 'desc' } });
        const grades = await prisma.studentGrade.findMany({ 
            where: { studentId: parseInt(studentId) },
            include: { component: { include: { subject: true } } }
        });

        res.json({ dailyAttendances, grades });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil detail siswa.' });
    }
};

// Memperbarui satu record absensi harian
export const updateStudentAttendance = async (req: AuthRequest, res: Response) => {
    const { attendanceId } = req.params;
    const { status } = req.body; // status: 'HADIR', 'SAKIT', 'IZIN', 'ALPA'
    try {
        const updatedAttendance = await prisma.dailyAttendance.update({
            where: { id: parseInt(attendanceId) },
            data: { status }
        });
        res.json(updatedAttendance);
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui absensi.' });
    }
};

// Memperbarui satu record nilai
export const updateStudentGrade = async (req: AuthRequest, res: Response) => {
    const { gradeId } = req.params;
    const { score } = req.body;
    try {
        const updatedGrade = await prisma.studentGrade.update({
            where: { id: parseInt(gradeId) },
            data: { score: parseFloat(score) }
        });
        res.json(updatedGrade);
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui nilai.' });
    }
};