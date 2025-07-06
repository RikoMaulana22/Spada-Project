// Path: server/src/config/multer.config.ts

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Tentukan direktori tujuan
const uploadDir = 'public/uploads/materials/';

// Buat direktori jika belum ada saat aplikasi pertama kali berjalan
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi penyimpanan
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Simpan file di folder public/uploads/materials
  },
  filename: function (req, file, cb) {
    // Buat nama file yang unik untuk menghindari tumpang tindih
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
export default upload;