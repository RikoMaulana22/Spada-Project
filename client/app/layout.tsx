import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from 'react-hot-toast'; // <-- 1. IMPORT KEMBALI Toaster

// Impor komponen Header dan Footer
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SPADA - Sistem Pembelajaran Daring",
  description: "SMP NEGERI SATU ATAP 1 WAY TENONG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col  h-full bg-white`}>
        <AuthProvider>
          {/* --- 2. TAMBAHKAN Toaster DI SINI --- */}
          {/* Posisi terbaik adalah di dalam provider tapi di luar layout utama */}
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3000,
            }}
          />

          <Header />
          
          <main className="flex-grow container mx-auto px-6 py-8 bg-white shadow-md my-4 rounded-lg">
            {children}
          </main>
          
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}