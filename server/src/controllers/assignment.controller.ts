// Path: assignment.controller.ts
import { Response, NextFunction } from 'express';
import { PrismaClient, AssignmentType } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

interface CreateAssignmentBody {
    title: string;
    description?: string;
    type: AssignmentType;
    dueDate: string;
    questions?: {
        questionText: string;
        options?: { optionText: string; isCorrect: boolean; explanation?: string; }[];
    }[];
    externalUrl?: string;
    startTime?: string;
    endTime?: string;
    timeLimit?: number;
    attemptLimit?: number;
    passingGrade?: number;
}

export const getSubmissionForReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // Ini adalah submissionId
        const userId = req.user?.userId;

        // Log untuk debugging
        console.log(`[DEBUG] Mencari submission dengan ID: ${id}`);
        console.log(`[DEBUG] User ID yang sedang login: ${userId}`);

        const submission = await prisma.submission.findUnique({
            where: { id: Number(id) },
            // =======================================================
            // == INI ADALAH QUERY PRISMA LENGKAPNYA ==
            // =======================================================
            include: {
                assignment: {
                    include: {
                        questions: {
                            orderBy: { id: 'asc' },
                            include: {
                                // `true` akan mengambil semua field dari tabel Option
                                // termasuk id, optionText, isCorrect, dan explanation
                                options: true 
                            }
                        }
                    }
                }
            }
        });

        if (!submission) {
            console.log(`[DEBUG] Submission dengan ID ${id} tidak ditemukan di database.`);
            res.status(404).json({ message: "Hasil pengerjaan tidak ditemukan." });
            return;
        }

        console.log(`[DEBUG] Pemilik submission (studentId): ${submission.studentId}`);

        if (submission.studentId !== userId) {
            console.log(`[DEBUG] Akses ditolak karena userId (${userId}) tidak cocok dengan studentId (${submission.studentId}).`);
            res.status(404).json({ message: "Hasil pengerjaan tidak ditemukan." });
            return;
        }

        console.log('[DEBUG] Akses diberikan. Mengirim data submission.');
        res.status(200).json(submission);

    } catch (error) {
        console.error("Gagal mengambil data review:", error);
        res.status(500).json({ message: "Gagal mengambil data review." });
    }
};


export const createAssignmentForTopic = async (req: AuthRequest, res: Response): Promise<void> => {
    const { topicId } = req.params;
    const { title, description, type, dueDate, questions, externalUrl,
        startTime, endTime, timeLimit, attemptLimit, passingGrade }: CreateAssignmentBody = req.body;

    // --- VALIDASI YANG LEBIH KETAT SEBELUM TRANSAKSI ---
    if (!title || !dueDate || !type) {
        res.status(400).json({ message: "Judul, tanggal tenggat, dan tipe tugas wajib diisi." });
        return;
    }

    if (type === 'link_google' && !externalUrl) {
        res.status(400).json({ message: "URL tugas wajib diisi untuk tipe Tugas Link." });
        return;
    }

    if ((type === 'pilgan' || type === 'esai')) {
        if (!questions || questions.length === 0) {
            res.status(400).json({ message: "Minimal satu pertanyaan wajib diisi." });
            return;
        }
        for (const q of questions) {
            if (!q.questionText || !q.questionText.trim()) {
                res.status(400).json({ message: "Setiap pertanyaan harus memiliki teks soal." });
                return;
            }
            if (type === 'pilgan' && (!q.options || q.options.length < 1)) {
                 res.status(400).json({ message: "Setiap soal pilihan ganda harus memiliki minimal satu pilihan jawaban." });
                 return;
            }
        }
    }
    // --- AKHIR VALIDASI ---

    try {
        const newAssignment = await prisma.$transaction(async (tx) => {
            const assignment = await tx.assignment.create({
                data: {
                    title,
                    description,
                    type,
                    dueDate: new Date(dueDate),
                    topicId: Number(topicId),
                    externalUrl: type === 'link_google' ? externalUrl : null,
                    startTime: startTime ? new Date(startTime) : null,
                    endTime: endTime ? new Date(endTime) : null,
                    timeLimit: timeLimit != null ? Number(timeLimit) : null,
                    attemptLimit: attemptLimit != null ? Number(attemptLimit) : null,
                    passingGrade: passingGrade != null ? Number(passingGrade) : null,

                },
            });

            if ((type === 'pilgan' || type === 'esai') && questions) {
                for (const q of questions) {
                    const createdQuestion = await tx.question.create({
                        data: {
                            questionText: q.questionText,
                            assignmentId: assignment.id,
                        },
                    });

                    if (type === 'pilgan' && q.options && q.options.length > 0) {
                        await tx.option.createMany({
                            data: q.options.map(opt => ({ ...opt, questionId: createdQuestion.id })),
                        });
                    }
                }
            }
            return assignment;
        });

        res.status(201).json(newAssignment);
    } catch (error) {
        console.error("GAGAL MEMBUAT TUGAS:", error); // Log error yang lebih jelas
        res.status(500).json({ message: "Terjadi kesalahan internal saat menyimpan tugas. Silakan cek log server." });
    }
};

// GANTIKAN KEMBALI FUNGSI submitAssignment ANDA DENGAN VERSI LENGKAP INI

export const submitAssignment = async (req: AuthRequest, res: Response) => {
    try {
        const { assignmentId } = req.params;
        const studentId = req.user?.userId;
        const { answers, essayAnswer, startedOn, timeTakenMs } = req.body;

        if (!studentId) {
            return res.status(401).json({ message: "Otentikasi gagal." });
        }

        const assignment = await prisma.assignment.findUnique({
            where: { id: Number(assignmentId) },
            include: { 
                questions: { include: { options: { where: { isCorrect: true } } } },
                topic: { select: { classId: true } } 
            }
        });

        if (!assignment) {
            return res.status(404).json({ message: "Tugas tidak ditemukan." });
        }

        // --- TAMBAHKAN PENGECEKAN NULL DI SINI ---
        if (!assignment.topic || !assignment.topic.classId) {
            // Menangani kasus jika tugas tidak terhubung ke topik atau kelas
            console.error(`Data Error: Tugas dengan ID ${assignmentId} tidak terhubung ke topik atau kelas.`);
            return res.status(400).json({ message: "Struktur data error: Tugas ini tidak terhubung ke kelas manapun." });
        }
        // --- AKHIR PENGECEKAN NULL ---

        // Kode pengecekan pendaftaran sekarang aman karena kita sudah memastikan assignment.topic ada
        const studentEnrollment = await prisma.class_Members.findUnique({
            where: {
                studentId_classId: {
                    studentId: studentId,
                    classId: assignment.topic.classId // <-- BARIS INI SEKARANG AMAN
                }
            }
        });

        if (!studentEnrollment) {
            return res.status(403).json({ message: "Akses ditolak. Anda tidak terdaftar di kelas ini." });
        }

        // Logika perhitungan skor dan penyimpanan data (tidak ada perubahan)
        let score = null;
        if (assignment.type === 'pilgan' && answers) {
            let correctCount = 0;
            assignment.questions.forEach(q => {
                if (answers[q.id] === q.options[0]?.id) {
                    correctCount++;
                }
            });
            score = (correctCount / assignment.questions.length) * 100;
        }

        const newSubmission = await prisma.submission.create({
            data: {
                studentId,
                assignmentId: Number(assignmentId),
                score,
                essayAnswer: assignment.type === 'esai' ? essayAnswer : null,
                selectedOptions: assignment.type === 'pilgan' ? answers : {},
                startedOn: new Date(startedOn),
                completedOn: new Date(),
                timeTakenMs: Number(timeTakenMs),
            }
        });

        res.status(201).json({
            message: "Jawaban Anda berhasil dikumpulkan!",
            submission: newSubmission
        });

    } catch (error) {
        console.error("Gagal saat memproses pengumpulan tugas:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat memproses jawaban Anda." });
    }
};

export const getAssignmentSubmissions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // ID dari tugas (assignment)
        const teacherId = req.user?.userId;

        const assignment = await prisma.assignment.findUnique({
            where: { id: Number(id) },
            select: {
                title: true,
                topic: { select: { class: { select: { teacherId: true } } } }, // Untuk verifikasi guru
                submissions: {
                    orderBy: { submissionDate: 'asc' },
                    select: {
                        id: true,
                        submissionDate: true,
                        score: true,
                        essayAnswer: true, // Kirim jawaban esai untuk ditampilkan di modal penilaian
                        student: {
                            select: {
                                id: true,
                                fullName: true,
                                nisn: true
                            }
                        }
                    }
                }
            }
        });

        if (!assignment) {
            res.status(404).json({ message: "Tugas tidak ditemukan." });
            return;
        }

        // Verifikasi: pastikan yang meminta adalah guru dari kelas tersebut
        if (assignment.topic?.class?.teacherId !== teacherId) {
            res.status(403).json({ message: "Akses ditolak. Anda bukan guru kelas ini." });
            return;
        }

        res.status(200).json(assignment);
    } catch (error) {
        console.error("Gagal mengambil data pengumpulan tugas:", error);
        res.status(500).json({ message: "Gagal mengambil data pengumpulan." });
    }
};


export const getAssignmentDetails = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const assignment = await prisma.assignment.findUnique({
            where: { id: Number(id) },
            // 'include' ini memastikan semua data yang dibutuhkan frontend ikut terkirim
            include: {
                questions: {
                    orderBy: { id: 'asc' },
                    include: {
                        options: {
                            select: { id: true, optionText: true },
                        },
                    },
                },
                // PASTIKAN BLOK INI ADA: Ini akan mengambil data topik terkait
                topic: {
                    include: {
                        class: {
                            select: {
                                id: true,
                                teacherId: true
                            }
                        }
                    }
                }
            }
        });

        if (!assignment) {
            res.status(404).json({ message: 'Tugas atau kuis tidak ditemukan.' });
            return;
        }
        
        res.status(200).json(assignment);

    } catch (error) {
        console.error("Gagal mengambil detail tugas:", error);
        res.status(500).json({ message: 'Gagal mengambil detail tugas.' });
    }
};

export const gradeSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { submissionId } = req.params;
        const { score } = req.body;
        const teacherId = req.user?.userId;

        if (score === undefined || isNaN(parseFloat(score)) || score < 0 || score > 100) {
            res.status(400).json({ message: "Nilai harus berupa angka antara 0 dan 100." });
            return;
        }

        // Verifikasi opsional: cek apakah guru ini berhak menilai submission ini
        const submission = await prisma.submission.findUnique({
            where: { id: Number(submissionId) },
            select: { assignment: { select: { topic: { select: { class: { select: { teacherId: true } } } } } } }
        });

        if (!submission || submission.assignment?.topic?.class?.teacherId !== teacherId) {  
             res.status(403).json({ message: "Akses ditolak." });
            return;
        }

        const updatedSubmission = await prisma.submission.update({
            where: { id: Number(submissionId) },
            data: { score: parseFloat(score) }
        });

        res.status(200).json(updatedSubmission);
    } catch (error) {
        console.error("Gagal memberikan nilai:", error);
        res.status(500).json({ message: "Gagal memberikan nilai." });
    }
};

// FUNGSI BARU: Mendapatkan semua tugas dalam sebuah TOPIK
export const getAssignmentsForTopic = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    // PERUBAHAN: Mengambil topicId, bukan classId
    const { topicId } = req.params;
    try {
        const assignments = await prisma.assignment.findMany({
            where: {
                // PERUBAHAN: Menggunakan topicId
                topicId: Number(topicId),
            },
            orderBy: {
                dueDate: 'asc',
            },
            select: {
                id: true,
                title: true,
                type: true,
                dueDate: true,
            }
        });
        res.status(200).json(assignments);
    } catch (error) {
        console.error("Gagal mengambil daftar tugas:", error);
        res.status(500).json({ message: "Gagal mengambil daftar tugas" });
    }
};
export const getAssignmentById = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const assignment = await prisma.assignment.findUnique({
            where: { id: Number(id) },
            // --- PERBAIKAN DI SINI ---
            // Tambahkan 'topic' ke dalam 'include'
            include: {
                questions: {
                    orderBy: { id: 'asc' },
                    include: {
                        options: {
                            select: { id: true, optionText: true },
                        },
                    },
                },
                topic: {
                    include: {
                        class: {
                            select: {
                                id: true,
                                teacher: {
                                    select: {
                                        id: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
        });

        if (!assignment) {
            res.status(404).json({ message: 'Tugas atau kuis tidak ditemukan.' });
            return;
        }
        
        res.status(200).json(assignment);

    } catch (error) {
        console.error("Gagal mengambil detail tugas:", error);
        res.status(500).json({ message: 'Gagal mengambil detail tugas.' });
    }
};

// --- PERBAIKAN 4: Sempurnakan logika updateAssignment ---
export const updateAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { title, description, dueDate, type, externalUrl, startTime, endTime, timeLimit, attemptLimit, passingGrade } = req.body;

    if (!title || !dueDate || !type) {
        res.status(400).json({ message: "Judul, tanggal tenggat, dan tipe tugas wajib diisi." });
        return;
    }

    try {
        const existingAssignment = await prisma.assignment.findUnique({ where: { id: Number(id) } });
        if (!existingAssignment) {
            res.status(404).json({ message: "Tugas tidak ditemukan." });
            return;
        }

        const dataToUpdate: any = {
            title,
            description,
            type,
            dueDate: new Date(dueDate),
            externalUrl: type === 'link_google' ? externalUrl : null,
            startTime: startTime ? new Date(startTime) : null,
            endTime: endTime ? new Date(endTime) : null,
            timeLimit: timeLimit ? Number(timeLimit) : null,
            attemptLimit: attemptLimit ? Number(attemptLimit) : null,
            passingGrade: passingGrade ? Number(passingGrade) : null,
        };

        if (existingAssignment.type !== 'link_google' && type === 'link_google') {
            await prisma.question.deleteMany({
                where: { assignmentId: Number(id) },
            });
        }

        const updatedAssignment = await prisma.assignment.update({
            where: { id: Number(id) },
            data: dataToUpdate,
        });

        res.status(200).json(updatedAssignment);
    } catch (error) {
        console.error("Gagal mengupdate tugas:", error);
        res.status(500).json({ message: "Gagal mengupdate tugas." });
    }
};
// --- FUNGSI BARU: Siswa/Guru mengambil semua tugas yang relevan ---
export const getMyAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId) {
        res.status(401).json({ message: "Otentikasi diperlukan." });
        return;
    }

    try {
        let assignments;
        if (role === 'guru') {
            // Guru: Ambil semua tugas dari kelas yang dia ajar
            const classes = await prisma.class.findMany({
                where: { teacherId: userId },
                select: { topics: { select: { assignments: { include: { topic: { select: { class: { select: { name: true } } } } } } } } }
            });
            assignments = classes.flatMap(c => c.topics.flatMap(t => t.assignments));
        } else { // Siswa
            // Siswa: Ambil semua tugas dari kelas yang diikuti
            const memberships = await prisma.class_Members.findMany({
                where: { studentId: userId },
                select: { class: { select: { topics: { select: { assignments: { include: { topic: { select: { class: { select: { name: true } } } } } } } } } } }
            });
            assignments = memberships.flatMap(m => m.class.topics.flatMap(t => t.assignments));
        }

        res.status(200).json(assignments);
    } catch (error) {
        console.error("Gagal mengambil tugas saya:", error);
        res.status(500).json({ message: "Gagal mengambil daftar tugas." });
    }
};
