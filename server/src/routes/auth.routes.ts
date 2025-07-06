import { Router } from 'express';
import { registerUser, loginUser, loginAdmin  } from '../controllers/auth.controller';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
// --- RUTE BARU: Login khusus admin ---
router.post('/admin/login', loginAdmin);
export default router;
