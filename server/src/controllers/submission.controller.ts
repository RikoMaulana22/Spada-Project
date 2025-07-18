// Path: src/controllers/submission.controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// --- FUNGSI BARU: Siswa mengumpulkan jawaban kuis ---
export const createSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id: assignmentId } = req.params;
    const studentId = req.user?.userId;
    const { answers, essayAnswer } = req.body; // Ambil jawaban pilgan atau esai

    if (!studentId || (!answers && !essayAnswer)) {
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

        // --- LOGIKA PENILAIAN YANG DISEMPURNAKAN ---
        let finalScore: number | null = null; // Default nilai adalah null (belum dinilai)

        if (assignment.type === 'pilgan') {
            let correctAnswers = 0;
            const totalQuestions = assignment.questions.length;
            if (answers) {
                for (const question of assignment.questions) {
                    const studentAnswerOptionId = answers[question.id];
                    const correctOption = question.options.find(opt => opt.isCorrect);
                    if (correctOption && correctOption.id === studentAnswerOptionId) {
                        correctAnswers++;
                    }
                }
            }
            finalScore = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
        }
        // Jika tipe esai, finalScore akan tetap null

        const submission = await prisma.submission.create({
            data: {
                studentId,
                assignmentId: Number(assignmentId),
                selectedOptions: assignment.type === 'pilgan' ? answers : undefined,
                essayAnswer: assignment.type === 'esai' ? essayAnswer : undefined,
                score: finalScore, // Simpan skor (bisa jadi null untuk esai)
            },
        });

        res.status(201).json({ message: "Jawaban berhasil dikumpulkan!", submission });

    } catch (error: any) {
        if (error.code === 'P2002') {
             res.status(409).json({ message: 'Anda sudah pernah mengumpulkan tugas ini.' });
             return;
        }
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
        // 1. Ambil dulu data tugas untuk verifikasi
        const assignment = await prisma.assignment.findUnique({
            where: { id: Number(assignmentId) },
            select: {
                topic: {
                    select: {
                        class: {
                            select: { teacherId: true }
                        }
                    }
                }
            }
        });

        if (!assignment) {
            res.status(404).json({ message: 'Tugas tidak ditemukan.' });
            return;
        }

        // 2. Lakukan verifikasi: Apakah ID guru yang login sama dengan ID guru di kelas ini?
        if (assignment.topic?.class?.teacherId !== teacherId) {
            res.status(403).json({ message: 'Akses ditolak. Anda bukan pengajar di kelas ini.' });
            return;
        }

        // 3. Jika verifikasi berhasil, baru ambil data submission
        const submissions = await prisma.submission.findMany({
            where: { assignmentId: Number(assignmentId) },
            include: {
                student: { select: { fullName: true, nisn: true } },
            },
            orderBy: { submissionDate: 'asc' },
        });

        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data submission.' });
    }
};

// --- FUNGSI BARU: Guru memberikan/memperbarui nilai ---
export const gradeSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id: submissionId } = req.params;
    const { score } = req.body;
    const teacherId = req.user?.userId; // Ambil ID guru yang login

    if (score === undefined) {
        res.status(400).json({ message: 'Nilai wajib diisi.' });
        return;
    }

    try {
        // 1. Ambil data submisi beserta data guru pemilik tugas
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

        // 2. Lakukan verifikasi otorisasi
        if (submission.assignment.topic?.class?.teacherId !== teacherId) {
            res.status(403).json({ message: 'Akses ditolak. Anda tidak berhak menilai submisi ini.' });
            return;
        }
        
        // 3. Jika verifikasi berhasil, baru update nilai
        const updatedSubmission = await prisma.submission.update({
            where: { id: Number(submissionId) },
            data: { score: parseFloat(score) },
        });
        
        res.status(200).json(updatedSubmission);
    } catch (error) {
        res.status(500).json({ message: 'Gagal memberikan nilai.' });
    }
};