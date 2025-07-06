// Path: src/routes/topic.routes.ts
import { Router } from 'express';
import { updateTopic, deleteTopic } from '../controllers/topic.controller';
import { checkRole } from '../middlewares/role.middleware';

const router = Router();

// Endpoint untuk mengedit topik
// PUT /api/topics/:id
router.put('/:id', checkRole('guru'), updateTopic);

// Endpoint untuk menghapus topik
// DELETE /api/topics/:id
router.delete('/:id', checkRole('guru'), deleteTopic);

export default router;