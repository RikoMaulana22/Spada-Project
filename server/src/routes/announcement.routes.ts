// Path: src/routes/announcement.routes.ts
import { Router } from 'express';
import { getLatestAnnouncements, getAllAnnouncements, createAnnouncement, deleteAnnouncement } from '../controllers/announcement.controller';
import { checkRole } from '../middlewares/role.middleware';

const router = Router();

// Rute untuk pengguna umum (siswa/guru)
router.get('/', getLatestAnnouncements);

// Rute khusus admin
router.get('/all', checkRole('admin'), getAllAnnouncements);
router.post('/', checkRole('admin'), createAnnouncement);
router.delete('/:id', checkRole('admin'), deleteAnnouncement);

export default router;