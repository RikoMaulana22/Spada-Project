// Path: src/controllers/submission.controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();


export const getSubmissionReview = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id: submissionId } = req.params;
    const userId = req.user?.userId;

    try {
        const submission = await prisma.submission.findUnique({
            where: { id: Number(submissionId) },
            select: {
                id: true,
                score: true,
                selectedOptions: true,
                submissionDate: true, // Akan digunakan sebagai startedOn
                updatedAt: true,      // Akan digunakan sebagai completedOn
                studentId: true,
                assignment: {
                    select: {
                        title: true,
                        questions: {
                            select: {
                                id: true,
                                questionText: true,
                                options: {
                                    select: {
                                        id: true,
                                        optionText: true,
                                        isCorrect: true,
                                        explanation: true, // <-- PERBAIKAN DI SINI
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

        // Transformasi data agar sesuai dengan yang diharapkan frontend
        const startedOn = submission.submissionDate;
        const completedOn = submission.updatedAt;
        const timeTakenMs = completedOn.getTime() - startedOn.getTime();
        
        const responseData = {
            ...submission,
            startedOn,
            completedOn,
            timeTakenMs
        };

        // Hapus field yang tidak lagi diperlukan agar output bersih
        delete (responseData as any).submissionDate;
        delete (responseData as any).updatedAt;
        delete (responseData as any).studentId;

        res.status(200).json(responseData);
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
    if (!answers && !essayAnswer) {
        res.status(400).json({ message: 'Jawaban tidak boleh kosong.' });
        return;
    }

    try {
        const assignment = await prisma.assignment.findUnique({
            where: { id: Number(assignmentId) },
            include: { questions: { include: { options: true } } },
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

            // PERBAIKAN 1: Pastikan 'answers' adalah objek sebelum di-loop
            if (answers && typeof answers === 'object') {
                for (const question of assignment.questions) {
                    const studentAnswerOptionId = answers[question.id];
                    const correctOption = question.options.find(opt => opt.isCorrect);
                    
                    if (studentAnswerOptionId !== undefined && correctOption && correctOption.id === studentAnswerOptionId) {
                        correctAnswers++;
                    }
                }
            }
            // PERBAIKAN 2: Pastikan hasil skor memiliki maksimal 2 angka desimal
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

        res.status(201).json({ message: "Jawaban berhasil dikumpulkan!", submissionId: submission.id });

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
          not: null, // Hanya ambil submisi yang sudah punya nilai
        },
      },
      orderBy: {
        submissionDate: 'desc', // Urutkan dari yang terbaru
      },
      // Pilih data terkait yang dibutuhkan oleh frontend
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
    const teacherId = req.user?.userId; // Ambil ID guru yang login

    try {
        // 1. Ambil data tugas DAN semua submission-nya dalam satu query
        const assignmentWithSubmissions = await prisma.assignment.findUnique({
            where: { id: Number(assignmentId) },
            include: {
                // Ambil semua data yang dibutuhkan frontend dari tugas ini
                topic: {
                    select: {
                        class: {
                            select: { teacherId: true } // Untuk verifikasi
                        }
                    }
                },
                // Langsung sertakan semua submission yang terkait dengan tugas ini
                submissions: {
                    include: {
                        // Sertakan juga detail siswa untuk setiap submission
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

        // 2. Lakukan verifikasi kepemilikan
        if (assignmentWithSubmissions.topic?.class?.teacherId !== teacherId) {
            res.status(403).json({ message: 'Akses ditolak. Anda bukan pengajar di kelas ini.' });
            return;
        }

        // 3. Kirim SELURUH objek hasil query ke frontend
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

    // PERBAIKAN 3: Validasi input skor yang lebih ketat
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
            data: { score: scoreValue }, // Gunakan scoreValue yang sudah divalidasi dan diubah ke float
        });
        
        res.status(200).json(updatedSubmission);
    } catch (error) {
        res.status(500).json({ message: 'Gagal memberikan nilai.' });
    }
};