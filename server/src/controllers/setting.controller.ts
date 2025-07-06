// Path: src/controllers/setting.controller.ts
import { Request, Response,  } from 'express'; // <-- PERBAIKAN: Pastikan 'Request' diimpor
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// Mengambil semua pengaturan untuk ditampilkan di aplikasi
export const getSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const settingsArray = await prisma.setting.findMany();
        // Ubah dari array ke objek agar mudah digunakan di frontend
        const settingsObject = settingsArray.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {} as Record<string, string>);

        res.status(200).json(settingsObject);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil pengaturan.' });
    }
};

// Admin memperbarui pengaturan
export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
    const settingsToUpdate: Record<string, string> = req.body;

    try {
        const updatePromises = Object.keys(settingsToUpdate).map(key => {
            return prisma.setting.upsert({
                where: { key },
                update: { value: settingsToUpdate[key] },
                create: { key, value: settingsToUpdate[key] },
            });
        });

        await Promise.all(updatePromises);
        res.status(200).json({ message: 'Pengaturan berhasil diperbarui.' });

    } catch (error) {
        console.error("Gagal memperbarui pengaturan:", error);
        res.status(500).json({ message: 'Gagal memperbarui pengaturan.' });
    }
};