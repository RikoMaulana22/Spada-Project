// Path: src/routes/topic.routes.ts
import { Router } from 'express';
import { updateTopic, deleteTopic } from '../controllers/topic.controller';
import { checkRole } from '../middlewares/role.middleware';
import { authenticate } from '../middlewares/auth.middleware'; // <-- 1. Impor authenticate


const router = Router();

// 2. Tambahkan 'authenticate' sebelum 'checkRole'
router.put('/:id', authenticate, checkRole('guru'), updateTopic);
router.delete('/:id', authenticate, checkRole('guru'), deleteTopic);
export default router;