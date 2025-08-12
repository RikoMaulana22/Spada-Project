import { Router } from 'express';
import { 
    createClass, 
    getTeacherClasses, 
    getClassById, 
    enrolInClass,
    createTopicForClass,
    getStudentClasses,
    getAllClasses,
    deleteClass
} from '../controllers/class.controller';
import { checkRole } from '../middlewares/role.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import {upload} from '../middlewares/upload.middleware'; // <-- 1. Impor middleware untuk upload file

const router = Router();

// --- PERBAIKAN: Gabungkan middleware auth, role, dan upload di satu route ---
// Rute untuk Guru
router.get('/teacher', authenticate, checkRole('guru'), getTeacherClasses);
router.post(
    '/', 
    authenticate, 
    checkRole('guru'), 
    upload.single('image'), // <-- 2. Tambahkan middleware upload di sini
    createClass
);

// Rute untuk Siswa
router.get('/student', authenticate, checkRole('siswa'), getStudentClasses);
router.post('/:id/enrol', authenticate, checkRole('siswa'), enrolInClass);

// Rute untuk Admin Form
router.get('/all', authenticate, checkRole('admin'), getAllClasses);

// Rute Umum (Detail Kelas)
router.get('/:id', authenticate, getClassById);

// Rute untuk mengelola topik
router.post('/:id/topics', authenticate, checkRole('guru'), createTopicForClass);

// Rute untuk menghapus kelas
router.delete('/:id', authenticate, checkRole('guru'), deleteClass);

// --- HAPUS: Rute ini ganda dan salah path ---
// router.post('/classes', upload.single('image'), createClass);

export default router;