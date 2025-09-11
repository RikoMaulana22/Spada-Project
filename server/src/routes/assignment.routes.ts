// Path: server/src/routes/assignment.routes.ts
import { Router } from 'express';
// PERUBAHAN: Impor fungsi controller yang baru
import { createAssignmentForTopic, getAssignmentsForTopic, getAssignmentById, 
        getMyAssignments, updateAssignment,getAssignmentSubmissions,gradeSubmission,
         } from '../controllers/assignment.controller';
import { checkRole } from '../middlewares/role.middleware';
import { authenticate} from '../middlewares/auth.middleware';


const router = Router();

router.get('/my', authenticate, getMyAssignments);
router.get('/topic/:topicId', authenticate, getAssignmentsForTopic);
router.post('/topic/:topicId', authenticate, checkRole('guru'), createAssignmentForTopic);
router.put('/:id', authenticate, checkRole('guru'), updateAssignment);
router.get('/:id/submissions', authenticate, checkRole('guru'), getAssignmentSubmissions);
router.put('/submissions/:submissionId/grade', authenticate, checkRole('guru'), gradeSubmission);
router.get('/:id', authenticate, getAssignmentById);



export default router;