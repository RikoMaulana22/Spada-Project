import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../middlewares/auth.middleware'; // Impor tipe payload

const prisma = new PrismaClient();

// Fungsi registerUser tidak perlu diubah, sudah benar
export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password, fullName, role } = req.body;
    if (!username || !password || !fullName || !role) {
      res.status(400).json({ message: 'Semua field wajib diisi' });
      return;
    }
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      res.status(409).json({ message: 'Username sudah digunakan' });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({ data: { username, password: hashedPassword, fullName, role } });
    res.status(201).json({ message: 'Registrasi berhasil!', user: { id: newUser.id, username: newUser.username, fullName: newUser.fullName, role: newUser.role } });
  } catch (error) {
    console.error('Error saat registrasi:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};


export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ message: 'Username dan password wajib diisi' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      res.status(404).json({ message: 'Username tidak ditemukan' });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Password salah' });
      return;
    }

    // --- PERBAIKAN DI SINI ---
    // Buat payload yang sesuai dengan interface TokenPayload (hanya userId dan role)
    const payload: TokenPayload = { userId: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1d' });
    // --- AKHIR PERBAIKAN ---

    res.status(200).json({
      message: 'Login berhasil!',
      token, // Token yang lebih ramping dan aman
      user: { // Data lengkap user tetap dikirim di body respons, ini sudah benar
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error saat login:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
// --- FUNGSI BARU: Login Khusus Admin ---
export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ message: 'Username dan password wajib diisi' });
            return;
        }
        
        // 1. Cari pengguna berdasarkan username
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            res.status(404).json({ message: 'Akun admin tidak ditemukan' });
            return;
        }

        // 2. Validasi Peran (Role) - INI YANG PALING PENTING
        if (user.role !== 'admin') {
            res.status(403).json({ message: 'Akses ditolak. Akun ini bukan admin.' });
            return;
        }

        // 3. Validasi Password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Password salah' });
            return;
        }

        // 4. Buat Token jika semua validasi berhasil
        const payload: TokenPayload = { userId: user.id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1d' });

        res.status(200).json({
            message: 'Login admin berhasil!',
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Error saat login admin:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};