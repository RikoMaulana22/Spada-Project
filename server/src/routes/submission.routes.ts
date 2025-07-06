// Path: src/routes/submission.routes.ts
import { Router } from 'express';
import { createSubmission, getSubmissionsForAssignment, gradeSubmission } from '../controllers/submission.controller';
import { checkRole } from '../middlewares/role.middleware';

const router = Router();

// Siswa mengumpulkan jawaban
router.post('/assignment/:id', checkRole('siswa'), createSubmission);

// Guru melihat semua submission untuk sebuah tugas
router.get('/assignment/:id', checkRole('guru'), getSubmissionsForAssignment);

// Guru memberi/mengubah nilai untuk sebuah submission
router.put('/:id/grade', checkRole('guru'), gradeSubmission);

export default router;