import { Router } from 'express';
import { 
    createSubmission, 
    getSubmissionsForAssignment, 
    gradeSubmission, 
    getMyGrades,
    getSubmissionReview,
    submitAssignment
    
} from '../controllers/submission.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';

const router = Router();
// Siswa mengumpulkan jawaban
router.post('/assignment/:id', authenticate, checkRole('siswa'), createSubmission);

// Guru melihat semua submission untuk sebuah tugas
router.get('/assignment/:id', authenticate, checkRole('guru'), getSubmissionsForAssignment);

// Guru memberi/mengubah nilai untuk sebuah submission
router.put('/:id/grade', authenticate, checkRole('guru'), gradeSubmission);

// Rute untuk siswa melihat semua nilainya
router.get('/my-grades', authenticate, checkRole('siswa'), getMyGrades);

// --- PERBAIKAN DI SINI ---
// Ubah urutan path dari '/:id/review' menjadi '/review/:id'
router.get('/review/:id', authenticate, checkRole('siswa'), getSubmissionReview);
router.post('/submissions/assignment/:assignmentId', authenticate, checkRole('siswa'), submitAssignment);


export default router;