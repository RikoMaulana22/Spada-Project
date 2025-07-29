import {Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
type Role = 'guru' | 'siswa' | 'admin' | 'wali_kelas';

export const checkRole = (roles: Role | Role[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const userRole = req.user?.role;

        if (!userRole) {
            return res.status(401).json({ message: 'Otentikasi diperlukan, peran tidak ditemukan.' });
        }

        // Ubah input 'roles' menjadi array agar mudah diperiksa
        const requiredRoles = Array.isArray(roles) ? roles : [roles];

        // Cek apakah peran pengguna ada di dalam array peran yang diizinkan
        if (requiredRoles.includes(userRole as Role)) {
            next(); // Peran cocok, lanjutkan
        } else {
            res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki peran yang sesuai.' });
        }
    };
};
