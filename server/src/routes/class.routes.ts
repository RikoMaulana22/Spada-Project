// Path: server/src/routes/class.routes.ts
import { Router } from 'express';
import { 
    createClass, 
    getTeacherClasses, 
    getClassById, 
    enrolInClass,
    createTopicForClass,
    getStudentClasses 
} from '../controllers/class.controller';
import { checkRole } from '../middlewares/role.middleware';
import upload from '../config/multer.config';

const router = Router();

// Rute untuk Guru
router.get('/teacher', checkRole('guru'), getTeacherClasses);
router.post('/', checkRole('guru'), createClass);

// --- RUTE BARU UNTUK SISWA ---
// GET /api/classes/student -> Mendapatkan kelas yang diikuti siswa
router.get('/student', checkRole('siswa'), getStudentClasses);


// Rute untuk Siswa
router.post('/:id/enrol', checkRole('siswa'), enrolInClass);

// Rute Umum (Detail Kelas) - HARUS SETELAH RUTE SPESIFIK SEPERTI /student
router.get('/:id', getClassById);


// --- RUTE BARU UNTUK MENGELOLA TOPIK DALAM KELAS ---
router.post('/:id/topics', checkRole('guru'), createTopicForClass);


export default router;