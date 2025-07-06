// Path: server/src/routes/assignment.routes.ts
import { Router } from 'express';
// PERUBAHAN: Impor fungsi controller yang baru
import { createAssignmentForTopic, getAssignmentsForTopic, getAssignmentById } from '../controllers/assignment.controller';
import { checkRole } from '../middlewares/role.middleware';

const router = Router();

// Rute ini mungkin lebih baik jika digabungkan dalam topic.routes.ts,
// tapi jika dipisah, strukturnya seperti ini.
// URL akan menjadi /api/assignments/topic/:topicId

// GET /api/assignments/topic/:topicId -> Mendapatkan semua tugas untuk topik tertentu
router.get('/topic/:topicId', getAssignmentsForTopic);

// POST /api/assignments/topic/:topicId -> Guru membuat tugas baru di topik tertentu
router.post('/topic/:topicId', checkRole('guru'), createAssignmentForTopic);

router.get('/:id', getAssignmentById);


export default router;