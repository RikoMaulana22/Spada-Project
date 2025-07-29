import { Router } from 'express';
import { 
    createClass, 
    getTeacherClasses, 
    getClassById, 
    enrolInClass,
    createTopicForClass,
    getStudentClasses,
    getAllClasses, // <-- Impor fungsi baru
    deleteClass
} from '../controllers/class.controller';
import { checkRole } from '../middlewares/role.middleware';
import { authenticate } from '../middlewares/auth.middleware'; // <-- TAMBAHKAN IMPOR INI


const router = Router();

// Rute untuk Guru
router.get('/teacher', authenticate, checkRole('guru'), getTeacherClasses);
router.post('/', authenticate, checkRole('guru'), createClass);

// Rute untuk Siswa
router.get('/student', authenticate, checkRole('siswa'), getStudentClasses);
router.post('/:id/enrol', authenticate, checkRole('siswa'), enrolInClass);

// Rute untuk Admin Form
router.get('/all', authenticate, checkRole('admin'), getAllClasses);

// Rute Umum (Detail Kelas)
router.get('/:id', authenticate, getClassById);

// Rute untuk mengelola topik
router.post('/:id/topics', authenticate, checkRole('guru'), createTopicForClass);

router.delete('/:id', authenticate, checkRole('guru'), deleteClass);

export default router;