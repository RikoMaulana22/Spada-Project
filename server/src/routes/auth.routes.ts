import { Router } from 'express';
import {  loginUser, loginAdmin,  getMe, loginHomeroomTeacher   } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// router.post('/register', registerUser);
router.post('/login', loginUser);
// --- RUTE BARU: Login khusus admin ---
router.post('/admin/login', loginAdmin);
router.get('/me', authenticate, getMe);
router.post('/login/homeroom', loginHomeroomTeacher);


export default router;
