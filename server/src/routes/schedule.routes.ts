// Path: src/routes/schedule.routes.ts
import { Router } from 'express';
import { createSchedule, getSchedulesByClass, deleteSchedule } from '../controllers/schedule.controller';
import { checkRole } from '../middlewares/role.middleware';

const router = Router();

// Rute untuk admin
router.post('/', checkRole('admin'), createSchedule);
router.delete('/:id', checkRole('admin'), deleteSchedule);

// Rute untuk semua pengguna terautentikasi (admin, guru, siswa)
router.get('/class/:classId', getSchedulesByClass);

export default router;