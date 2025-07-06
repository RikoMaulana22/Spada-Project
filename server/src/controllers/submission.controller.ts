// Path: src/controllers/submission.controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// --- FUNGSI BARU: Siswa mengumpulkan jawaban kuis ---
export const createSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id: assignmentId } = req.params;
    const studentId = req.user?.userId;
    const { answers } = req.body; // answers: { questionId: optionId }

    if (!studentId || !answers) {
        res.status(400).json({ message: 'Data tidak lengkap.' });
        return;
    }

    try {
        // Ambil detail tugas beserta jawaban yang benar
        const assignment = await prisma.assignment.findUnique({
            where: { id: Number(assignmentId) },
            include: {
                questions: { include: { options: true } },
            },
        });

        if (!assignment) {
            res.status(404).json({ message: 'Tugas tidak ditemukan.' });
            return;
        }

        let correctAnswers = 0;
        const totalQuestions = assignment.questions.length;

        // Penilaian Otomatis untuk Pilihan Ganda
        if (assignment.type === 'pilgan') {
            for (const question of assignment.questions) {
                const studentAnswerOptionId = answers[question.id];
                const correctOption = question.options.find(opt => opt.isCorrect);
                if (correctOption && correctOption.id === studentAnswerOptionId) {
                    correctAnswers++;
                }
            }
        }
        
        const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

        const submission = await prisma.submission.create({
            data: {
                studentId,
                assignmentId: Number(assignmentId),
                selectedOptions: answers,
                score, // Simpan skor yang dihitung secara otomatis
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


// --- FUNGSI BARU: Guru mengambil daftar submission untuk satu tugas ---
export const getSubmissionsForAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id: assignmentId } = req.params;
    try {
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

    if (score === undefined) {
        res.status(400).json({ message: 'Nilai wajib diisi.' });
        return;
    }

    try {
        const updatedSubmission = await prisma.submission.update({
            where: { id: Number(submissionId) },
            data: { score: parseFloat(score) },
        });
        res.status(200).json(updatedSubmission);
    } catch (error) {
        res.status(500).json({ message: 'Gagal memberikan nilai.' });
    }
};