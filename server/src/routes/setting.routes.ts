import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/setting.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';
import { upload } from '../middlewares/upload.middleware'; // Pastikan multer diimpor

const router = Router();

router.get('/', getSettings); // Rute ini tidak perlu otentikasi agar logo bisa tampil di halaman login

// PERBAIKAN: Gunakan upload.fields untuk menerima beberapa file
router.post(
    '/', 
    authenticate, 
    checkRole('admin'), 
    upload.fields([
        { name: 'headerLogo', maxCount: 1 },
        { name: 'loginLogo', maxCount: 1 },
        { name: 'homeHeroImage', maxCount: 1 }
    ]), 
    updateSettings
);

export default router;