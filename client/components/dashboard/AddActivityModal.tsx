// Path: client/components/dashboard/AddActivityModal.tsx
'use client';

import Modal from '@/components/ui/Modal';
import { FaFileUpload, FaClipboardList, FaClock } from 'react-icons/fa';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMaterial: () => void;
  onSelectAssignment: () => void;
  onSelectAttendance: () => void;
}

export default function AddActivityModal({
  isOpen,
  onClose,
  onSelectMaterial,
  onSelectAssignment,
  onSelectAttendance,
}: AddActivityModalProps) {
  return (
    <div className="grid grid-cols-1 bg-white text-gray-800 md:grid-cols-3 gap-4 text-center">
    <Modal isOpen={isOpen} onClose={onClose} title="Pilih Aktivitas atau Sumber Daya">
      <div className="grid grid-cols-1 bg-gray-200 text-gray-800 md:grid-cols-3 gap-4 text-center">
        {/* Tombol Tambah Materi */}
        <button
          onClick={onSelectMaterial}
          className="p-4 border rounded-lg flex flex-col items-center justify-center hover:bg-gray-100 hover:shadow-md transition-all"
        >
          <FaFileUpload className="text-3xl text-blue-500 mb-2" />
          <span className="font-semibold">Materi File</span>
        </button>

        {/* Tombol Tambah Tugas */}
        <button
          onClick={onSelectAssignment}
          className="p-4 border rounded-lg flex flex-col items-center justify-center hover:bg-gray-100 hover:shadow-md transition-all"
        >
          <FaClipboardList className="text-3xl text-green-500 mb-2" />
          <span className="font-semibold">Tugas / Kuis</span>
        </button>

        {/* Tombol Tambah Absensi */}
        <button
          onClick={onSelectAttendance}
          className="p-4 border rounded-lg flex flex-col items-center justify-center hover:bg-gray-100 hover:shadow-md transition-all"
        >
          <FaClock className="text-3xl text-red-500 mb-2" />
          <span className="font-semibold">Absensi</span>
        </button>
      </div>
    </Modal>
    </div>
  );
}