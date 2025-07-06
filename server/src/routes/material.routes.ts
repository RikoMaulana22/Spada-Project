// Path: server/src/routes/material.routes.ts

import { Router } from 'express';
import { uploadMaterial, getGlobalMaterials  } from '../controllers/material.controller';
import { checkRole } from '../middlewares/role.middleware';
import upload from '../config/multer.config';

const router = Router();

// Definisikan rute untuk upload materi ke sebuah topik
// Method: POST
// URL: /api/materials/topic/:topicId/materials
router.post(
  '/topic/:topicId/materials',
  checkRole('guru'),           // Middleware: Pastikan hanya guru yang bisa upload
  upload.single('file'),      // Middleware: Multer akan menangani satu file dari field bernama 'file'
  uploadMaterial              // Controller: Fungsi yang akan dieksekusi setelah middleware
);
router.get('/global', getGlobalMaterials);


export default router;