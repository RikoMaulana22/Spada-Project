import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mainRouter from './routes';
import path from 'path'; // <-- 1. PASTIKAN 'path' SUDAH DIIMPOR


dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(express.static('public'));
// ✅ Tambahkan route root untuk menghindari error 404 saat akses /
app.get('/', (_, res) => {
  res.send('Server aktif! Gunakan prefix /api untuk akses endpoint.');
});

app.use(express.static('public'));

// Prefix API
app.use('/api', mainRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
