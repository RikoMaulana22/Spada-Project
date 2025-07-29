import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Interface untuk payload JWT
export interface TokenPayload {
  userId: number;
  role: 'guru' | 'siswa'| 'admin' | 'wali_kelas'; // Tambahkan 'wali_kelas' sebagai role baru
}

// Extend Request untuk menyimpan data user
export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // format "Bearer TOKEN"

  if (!token) {
    res.status(401).json({ message: 'Akses ditolak. Token tidak tersedia.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
    req.user = decoded;
    next(); // lanjutkan middleware chain
  } catch (err) {
    res.status(403).json({ message: 'Token tidak valid.' });
  }
};
