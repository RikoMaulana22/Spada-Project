import { Router } from 'express';
import { createAttendance, markAttendanceRecord, getAttendanceDetails  } from '../controllers/attendance.controller';
import { checkRole } from '../middlewares/role.middleware';

const router = Router();

// Endpoint untuk membuat sesi absensi
// POST /api/attendance/topic/:topicId
router.post('/topic/:topicId', checkRole('guru'), createAttendance);
router.post('/:id/record', checkRole('siswa'), markAttendanceRecord);
router.get('/:id', getAttendanceDetails); // <-- Pastikan baris ini ada



export default router;