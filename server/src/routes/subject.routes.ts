// Path: src/routes/subject.routes.ts
import { Router } from 'express';
import { getAllSubjects, getGroupedSubjects,  createSubject, updateSubject, deleteSubject } from '../controllers/subject.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';


const router = Router();

// Rute ini bisa diakses oleh semua pengguna yang sudah login (guru/siswa)
router.get('/', getAllSubjects);
router.get('/grouped', authenticate, getGroupedSubjects);

// --- RUTE BARU KHUSUS ADMIN ---
router.post('/', authenticate, checkRole('admin'), createSubject);
router.put('/:id', authenticate, checkRole('admin'), updateSubject);
router.delete('/:id', authenticate, checkRole('admin'), deleteSubject);



export default router;