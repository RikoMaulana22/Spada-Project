// Path: server/src/routes/questionBank.routes.ts
import { Router } from 'express';
import { getQuestionsFromBank, addQuestionToBank } from '../controllers/questionBank.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';

const router = Router();

// Rute untuk guru mengakses dan menambah soal di gudang soal
router.get('/', authenticate, checkRole('guru'), getQuestionsFromBank);
router.post('/', authenticate, checkRole('guru'), addQuestionToBank);

export default router;