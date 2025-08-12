"use client";

import { useState, useEffect } from 'react';

interface QuizTimerProps {
  initialMinutes: number;
  onTimeUp: () => void; // Fungsi yang akan dipanggil saat waktu habis
}

export default function QuizTimer({ initialMinutes, onTimeUp }: QuizTimerProps) {
  // Ubah menit awal menjadi detik
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    // Jangan mulai timer jika waktu 0 atau kurang
    if (secondsLeft <= 0) {
      onTimeUp(); // Panggil onTimeUp jika waktu sudah habis dari awal
      return;
    }

    // Atur interval yang akan berjalan setiap detik
    const intervalId = setInterval(() => {
      setSecondsLeft(prevSeconds => prevSeconds - 1);
    }, 1000);

    // Bersihkan interval saat komponen di-unmount atau waktu habis
    return () => clearInterval(intervalId);
  }, [secondsLeft, onTimeUp]);

  // Format waktu dari detik menjadi MM:SS
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  // Tentukan warna teks berdasarkan sisa waktu
  const timerColor = secondsLeft < 60 ? 'text-red-500' : 'text-gray-700';

  return (
    <div className={`fixed top-4 right-4 bg-white p-3 rounded-lg shadow-lg border-2 ${timerColor}`}>
      <p className="text-sm font-medium">Sisa Waktu:</p>
      <p className={`text-2xl font-bold text-center ${timerColor}`}>
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </p>
    </div>
  );
}