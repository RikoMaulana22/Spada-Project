'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function Footer() {
  const { settings } = useAuth();

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-6 py-4 text-center">
        <p>© {new Date().getFullYear()} SPADA - Sistem Pembelajaran Daring.</p>
        <p>{settings?.footerText || 'SMPN Satap 1 Wate. All Rights Reserved.'}</p>
      </div>
    </footer>
  );
}