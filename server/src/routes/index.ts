// Path: server/src/routes/index.ts

import { Router } from 'express';
import authRoutes from './auth.routes';
import classRoutes from './class.routes';
import subjectRoutes from './subject.routes';
import assignmentRoutes from './assignment.routes';
import adminRoutes from './admin.routes';
import materialRoutes from './material.routes'; // <-- 1. TAMBAHKAN IMPOR INI
import { authenticate } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';
import topicRoutes from './topic.routes';
import attendanceRoutes from './attendance.routes';
import submissionRoutes from './submission.routes';
import scheduleRoutes from './schedule.routes';
import announcementRoutes from './announcement.routes';
import settingRoutes from './setting.routes';
import homeroomRoutes from './homeroom.routes';
import questionBankRoutes from './questionBank.routes'; 
import userRoutes from './user.routes';







const mainRouter = Router();

mainRouter.use('/users', authenticate, userRoutes);
// Rute publik
mainRouter.use('/auth', authRoutes);

// Rute yang dilindungi autentikasi umum
mainRouter.use('/classes', authenticate, classRoutes);
mainRouter.use('/subjects', authenticate, subjectRoutes);
mainRouter.use('/assignments', authenticate, assignmentRoutes);

mainRouter.use('/materials', authenticate, materialRoutes); // <-- 2. TAMBAHKAN PENGGUNAAN RUTE INI

// --- RUTE BARU KHUSUS ADMIN ---
mainRouter.use('/admin', authenticate, checkRole('admin'), adminRoutes);
mainRouter.use('/topics', authenticate, topicRoutes); // <-- BARIS BARU
mainRouter.use('/attendance', authenticate, attendanceRoutes); // <-- BARIS BARU
mainRouter.use('/submissions', authenticate, submissionRoutes); // <-- BARIS BARU
mainRouter.use('/schedules', authenticate, scheduleRoutes); // <-- BARIS BARU
mainRouter.use('/announcements', authenticate, announcementRoutes);
mainRouter.use('/settings', settingRoutes);
mainRouter.use('/question-banks', authenticate, questionBankRoutes);
// Rute publik
mainRouter.use('/auth', authRoutes);
// Rute Wali Kelas
mainRouter.use('/homeroom', homeroomRoutes);








export default mainRouter;