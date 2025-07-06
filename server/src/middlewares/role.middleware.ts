import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const checkRole = (requiredRole: 'guru' | 'siswa' | 'admin') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;

    if (!userRole || userRole !== requiredRole) {
      res.status(403).json({ message: 'Akses ditolak. Peran tidak sesuai.' });
      return;
    }

    next();
  };
};
