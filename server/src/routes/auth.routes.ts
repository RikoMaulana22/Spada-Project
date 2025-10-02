import { Router } from 'express';
import {  loginUser, loginAdmin,  getMe,    } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', loginUser);
router.post('/admin/login', loginAdmin);
router.get('/me', authenticate, getMe);


export default router;
