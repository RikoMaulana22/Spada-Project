import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mainRouter from './routes';
import path from 'path'; // <-- 1. PASTIKAN 'path' SUDAH DIIMPOR


dotenv.config();

const app: Express = express();
const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';


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

// app.listen(PORT, () => {
//   console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
// });

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server berjalan dan siap diakses dari jaringan.`);
  console.log(`   Lokal:     http://localhost:${PORT}`);
  console.log(`   Jaringan:  http://192.168.1.14:${PORT}`);
});