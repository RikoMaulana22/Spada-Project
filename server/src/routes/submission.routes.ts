import { Router } from 'express';
// 1. Impor 'getMyGrades' dari controller dan 'authenticate' dari middleware
import { 
    createSubmission, 
    getSubmissionsForAssignment, 
    gradeSubmission, 
    getMyGrades 
} from '../controllers/submission.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';

const router = Router();

// --- RUTE YANG SUDAH ADA DITAMBAHKAN 'authenticate' ---
// Siswa mengumpulkan jawaban
router.post('/assignment/:id', authenticate, checkRole('siswa'), createSubmission);

// Guru melihat semua submission untuk sebuah tugas
router.get('/assignment/:id', authenticate, checkRole('guru'), getSubmissionsForAssignment);

// Guru memberi/mengubah nilai untuk sebuah submission
router.put('/:id/grade', authenticate, checkRole('guru'), gradeSubmission);
// --- BATAS PERBAIKAN ---


// --- 2. TAMBAHKAN RUTE BARU YANG HILANG DI SINI ---
// Rute untuk siswa melihat semua nilainya
router.get('/my-grades', authenticate, checkRole('siswa'), getMyGrades);


export default router;