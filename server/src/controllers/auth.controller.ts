import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../middlewares/auth.middleware'; // Impor tipe payload
import { AuthRequest } from '../middlewares/auth.middleware';


const prisma = new PrismaClient();

// // Fungsi registerUser tidak perlu diubah, sudah benar
// export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//         // 1. Ambil 'email' dari request body
//         const { username, email, password, fullName, role } = req.body;

//         // 2. Tambahkan validasi untuk 'email'
//         if (!username || !email || !password || !fullName || !role) {
//             res.status(400).json({ message: 'Semua field wajib diisi' });
//             return;
//         }

//         // 3. Cek apakah username atau email sudah ada
//         const existingUser = await prisma.user.findFirst({
//             where: {
//                 OR: [
//                     { username: username },
//                     { email: email }
//                 ]
//             }
//         });
        
//         if (existingUser) {
//             // Beri pesan yang spesifik tergantung mana yang sudah ada
//             const message = existingUser.username === username ? 'Username sudah digunakan' : 'Email sudah digunakan';
//             res.status(409).json({ message });
//             return;
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         // 4. Sertakan 'email' saat membuat user baru
//         const newUser = await prisma.user.create({
//             data: {
//                 username,
//                 email, // <-- Sertakan email di sini
//                 password: hashedPassword,
//                 fullName,
//                 role
//             }
//         });
        
//         // Pilih data yang akan dikirim kembali (tanpa password)
//         const userToReturn = {
//             id: newUser.id,
//             username: newUser.username,
//             email: newUser.email,
//             fullName: newUser.fullName,
//             role: newUser.role
//         };

//         res.status(201).json({ message: 'Registrasi berhasil!', user: userToReturn });

//     } catch (error) {
//         console.error('Error saat registrasi:', error);
//         res.status(500).json({ message: 'Terjadi kesalahan pada server' });
//     }
// };


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

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ message: "Otentikasi gagal." });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            // Pilih hanya data yang aman untuk dikirim ke frontend
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
            }
        });

        if (!user) {
            res.status(404).json({ message: "Pengguna tidak ditemukan." });
            return;
        }

        res.status(200).json(user);

    } catch (error) {
        console.error("Error saat mengambil data pengguna:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};

export const loginHomeroomTeacher = async (req: Request, res: Response): Promise<void> => {
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

        // --- VALIDASI KHUSUS WALI KELAS ---
        // Cek apakah guru ini adalah wali kelas di kelas manapun
        const homeroomClass = await prisma.class.findFirst({
            where: { homeroomTeacherId: user.id }
        });

        if (!homeroomClass) {
            res.status(403).json({ message: 'Akses ditolak. Anda bukan wali kelas.' });
            return;
        }
        // --- AKHIR VALIDASI ---

        const payload = { userId: user.id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1d' });

        res.status(200).json({
            message: 'Login wali kelas berhasil!',
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Error saat login wali kelas:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};