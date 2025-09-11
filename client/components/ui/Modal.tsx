// Path: client/components/ui/Modal.tsx
'use client';

import { FaTimes } from 'react-icons/fa';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  isFullScreen?: boolean; // Tambahkan prop opsional
}

export default function Modal({ isOpen, onClose, title, children, isFullScreen = false }: ModalProps) {
  if (!isOpen) return null;

  // Tentukan kelas CSS berdasarkan prop isFullScreen
  const overlayClass = isFullScreen 
    ? "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
    : "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
  
  const modalClass = isFullScreen
    ? "bg-gray-100 rounded-lg shadow-2xl w-full h-full max-w-full max-h-full overflow-y-auto flex flex-col"
    : "bg-white rounded-lg shadow-2xl w-full max-w-md p-6";

  const headerClass = isFullScreen
    ? "flex justify-between items-center p-4 border-b border-gray-300 sticky top-0 bg-gray-100 z-10"
    : "flex justify-between items-center mb-4";
  
  const contentClass = isFullScreen ? "flex-grow" : "";

  return (
    <div className={overlayClass} onClick={onClose}>
      <div className={modalClass} onClick={(e) => e.stopPropagation()}>
        <div className={headerClass}>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes size={20} />
          </button>
        </div>
        <div className={contentClass}>
          {children}
        </div>
      </div>
    </div>
  );
}