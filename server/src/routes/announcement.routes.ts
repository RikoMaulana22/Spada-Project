// Path: src/routes/announcement.routes.ts
import { Router } from 'express';
import { getLatestAnnouncements, getAllAnnouncements, createAnnouncement, deleteAnnouncement } from '../controllers/announcement.controller';
import { checkRole } from '../middlewares/role.middleware';
import { authenticate } from '../middlewares/auth.middleware'; // <-- TAMBAHKAN IMPOR


const router = Router();

// Rute untuk pengguna umum (siswa/guru) - Perlu login
router.get('/', authenticate, getLatestAnnouncements);

// Rute khusus admin - Perlu login
router.get('/all', authenticate, checkRole('admin'), getAllAnnouncements);
router.post('/', authenticate, checkRole('admin'), createAnnouncement);
router.delete('/:id', authenticate, checkRole('admin'), deleteAnnouncement);

export default router;