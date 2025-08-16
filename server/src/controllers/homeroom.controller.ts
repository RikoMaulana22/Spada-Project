// Path: server/src/controllers/homeroom.controller.ts

import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export const getHomeroomDashboard = async (req: AuthRequest, res: Response) => {
    const teacherId = req.user?.userId;
    try {
        // Langkah 1: Temukan kelas yang diampu oleh wali kelas.
        const homeroomClass = await prisma.class.findFirst({
            where: { homeroomTeacherId: teacherId },
            include: {
                members: {
                    select: { user: { select: { id: true, fullName: true, nisn: true } } }
                },
            }
        });

        if (!homeroomClass) {
            return res.status(404).json({ message: 'Anda tidak ditugaskan sebagai wali kelas.' });
        }

        // Langkah 2: Dapatkan semua ID siswa di kelas tersebut.
        const studentIds = homeroomClass.members.map(member => member.user.id);

        if (studentIds.length === 0) {
            // Jika tidak ada siswa, kembalikan data kosong lebih awal.
            return res.json({ ...homeroomClass, dailyAttendances: [] });
        }

        // Langkah 3 (BARU & PENTING): Temukan SEMUA ID kelas yang diikuti oleh siswa-siswa tersebut.
        const allStudentMemberships = await prisma.class_Members.findMany({
            where: {
                studentId: { in: studentIds }
            },
            select: {
                classId: true
            }
        });
        const allClassIds = [...new Set(allStudentMemberships.map(m => m.classId))];

        // Langkah 4: Ambil data Absensi Harian (jika ada).
        const dailyAttendances = await prisma.dailyAttendance.findMany({
            where: { 
                studentId: { in: studentIds },
            },
            include: {
                class: {
                    select: {
                        subject: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        // Langkah 5: Ambil data Absensi E-learning dari SEMUA kelas yang relevan.
        const elearningAttendances = await prisma.attendanceRecord.findMany({
            where: {
                studentId: { in: studentIds },
                attendance: {
                    topic: {
                        classId: { in: allClassIds } // <-- Menggunakan daftar semua ID kelas
                    }
                }
            },
            include: {
                attendance: {
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

        // Langkah 6: Ubah struktur data Absensi E-learning agar seragam.
        const transformedElearningAttendances = elearningAttendances.map(att => ({
            id: att.id,
            date: att.timestamp,
            status: att.status,
            studentId: att.studentId,
            class: {
                subject: {
                    name: att.attendance.topic.class.subject.name
                }
            }
        }));

        // Langkah 7: Gabungkan kedua jenis absensi.
        const combinedAttendances = [
            ...dailyAttendances,
            ...transformedElearningAttendances
        ];
        
        const responseData = {
            ...homeroomClass,
            dailyAttendances: combinedAttendances
        };

        res.json(responseData);
    } catch (error) {
        console.error("Error getHomeroomDashboard:", error);
        res.status(500).json({ message: 'Gagal memuat data dashboard.' });
    }
};

// ... (fungsi lainnya seperti addHomeroomNote, getStudentDetailsForHomeroom, dll. tetap sama) ...
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
        // Validasi untuk memastikan yang mengakses adalah wali kelas yang sah
        const student = await prisma.user.findUnique({
            where: { id: Number(studentId) },
            include: { memberships: { include: { class: true } } }
        });

        if (!student) {
            return res.status(404).json({ message: 'Siswa tidak ditemukan.' });
        }

        const isHomeroomTeacher = student.memberships.some(m => m.class.homeroomTeacherId === teacherId);
        if (!isHomeroomTeacher) {
            return res.status(403).json({ message: 'Akses ditolak. Anda bukan wali kelas siswa ini.' });
        }

        // --- PENGAMBILAN DATA NILAI (TIDAK BERUBAH) ---
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

        const validSubmissions = submissions.filter(sub => sub.assignment?.topic?.class?.subject);
        const transformedGrades = validSubmissions.map(sub => ({
            id: sub.id,
            score: sub.score,
            component: {
                name: sub.assignment.title, 
                subject: {
                    name: sub.assignment.topic!.class.subject.name
                }
            }
        }));

        // --- INTI PERBAIKAN UNTUK ABSENSI ---

        // 1. Ambil semua ID kelas tempat siswa terdaftar
        const enrolledClassIds = student.memberships.map(m => m.classId);

        // 2. Ambil absensi e-learning dari SEMUA kelas tersebut
        const elearningAttendances = await prisma.attendanceRecord.findMany({
            where: {
                studentId: Number(studentId),
                attendance: {
                    topic: {
                        classId: { in: enrolledClassIds }
                    }
                }
            },
            orderBy: { timestamp: 'desc' }
        });
        
        // 3. Ambil absensi harian yang diinput manual oleh wali kelas
        const dailyAttendances = await prisma.dailyAttendance.findMany({ 
            where: { studentId: Number(studentId) }, 
            orderBy: { date: 'desc' } 
        });

        // 4. GABUNGKAN KEDUA JENIS ABSENSI MENJADI SATU
        const combinedAttendances = [
            ...dailyAttendances,
            // Ubah struktur data e-learning agar cocok
            ...elearningAttendances.map(att => ({
                id: att.id,
                date: att.timestamp, // Gunakan timestamp sebagai tanggal
                status: att.status,
                // Tambahkan data lain jika diperlukan oleh frontend
            }))
        ];

        // 5. Kirim data yang sudah lengkap ke frontend
        res.json({
            dailyAttendances: combinedAttendances,
            grades: transformedGrades
        });

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