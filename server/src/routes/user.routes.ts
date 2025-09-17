// Path: server/src/routes/user.routes.ts

import { Router } from 'express';
import { updateProfile, changePassword, getTeacherGradebook } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';

const router = Router();

router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

// Rute baru untuk guru melihat rekap nilai
router.get('/gradebook', authenticate, checkRole('guru'), getTeacherGradebook);

export default router;