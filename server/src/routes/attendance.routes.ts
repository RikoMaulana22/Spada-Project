import { Router } from 'express';
import { createAttendance, markAttendanceRecord } from '../controllers/attendance.controller';
import { checkRole } from '../middlewares/role.middleware';

const router = Router();

// Endpoint untuk membuat sesi absensi
// POST /api/attendance/topic/:topicId
router.post('/topic/:topicId', checkRole('guru'), createAttendance);
router.post('/:id/record', checkRole('siswa'), markAttendanceRecord);


export default router;