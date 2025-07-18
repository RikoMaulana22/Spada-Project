import { Router } from 'express';
import { 
    createSchedule, 
    getAllSchedules, 
    getMySchedule, 
    deleteSchedule, 
    updateSchedule 
} from '../controllers/schedule.controller';
import { checkRole } from '../middlewares/role.middleware';

const router = Router();

// Rute untuk Admin
router.get('/', checkRole('admin'), getAllSchedules);
router.post('/', checkRole('admin'), createSchedule);
router.put('/:id', checkRole('admin'), updateSchedule);
router.delete('/:id', checkRole('admin'), deleteSchedule);

// Rute untuk Siswa & Guru
router.get('/my', getMySchedule);

export default router;