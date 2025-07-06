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
    questions: {
        questionText: string;
        options?: {
            optionText: string;
            isCorrect: boolean;
        }[];
    }[];
}

// FUNGSI BARU: Guru membuat tugas baru di dalam sebuah TOPIK
export const createAssignmentForTopic = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    // PERUBAHAN: Mengambil topicId, bukan classId
    const { topicId } = req.params;
    const { title, description, type, dueDate, questions }: CreateAssignmentBody = req.body;

    if (!title || !type || !dueDate || !questions || questions.length === 0) {
        res.status(400).json({ message: "Data tidak lengkap. Judul, tipe, tanggal, dan minimal satu pertanyaan wajib diisi." });
        return;
    }

    try {
        const newAssignment = await prisma.$transaction(async (tx) => {
            // 1. Buat Assignment utama, terhubung ke topicId
            const assignment = await tx.assignment.create({
                data: {
                    title,
                    description,
                    type,
                    dueDate: new Date(dueDate),
                    // PERUBAHAN: Menggunakan topicId
                    topicId: Number(topicId),
                },
            });

            // 2. Buat semua pertanyaan dan pilihan jawabannya (logika ini tetap sama)
            for (const q of questions) {
                const createdQuestion = await tx.question.create({
                    data: {
                        questionText: q.questionText,
                        assignmentId: assignment.id,
                    },
                });

                if (type === 'pilgan' && q.options && q.options.length > 0) {
                    await tx.option.createMany({
                        data: q.options.map(opt => ({
                            ...opt,
                            questionId: createdQuestion.id,
                        })),
                    });
                }
            }
            return assignment;
        });

        res.status(201).json(newAssignment);
    } catch (error) {
        console.error("Gagal membuat tugas:", error);
        res.status(500).json({ message: "Gagal membuat tugas" });
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
      include: {
        // Sertakan semua pertanyaan yang terkait dengan tugas ini
        questions: {
          orderBy: { id: 'asc' }, // Urutkan pertanyaan
          // Sertakan semua pilihan jawaban untuk setiap pertanyaan
          include: {
            // Pilih hanya field yang dibutuhkan siswa, jangan kirim 'isCorrect'
            options: {
              select: {
                id: true,
                optionText: true,
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      res.status(404).json({ message: 'Tugas atau kuis tidak ditemukan.' });
      return;
    }
    
    // Jangan kirim jawaban yang benar ke siswa
    const safeAssignment = {
        ...assignment,
        questions: assignment.questions.map(q => ({...q, options: q.options.map(o => ({...o, isCorrect: undefined}))}))
    };

    res.status(200).json(safeAssignment);
  } catch (error) {
    console.error("Gagal mengambil detail tugas:", error);
    res.status(500).json({ message: 'Gagal mengambil detail tugas.' });
  }
};