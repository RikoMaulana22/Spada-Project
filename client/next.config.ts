// BENAR (untuk Next.js 15+)
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pindahkan 'allowedDevOrigins' ke level atas, di luar 'experimental'
  allowedDevOrigins: [
    'http://192.168.56.1:3000', // Ganti 3000 dengan port Anda jika berbeda
  ],
};

export default nextConfig;