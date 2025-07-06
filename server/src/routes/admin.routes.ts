import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser, getAttendanceReport,getGradeReport,getGlobalMaterialsAdmin,uploadGlobalMaterial,deleteGlobalMaterial   } from '../controllers/admin.controller';
import upload from '../config/multer.config'; // Impor multer config

const router = Router();

// Semua rute di file ini akan memiliki prefix /api/admin

// GET /api/admin/users -> Mendapatkan semua pengguna
// GET /api/admin/users?role=siswa -> Mendapatkan semua siswa
router.get('/users', getUsers);

// POST /api/admin/users -> Membuat pengguna baru
router.post('/users', createUser);

// --- RUTE BARU ---
// PUT /api/admin/users/:id -> Mengupdate pengguna
router.put('/users/:id', updateUser);

// DELETE /api/admin/users/:id -> Menghapus pengguna
router.delete('/users/:id', deleteUser);

// --- RUTE BARU UNTUK LAPORAN ---
router.get('/reports/attendance', getAttendanceReport);
// --- RUTE BARU UNTUK LAPORAN NILAI ---
router.get('/reports/grades', getGradeReport);
// --- RUTE BARU UNTUK MANAJEMEN MATERI GLOBAL ---
router.get('/materials/global', getGlobalMaterialsAdmin);
router.post('/materials/global', upload.single('file'), uploadGlobalMaterial);
router.delete('/materials/global/:id', deleteGlobalMaterial);


export default router;