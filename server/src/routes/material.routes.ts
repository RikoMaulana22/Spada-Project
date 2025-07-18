// Path: server/src/routes/material.routes.ts

import { Router } from 'express';
import {
    createMaterialForTopic,
    createGlobalMaterial,
    getGlobalMaterials,
    getMaterialsForTopic,
    deleteMaterial
} from '../controllers/material.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';
import { upload } from '../middlewares/upload.middleware'; // Pastikan middleware upload sudah ada

const router = Router();

// --- Rute untuk Materi Global (umumnya oleh Admin) ---

// Admin membuat materi global baru
router.post('/global',
    authenticate,
    checkRole('admin'),
    upload.single('file'),
    createGlobalMaterial
);

// Semua user yang login bisa melihat materi global
router.get('/global',
    authenticate,
    getGlobalMaterials
);


// --- Rute untuk Materi di dalam Topik (oleh Guru) ---

// Guru membuat materi baru di dalam sebuah topik
router.post('/topics/:topicId',
    authenticate,
    checkRole('guru'),
    upload.single('file'),
    createMaterialForTopic
);

// Semua user yang login bisa melihat materi di dalam sebuah topik
router.get('/topics/:topicId',
    authenticate,
    getMaterialsForTopic
);


// --- Rute untuk Mengelola Materi Individual ---

// Guru atau Admin bisa menghapus materi
router.delete('/:materialId',
    authenticate,
    checkRole(['guru', 'admin']),
    deleteMaterial
);

export default router;