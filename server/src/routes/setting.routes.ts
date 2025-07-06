// Path: src/routes/setting.routes.ts
import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/setting.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';

const router = Router();

// Rute publik untuk mengambil pengaturan (dibutuhkan oleh semua pengguna)
router.get('/', getSettings);

// Rute khusus admin untuk memperbarui pengaturan
router.post('/', authenticate, checkRole('admin'), updateSettings);

export default router;