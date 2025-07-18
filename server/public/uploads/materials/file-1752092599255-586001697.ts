import { Router } from 'express';
// --- Impor fungsi baru dari controller ---
import { getUsers,
     createUser, 
     updateUser, 
     deleteUser,
     getGlobalMaterialsAdmin,
     uploadGlobalMaterial,
     deleteGlobalMaterial,
     getAttendanceReport,
    getGradeReport } from '../controllers/admin.controller';
import upload from '../config/multer.config'; // Impor konfigurasi multer


const router = Router();

// Semua rute di file ini akan memiliki prefix /api/admin

// GET /api/admin/users
router.get('/users', getUsers);

// POST /api/admin/users
router.post('/users', createUser);

// --- TAMBAHKAN RUTE UPDATE DAN DELETE DI SINI ---

// PUT /api/admin/users/:id -> Mengupdate pengguna
router.put('/users/:id', updateUser);

// DELETE /api/admin/users/:id -> Menghapus pengguna
router.delete('/users/:id', deleteUser);
// --- RUTE BARU: Untuk Manajemen Materi Global ---
router.get('/materials/global', getGlobalMaterialsAdmin);
router.post('/materials/global', upload.single('file'), uploadGlobalMaterial);
router.delete('/materials/global/:id', deleteGlobalMaterial);
// --- Rute untuk Laporan ---
router.get('/reports/attendance', getAttendanceReport);
router.get('/reports/grades', getGradeReport);




export default router;