// Path: server/src/controllers/questionBank.controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export const getQuestionsFromBank = async (req: AuthRequest, res: Response) => {
    try {
        const { search, subjectId, difficulty } = req.query;

        const where: any = {};

        if (search) {
            where.questionText = {
                contains: search as string,
                mode: 'insensitive', // Tidak peduli huruf besar/kecil
            };
        }

        if (subjectId) {
            where.subjectId = Number(subjectId);
        }

        if (difficulty) {
            where.difficulty = difficulty as string;
        }

        // 3. Gunakan 'where' di dalam query Prisma
        const questions = await prisma.questionBank.findMany({
            where, // Terapkan filter di sini
            include: {
                subject: { select: { name: true } },
                // Kita tetap tidak bisa include 'topic' karena relasinya tidak ada
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.status(200).json(questions);
    } catch (error) {
        console.error("Gagal mengambil soal dari gudang:", error);
        res.status(500).json({ message: 'Gagal memuat gudang soal.' });
    }
};

// Menambahkan soal baru ke dalam bank soal
export const addQuestionToBank = async (req: AuthRequest, res: Response) => {
    const { questionText, type, difficulty, subjectId, options } = req.body;
    const teacherId = req.user?.userId;

    if (!questionText || !type || !subjectId || !teacherId) {
        return res.status(400).json({ message: 'Data soal tidak lengkap.' });
    }

    try {
        const newQuestion = await prisma.questionBank.create({
            data: {
                questionText,
                type,
                difficulty,
                subjectId: Number(subjectId),
                teacherId,
                options: {
                    create: options, // Opsi jawaban langsung dibuat bersamaan
                },
            },
        });
        res.status(201).json(newQuestion);
    } catch (error) {
        console.error("Gagal menambah soal ke gudang:", error);
        res.status(500).json({ message: 'Gagal menyimpan soal baru.' });
    }
};