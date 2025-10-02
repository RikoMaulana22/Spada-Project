// Path: src/controllers/submission.controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export const submitAssignment = async (req: AuthRequest, res: Response) => {
    const { assignmentId } = req.params;
    const studentId = req.user?.userId;
    const { answers, essayAnswer, startedOn, timeTakenMs } = req.body;

    if (!studentId) {
        return res.status(401).json({ message: "Otentikasi gagal." });
    }

    try {
        // Langkah 1: Ambil detail tugas dan jumlah percobaan sebelumnya
        const assignment = await prisma.assignment.findUnique({
            where: { id: Number(assignmentId) },
            include: {
                questions: {
                    include: {
                        question: {
                            include: { options: true }
                        }
                    }
                },
                _count: {
                    select: {
                        submissions: {
                            where: { studentId: studentId }
                        }
                    }
                }
            }
        });

        if (!assignment) {
            return res.status(404).json({ message: "Tugas tidak ditemukan." });
        }

        // Langkah 2: Validasi Batas Pengerjaan
        const attemptLimit = assignment.attemptLimit ?? 1; // Default 1 jika null
        const currentAttemptCount = assignment._count.submissions;

        if (currentAttemptCount >= attemptLimit) {
            return res.status(403).json({ message: 'Anda telah mencapai batas maksimal pengerjaan untuk tugas ini.' });
        }

        // Langkah 3: Hitung skor jika Pilihan Ganda, atau set null untuk Esai
        let score: number | null = null;
        if (assignment.type === 'pilgan') {
            if (!answers || typeof answers !== 'object') {
                return res.status(400).json({ message: "Format jawaban pilihan ganda tidak valid." });
            }
            let correctCount = 0;
            assignment.questions.forEach(aq => {
                const question = aq.question;
                const correctOption = question.options.find(opt => opt.isCorrect);
                if (correctOption && (answers as any)[question.id] === correctOption.id) {
                    correctCount++;
                }
            });
            score = assignment.questions.length > 0 ? (correctCount / assignment.questions.length) * 100 : 0;
        }

        // Langkah 4: Simpan jawaban ke database
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

        // Langkah 5: Kirim respons yang sesuai ke frontend
        if (assignment.type === 'esai') {
            res.status(201).json({
                message: "Tugas esai Anda berhasil dikumpulkan!",
                submissionType: 'esai'
            });
        } else { // 'pilgan'
            res.status(201).json({
                message: "Jawaban Anda berhasil dikumpulkan!",
                submission: newSubmission,
                submissionType: 'pilgan'
            });
        }
    } catch (error) {
        console.error("Gagal saat memproses pengumpulan tugas:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat memproses jawaban Anda." });
    }
};


export const getSubmissionReview = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id: submissionId } = req.params;
    const userId = req.user?.userId;
    try {
        const submission = await prisma.submission.findUnique({
            where: { id: Number(submissionId) },
            include: {
                assignment: {
                    include: {
                        questions: {
                            orderBy: { order: 'asc' },
                            include: {
                                question: {
                                    include: {
                                        options: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!submission || submission.studentId !== userId) {
            res.status(404).json({ message: "Data pengerjaan tidak ditemukan." });
            return;
        }
        res.status(200).json(submission);
    } catch (error) {
        console.error("Gagal mengambil data review:", error);
        res.status(500).json({ message: "Gagal mengambil data review." });
    }
};

// --- FUNGSI BARU: Siswa mengumpulkan jawaban kuis ---
export const createSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id: assignmentId } = req.params;
    const studentId = req.user?.userId;
    const { answers, essayAnswer } = req.body;

    if (!studentId) {
        res.status(401).json({ message: 'Otentikasi diperlukan.' });
        return;
    }

    try {
        const assignment = await prisma.assignment.findUnique({
            where: { id: Number(assignmentId) },
            include: {
                questions: { // Ambil join table AssignmentQuestion
                    include: {
                        question: { // Dari join table, ambil data QuestionBank
                            include: {
                                options: true // Dari QuestionBank, ambil semua options
                            }
                        }
                    }
                }
            },
        });

        if (!assignment) {
            res.status(404).json({ message: 'Tugas tidak ditemukan.' });
            return;
        }

        const currentAttemptCount = await prisma.submission.count({
            where: {
                studentId: studentId,
                assignmentId: Number(assignmentId),
            },
        });

        if (assignment.attemptLimit !== null && currentAttemptCount >= assignment.attemptLimit) {
            res.status(403).json({ message: 'Anda telah mencapai batas maksimal pengerjaan untuk tugas ini.' });
            return;
        }

        let finalScore: number | null = null;
        if (assignment.type === 'pilgan') {
            let correctAnswers = 0;
            const totalQuestions = assignment.questions.length;

            if (answers && typeof answers === 'object') {
                // PERBAIKAN: Cara mengakses data disesuaikan dengan struktur query baru
                for (const aq of assignment.questions) { // aq adalah AssignmentQuestion
                    const question = aq.question; // question adalah QuestionBank
                    const studentAnswerOptionId = (answers as any)[question.id];
                    const correctOption = question.options.find(opt => opt.isCorrect);

                    if (studentAnswerOptionId !== undefined && correctOption && correctOption.id === studentAnswerOptionId) {
                        correctAnswers++;
                    }
                }
            }
            finalScore = totalQuestions > 0 ? parseFloat(((correctAnswers / totalQuestions) * 100).toFixed(2)) : 0;
        }

        const submission = await prisma.submission.create({
            data: {
                studentId,
                assignmentId: Number(assignmentId),
                selectedOptions: assignment.type === 'pilgan' ? answers : undefined,
                essayAnswer: assignment.type === 'esai' ? essayAnswer : undefined,
                score: finalScore,
            },
        });

        res.status(201).json({ message: "Jawaban berhasil dikumpulkan!", submission: submission });
    } catch (error: any) {
        console.error("Gagal mengumpulkan jawaban:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

export const getMyGrades = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const studentId = req.user?.userId;

        if (!studentId) {
            res.status(401).json({ message: "Otentikasi diperlukan." });
            return;
        }

        const grades = await prisma.submission.findMany({
            where: {
                studentId: studentId,
                score: {
                    not: null,
                },
            },
            orderBy: {
                submissionDate: 'desc',
            },
            select: {
                id: true,
                score: true,
                submissionDate: true,
                assignment: {
                    select: {
                        title: true,
                        topic: {
                            select: {
                                class: {
                                    select: {
                                        name: true,
                                        subject: {
                                            select: {
                                                name: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        res.status(200).json(grades);
    } catch (error) {
        console.error("Gagal mengambil data nilai:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server saat mengambil data nilai." });
    }
};


// --- FUNGSI BARU: Guru mengambil daftar submission untuk satu tugas ---
export const getSubmissionsForAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id: assignmentId } = req.params;
    const teacherId = req.user?.userId;

    try {
        const assignmentWithSubmissions = await prisma.assignment.findUnique({
            where: { id: Number(assignmentId) },
            include: {
                topic: {
                    select: {
                        class: {
                            select: { teacherId: true }
                        }
                    }
                },
                submissions: {
                    include: {
                        student: { select: { fullName: true, nisn: true } },
                    },
                    orderBy: { submissionDate: 'asc' },
                }
            }
        });

        if (!assignmentWithSubmissions) {
            res.status(404).json({ message: 'Tugas tidak ditemukan.' });
            return;
        }

        if (assignmentWithSubmissions.topic?.class?.teacherId !== teacherId) {
            res.status(403).json({ message: 'Akses ditolak. Anda bukan pengajar di kelas ini.' });
            return;
        }

        res.status(200).json(assignmentWithSubmissions);

    } catch (error) {
        console.error("Gagal mengambil data submission:", error)
        res.status(500).json({ message: 'Gagal mengambil data submission.' });
    }
};

// --- FUNGSI BARU: Guru memberikan/memperbarui nilai ---
export const gradeSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id: submissionId } = req.params;
    const { score } = req.body;
    const teacherId = req.user?.userId;

    const scoreValue = parseFloat(score);
    if (score === undefined || isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
        res.status(400).json({ message: 'Nilai harus berupa angka yang valid antara 0 dan 100.' });
        return;
    }

    try {
        const submission = await prisma.submission.findUnique({
            where: { id: Number(submissionId) },
            select: {
                assignment: {
                    select: {
                        topic: {
                            select: {
                                class: {
                                    select: { teacherId: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!submission) {
            res.status(404).json({ message: 'Submisi tidak ditemukan.' });
            return;
        }

        if (submission.assignment.topic?.class?.teacherId !== teacherId) {
            res.status(403).json({ message: 'Akses ditolak. Anda tidak berhak menilai submisi ini.' });
            return;
        }

        const updatedSubmission = await prisma.submission.update({
            where: { id: Number(submissionId) },
            data: { score: scoreValue },
        });

        res.status(200).json(updatedSubmission);
    } catch (error) {
        res.status(500).json({ message: 'Gagal memberikan nilai.' });
    }
};
