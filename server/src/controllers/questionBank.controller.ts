// Di file: server/src/controllers/questionBank.controller.ts

import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import fs from 'fs';
import mammoth from 'mammoth';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// GET all questions
export const getBankedQuestions = async (req: Request, res: Response) => {
    const { search, subjectId, difficulty } = req.query;
    const where: Prisma.QuestionBankWhereInput = {};

    if (search) where.questionText = { contains: search as string, mode: 'insensitive' };
    if (subjectId) where.subjectId = Number(subjectId);
    // Perbaikan: Konversi ke huruf besar
    if (difficulty) where.difficulty = (difficulty as string).toUpperCase() as any;

    try {
        const questions = await prisma.questionBank.findMany({
            where,
            // Perbaikan: Gunakan relasi 'author' sesuai skema
            include: { subject: { select: { id: true, name: true } }, teacher: { select: { fullName: true }}},
            orderBy: { createdAt: 'desc' },
        });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data gudang soal." });
    }
};

// Impor Soal dari Dokumen Word
export const importFromWord = async (req: AuthRequest, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ message: 'File Word (.docx) tidak ditemukan.' });
    }

    const { subjectId, difficulty } = req.body;
    if (!subjectId || !difficulty) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Mata pelajaran dan tingkat kesulitan wajib dipilih." });
    }

    const filePath = req.file.path;
    const authorId = req.user!.userId;

    try {
        const { value: text } = await mammoth.extractRawText({ path: filePath });

        const questionBlockRegex = /(\d+)\.\s*([\s\S]*?)(?=(?:\n\s*\d+\.)|(?:\n\s*$))/g;
        const optionRegex = /([A-Ea-e])\.\s*([\s\S]*?)(?=\n[A-Ea-e]\.|\n*$)/g;
        const correctOptionRegex = /\*([A-Ea-e])\./;

        const questionsToCreate: Prisma.QuestionBankCreateInput[] = [];
        let match;

        while ((match = questionBlockRegex.exec(text)) !== null) {
            const questionText = match[2].split('\n')[0].trim();
            const blockContent = match[2];
            
            const correctMatch = blockContent.match(correctOptionRegex);
            const correctLetter = correctMatch ? correctMatch[1].toUpperCase() : null;

            if (!correctLetter) continue;

            const options: Prisma.QuestionOptionCreateWithoutQuestionInput[] = [];
            let optionMatch;
            while ((optionMatch = optionRegex.exec(blockContent)) !== null) {
                const letter = optionMatch[1].toUpperCase();
                const optionText = optionMatch[2].trim().replace(/^\*/, '').trim();
                options.push({
                    optionText: optionText,
                    isCorrect: letter === correctLetter
                });
            }
            
            if (questionText && options.length > 0) {
                 questionsToCreate.push({
                    questionText,
                    type: 'pilgan',
                    // PERBAIKAN 1: Konversi difficulty ke huruf besar
                    difficulty: difficulty.toUpperCase(),
                    subject: { connect: { id: parseInt(subjectId) } },
                    // PERBAIKAN 2: Gunakan relasi 'author' (atau 'teacher' sesuai skema Anda)
                    teacher: { connect: { id: authorId } },
                    options: { create: options },
                });
            }
        }

        if (questionsToCreate.length === 0) {
            return res.status(400).json({ message: 'Tidak ada soal valid yang ditemukan. Periksa format dokumen Anda.' });
        }

        await prisma.$transaction(async (tx) => {
            for (const qData of questionsToCreate) {
                await tx.questionBank.create({ data: qData });
            }
        });
        
        res.status(201).json({ message: `${questionsToCreate.length} soal berhasil diimpor.` });

    } catch (error: any) {
        console.error("[Word Import Error]", error);
        res.status(500).json({ message: error.message || "Terjadi kesalahan saat memproses file." });
    } finally {
        fs.unlinkSync(filePath);
    }
};

// Get Detail Soal
export const getQuestionDetails = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const question = await prisma.questionBank.findUnique({
            where: { id: Number(id) },
            include: { options: true, subject: true }
        });
        if (!question) {
            return res.status(404).json({ message: "Soal tidak ditemukan." });
        }
        res.json(question);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil detail soal." });
    }
};

// Update Soal
export const updateQuestion = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { questionText, difficulty, subjectId, options } = req.body;

    try {
        await prisma.$transaction(async (tx) => {
            await tx.questionBank.update({
                where: { id: Number(id) },
                data: {
                    questionText,
                    // PERBAIKAN 3: Konversi difficulty ke huruf besar
                    difficulty: difficulty.toUpperCase(),
                    subjectId: Number(subjectId),
                },
            });

            await tx.questionOption.deleteMany({ where: { questionId: Number(id) } });

            if (options && options.length > 0) {
                await tx.questionOption.createMany({
                    data: options.map((opt: { text: string; isCorrect: boolean; }) => ({
                        text: opt.text,
                        isCorrect: opt.isCorrect,
                        questionId: Number(id),
                    })),
                });
            }
        });

        res.status(200).json({ message: "Soal berhasil diperbarui." });
    } catch (error) {
        console.error("Gagal update soal:", error);
        res.status(500).json({ message: "Gagal memperbarui soal." });
    }
};