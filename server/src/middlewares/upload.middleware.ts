// Path: server/src/middlewares/upload.middleware.ts

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Tentukan direktori penyimpanan
const storageDir = 'public/uploads/materials';

// Pastikan direktori ada, jika tidak, buat direktorinya
if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
}

// Konfigurasi penyimpanan disk untuk Multer
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        cb(null, storageDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        // Buat nama file yang unik untuk menghindari konflik
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter file untuk membatasi tipe file yang diizinkan (opsional tapi direkomendasikan)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Daftar tipe file yang diizinkan
    const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.ms-powerpoint', // .ppt
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' // .pptx
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true); // Terima file
    } else {
        cb(new Error('Tipe file tidak diizinkan!')); // Tolak file
    }
};

// Inisialisasi dan ekspor instance Multer
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // Batas ukuran file 10MB
    }
});