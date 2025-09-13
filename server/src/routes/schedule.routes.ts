import { Router } from 'express';
import { 
    createSchedule, 
    getAllSchedules, 
    getMySchedule, 
    deleteSchedule, 
    updateSchedule,
    getPublicSchedules, 
} from '../controllers/schedule.controller';
import { authenticate } from '../middlewares/auth.middleware'; 
import { checkRole } from '../middlewares/role.middleware';

const router = Router();

// --- PERBAIKI RUTE ADMIN DENGAN MENAMBAHKAN 'authenticate' ---
router.get('/', authenticate, checkRole('admin'), getAllSchedules);
router.post('/', authenticate, checkRole('admin'), createSchedule);
router.put('/:id', authenticate, checkRole('admin'), updateSchedule);
router.delete('/:id', authenticate, checkRole('admin'), deleteSchedule);

// --- Rute untuk Siswa & Guru (Perlu 'authenticate') ---
router.get('/my', authenticate, getMySchedule);

// --- Rute Publik (Sudah Benar, tidak perlu 'authenticate') ---
router.get('/public', getPublicSchedules);

export default router;