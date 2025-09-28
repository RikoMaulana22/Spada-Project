import { Router } from 'express';
import { getUsers,
     createUser, 
     updateUser, 
     deleteUser,
     getGlobalMaterialsAdmin,
     uploadGlobalMaterial,
     deleteGlobalMaterial,
     getAttendanceReport,
    getGradeReport,
    assignHomeroomTeacher,
    getAllClasses,
    getAvailableClassesForHomeroom ,
    getAllTeachers,
    getAllSubjects,
    createClass,
    getClassEnrollments,
    enrollStudent,
    unenrollStudent,
    bulkCreateUsers,
    deleteClass,
    testGetAllWaliKelas

    
  } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware'; 
import { checkRole } from '../middlewares/role.middleware';   
import { upload } from '../middlewares/upload.middleware'; 


const router = Router();

router.get('/test/walikelas', testGetAllWaliKelas); 

router.get('/users', authenticate, checkRole('admin'), getUsers);

router.delete('/classes/:id', authenticate, checkRole('admin'), deleteClass);


router.post('/users', authenticate, checkRole('admin'), createUser);

// --- PERBAIKI RUTE UPDATE DAN DELETE DI SINI ---
router.put('/users/:id', authenticate, checkRole('admin'), updateUser);
router.delete('/users/:id', authenticate, checkRole('admin'), deleteUser);

// --- RUTE BARU: Untuk Manajemen Materi Global ---
router.get('/materials/global', authenticate, checkRole('admin'), getGlobalMaterialsAdmin);
router.post('/materials/global', authenticate, checkRole('admin'), upload.single('file'), uploadGlobalMaterial);
router.delete('/materials/global/:id', authenticate, checkRole('admin'), deleteGlobalMaterial);
// --- Rute untuk Laporan ---
router.get('/reports/attendance', authenticate, checkRole('admin'), getAttendanceReport);
router.get('/reports/grades', authenticate, checkRole('admin'), getGradeReport);
// --- RUTE BARU UNTUK KELOLA KELAS 
// --- RUTE UNTUK MANAJEMEN KELAS ---
router.get('/classes', authenticate, checkRole('admin'), getAllClasses);
router.get('/teachers', authenticate, checkRole('admin'), getAllTeachers);
router.get('/subjects', authenticate, checkRole('admin'), getAllSubjects);
router.post('/classes', authenticate, checkRole('admin'), createClass);
router.get('/classes', authenticate, checkRole('admin'), getAllClasses);
router.put('/classes/:classId/assign-homeroom', authenticate, checkRole('admin'), assignHomeroomTeacher);;
router.get(
    '/classes/available-for-homeroom', 
    authenticate, 
    checkRole('admin'), 
    getAvailableClassesForHomeroom
);

// Rute untuk manajemen pendaftaran siswa (enrollment)
router.get('/classes/:classId/enrollments', authenticate, checkRole('admin'), getClassEnrollments);
router.post('/classes/:classId/enrollments', authenticate, checkRole('admin'), enrollStudent);
router.delete('/classes/:classId/enrollments/:studentId', authenticate, checkRole('admin'), unenrollStudent);

router.post('/users/bulk', authenticate, checkRole('admin'), upload.single('file'), bulkCreateUsers);

router.put('/classes/:classId/homeroom', assignHomeroomTeacher);




export default router;