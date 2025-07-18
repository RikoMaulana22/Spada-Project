import { Router } from 'express';
import { registerUser, loginUser, loginAdmin,  getMe  } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
// --- RUTE BARU: Login khusus admin ---
router.post('/admin/login', loginAdmin);
router.get('/me', authenticate, getMe);

export default router;
