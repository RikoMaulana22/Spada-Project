import { Router } from 'express';
import { createAttendance, markAttendanceRecord, getAttendanceDetails  } from '../controllers/attendance.controller';
import {  checkRole } from '../middlewares/role.middleware';
import { authenticate } from '../middlewares/auth.middleware'; // <-- TAMBAHKAN IMPOR
import { upload } from '../middlewares/upload.middleware'; // Impor middleware upload


const router = Router();

router.post('/topic/:topicId', authenticate, checkRole('guru'), createAttendance);
router.get('/:id', authenticate, getAttendanceDetails);
router.post('/:id/record', authenticate, checkRole('siswa'), upload.single('proof'), markAttendanceRecord);




export default router;