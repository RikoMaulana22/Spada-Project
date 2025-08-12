import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export const getHomeroomDashboard = async (req: AuthRequest, res: Response) => {
    const teacherId = req.user?.userId;
    try {
        const homeroomClass = await prisma.class.findFirst({
            where: { homeroomTeacherId: teacherId },
            include: {
                members: {
                    select: { user: { select: { id: true, fullName: true, nisn: true } } }
                },
                studentNotes: { /* ... */ },
                gradeComponents: { /* ... */ }
            }
        });

        if (!homeroomClass) {
            return res.status(404).json({ message: 'Anda tidak ditugaskan sebagai wali kelas.' });
        }

        const studentIds = homeroomClass.members.map(member => member.user.id);

        const dailyAttendances = await prisma.dailyAttendance.findMany({
            where: {
                studentId: { in: studentIds }
            },
            include: {
                class: {
                    select: {
                        subject: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });
        
        const responseData = {
            ...homeroomClass,
            dailyAttendances
        };

        res.json(responseData); // Pastikan mengirim responseData
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
        // Verifikasi keamanan (tidak berubah)
        const student = await prisma.user.findUnique({
            where: { id: Number(studentId) },
            include: { memberships: { include: { class: true } } }
        });
        const isHomeroomTeacher = student?.memberships.some(m => m.class.homeroomTeacherId === teacherId);
        if (!isHomeroomTeacher) {
            return res.status(403).json({ message: 'Akses ditolak.' });
        }

        // 1. Ambil data nilai dari tabel `Submission` (tidak berubah)
        const submissions = await prisma.submission.findMany({ 
            where: { 
                studentId: Number(studentId),
                score: { not: null }
            },
            include: { 
                assignment: {
                    include: {
                        topic: {
                            include: {
                                class: {
                                    include: {
                                        subject: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // --- PERBAIKAN DI SINI: Saring data yang tidak lengkap ---
        const validSubmissions = submissions.filter(sub =>
            sub.assignment &&
            sub.assignment.topic &&
            sub.assignment.topic.class &&
            sub.assignment.topic.class.subject
        );

        // 2. Transformasi data yang SUDAH BERSIH
        const transformedGrades = validSubmissions.map(sub => ({
            id: sub.id,
            score: sub.score,
            studentId: sub.studentId,
            component: {
                // Sekarang aman untuk diakses tanpa error TypeScript
                name: sub.assignment.title, 
                subject: {
                    name: sub.assignment.topic?.class.subject.name
                }
            }
        }));

        // 3. Ambil data absensi (tidak berubah)
        const dailyAttendances = await prisma.dailyAttendance.findMany({ 
            where: { studentId: Number(studentId) }, 
            orderBy: { date: 'desc' } 
        });

        // 4. Kirim data yang sudah bersih dan ditransformasi
        res.json({ dailyAttendances, grades: transformedGrades });

    } catch (error) {
        console.error("Gagal mengambil detail siswa:", error);
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

// --- TAMBAHKAN FUNGSI BARU DI SINI ---
/**
 * @description Menghapus satu catatan absensi harian berdasarkan ID-nya.
 * @route DELETE /api/homeroom/attendance/:attendanceId
 */
export const deleteStudentAttendance = async (req: AuthRequest, res: Response) => {
    const { attendanceId } = req.params;
    // Anda bisa menambahkan validasi keamanan di sini jika perlu,
    // misalnya memastikan yang menghapus adalah wali kelas yang berhak.

    try {
        // Cari catatan absensi untuk memastikan ada sebelum dihapus
        const attendanceToDelete = await prisma.dailyAttendance.findUnique({
            where: { id: parseInt(attendanceId) }
        });

        if (!attendanceToDelete) {
            return res.status(404).json({ message: 'Catatan absensi tidak ditemukan.' });
        }

        // Lakukan operasi hapus
        await prisma.dailyAttendance.delete({
            where: { id: parseInt(attendanceId) },
        });

        res.status(200).json({ message: 'Catatan absensi berhasil dihapus.' });
    } catch (error) {
        console.error("Gagal menghapus catatan absensi:", error);
        res.status(500).json({ message: 'Gagal menghapus catatan absensi.' });
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

