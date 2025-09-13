// Di file: server/src/routes/questionBank.routes.ts

import { Router } from 'express';
import { 
    getBankedQuestions,
    importFromWord,
    getQuestionDetails,
    updateQuestion
} from '../controllers/questionBank.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// Semua rute di sini memerlukan otentikasi
router.use(authenticate);

// Rute untuk mendapatkan semua soal dari bank
router.get('/', checkRole(['guru', 'admin', 'wali_kelas']), getBankedQuestions);

// Rute untuk impor soal dari Word
router.post(
    '/import-word', 
    checkRole(['guru', 'admin']), 
    upload.single('file'), 
    importFromWord
);

// Rute untuk detail dan update soal
router.get('/:id', checkRole(['guru', 'admin', 'wali_kelas']), getQuestionDetails);
router.put('/:id', checkRole(['guru', 'admin']), updateQuestion);


export default router;