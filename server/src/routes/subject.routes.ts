// Path: src/routes/subject.routes.ts
import { Router } from 'express';
import { getAllSubjects, getGroupedSubjects,  createSubject, updateSubject, deleteSubject } from '../controllers/subject.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';


const router = Router();

// Tambahkan 'authenticate' untuk memastikan hanya user yang login yang bisa melihat
router.get('/', authenticate, getAllSubjects);
router.get('/grouped', authenticate, getGroupedSubjects);

// Rute khusus admin (sudah benar)
router.post('/', authenticate, checkRole('admin'), createSubject);
router.put('/:id', authenticate, checkRole('admin'), updateSubject);
router.delete('/:id', authenticate, checkRole('admin'), deleteSubject);



export default router;