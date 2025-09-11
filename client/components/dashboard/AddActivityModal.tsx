// Path: client/components/dashboard/AddActivityModal.tsx
'use client';

import Modal from '@/components/ui/Modal';
import { FaFileUpload, FaClipboardList, FaClock, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMaterial: () => void;
  onSelectQuestionBank: () => void;
  onSelectAttendance: () => void;
}

export default function AddActivityModal({
  isOpen,
  onClose,
  onSelectMaterial,
  onSelectQuestionBank,
  onSelectAttendance,
}: AddActivityModalProps) {
  // Komponen Modal menjadi elemen root dan strukturnya diperbaiki
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      isFullScreen={true}>
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8 text-gray-800">
       
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900">Tambahkan Aktivitas Baru</h2>
          <p className="mt-3 text-lg text-gray-600">Pilih salah satu tipe konten yang ingin Anda buat.</p>
        </div>

        {/* Grid untuk pilihan aktivitas dengan desain yang disempurnakan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {/* Tombol Tambah Materi */}
          <button
            onClick={onSelectMaterial}
            className="p-8 bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center text-center shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 transform"
          >
            <FaFileUpload className="text-5xl text-blue-500 mb-4" />
            <span className="text-xl font-semibold">Materi File</span>
            <p className="text-sm text-gray-500 mt-2">Unggah dokumen, presentasi, atau video untuk siswa.</p>
          </button>

          {/* Tombol Tambah Tugas */}
          <button
            onClick={onSelectQuestionBank}
            className="p-8 bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center text-center shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 transform"
          >
            <FaClipboardList className="text-5xl text-green-500 mb-4" />
            <span className="text-xl font-semibold">Tugas / Kuis</span>
            <p className="text-sm text-gray-500 mt-2">Buat penilaian dari gudang soal atau buat soal baru.</p>
          </button>

          {/* Tombol Tambah Absensi */}
          <button
            onClick={onSelectAttendance}
            className="p-8 bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center text-center shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 transform"
          >
            <FaClock className="text-5xl text-red-500 mb-4" />
            <span className="text-xl font-semibold">Absensi</span>
            <p className="text-sm text-gray-500 mt-2">Buat sesi absensi untuk memantau kehadiran siswa.</p>
          </button>
        </div>

      </div>
    </Modal>
  );
}