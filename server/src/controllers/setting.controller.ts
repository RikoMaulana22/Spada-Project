import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const upsertSetting = async (key: string, value: string) => {
    return prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
    });
};

export const getSettings = async (req: Request, res: Response) => {
    try {
        const settings = await prisma.setting.findMany();
        const settingsObject = settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {} as { [key: string]: string });
        res.status(200).json(settingsObject);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil pengaturan." });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    // Ambil semua field teks dari req.body
    const textFields = ['schoolName', 'homeHeroTitle', 'homeHeroSubtitle', 'schoolProfile', 'footerText'];
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    try {
        // 1. Proses semua pengaturan teks
        for (const field of textFields) {
            if (req.body[field] !== undefined) {
                await upsertSetting(field, req.body[field]);
            }
        }

        // 2. Proses semua file yang diunggah
        const fileFields = ['headerLogo', 'loginLogo', 'homeHeroImage'];
        for (const field of fileFields) {
            if (files && files[field] && files[field][0]) {
                const newFile = files[field][0];
                const newFilePath = `/uploads/settings/${newFile.filename}`;

                const oldSetting = await prisma.setting.findUnique({ where: { key: field } });
                if (oldSetting && oldSetting.value) {
                    const oldFilePath = path.join(__dirname, `../../public`, oldSetting.value);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                }
                
                await upsertSetting(field, newFilePath);
            }
        }

        res.status(200).json({ message: 'Pengaturan berhasil disimpan.' });
    } catch (error) {
        console.error("Gagal menyimpan pengaturan:", error);
        res.status(500).json({ message: 'Gagal menyimpan pengaturan.' });
    }
};