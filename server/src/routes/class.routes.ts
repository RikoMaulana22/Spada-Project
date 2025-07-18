import { Router } from 'express';
import { 
    createClass, 
    getTeacherClasses, 
    getClassById, 
    enrolInClass,
    createTopicForClass,
    getStudentClasses,
    getAllClasses // <-- Impor fungsi baru
} from '../controllers/class.controller';
import { checkRole } from '../middlewares/role.middleware';

const router = Router();

// Rute untuk Guru
router.get('/teacher', checkRole('guru'), getTeacherClasses);
router.post('/', checkRole('guru'), createClass);

// Rute untuk Siswa
router.get('/student', checkRole('siswa'), getStudentClasses);
router.post('/:id/enrol', checkRole('siswa'), enrolInClass);

// --- RUTE BARU UNTUK MENGAMBIL SEMUA KELAS (UNTUK ADMIN FORM) ---
router.get('/all', getAllClasses);

// Rute Umum (Detail Kelas)
router.get('/:id', getClassById);

// Rute untuk mengelola topik
router.post('/:id/topics', checkRole('guru'), createTopicForClass);

export default router;