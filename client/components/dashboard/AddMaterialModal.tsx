// Path: client/components/dashboard/AddMaterialModal.tsx
'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import apiClient from '@/lib/axios';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { UploadCloud, X, File as FileIcon } from 'lucide-react'; // Menggunakan ikon untuk UX yang lebih baik

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: number | null;
  onMaterialAdded: () => void;
}

export default function AddMaterialModal({ isOpen, onClose, topicId, onMaterialAdded }: AddMaterialModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset semua state saat modal ditutup atau dibuka
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setContent('');
      setYoutubeUrl('');
      setFile(null);
      setIsLoading(false);
      // Memastikan nilai input file juga di-reset
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !topicId) {
      toast.error('Judul materi wajib diisi.');
      return;
    }
    if (!content && !youtubeUrl && !file) {
      toast.error('Harap isi setidaknya satu jenis konten (teks, link YouTube, atau file).');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('Menyimpan materi...');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('youtubeUrl', youtubeUrl);
      if (file) {
        formData.append('file', file);
      }

      // Selalu gunakan FormData untuk konsistensi, bahkan jika tidak ada file
      await apiClient.post(`/materials/topics/${topicId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Materi berhasil ditambahkan!', { id: toastId });
      onMaterialAdded();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan materi.', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files ? e.target.files[0] : null);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="" // Hapus title bawaan
      isFullScreen={true}
    >
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900">Tambah Materi Baru</h2>
          <p className="text-sm text-gray-500 mt-1">Isi detail materi yang ingin Anda bagikan kepada siswa.</p>
        </div>

        {/* Form Content (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8 space-y-8">
            {/* --- Section: Informasi Dasar --- */}
            <fieldset className="space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <legend className="text-lg font-semibold text-gray-800">Informasi Dasar</legend>
              </div>
              <div>
                <label htmlFor="material-title" className="block text-sm font-medium text-gray-700 mb-1">Judul Materi <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="material-title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Contoh: Pengenalan Aljabar"
                />
              </div>
            </fieldset>

            {/* --- Section: Konten Materi --- */}
            <fieldset className="space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <legend className="text-lg font-semibold text-gray-800">Isi Materi</legend>
                <p className="text-sm text-gray-500">Pilih salah satu atau kombinasikan beberapa jenis konten di bawah ini.</p>
              </div>
              <div>
                <label htmlFor="material-content" className="block text-sm font-medium text-gray-700 mb-1">Konten Teks (Opsional)</label>
                <textarea
                  id="material-content" value={content} onChange={(e) => setContent(e.target.value)}
                  rows={6} 
                  className="w-full px-4 py-3 text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ketik deskripsi atau materi singkat di sini..."
                />
              </div>

              <div>
                <label htmlFor="material-youtube" className="block text-sm font-medium text-gray-700 mb-1">Link Video YouTube (Opsional)</label>
                <input
                  type="url" id="material-youtube" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="input-form" placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unggah File (Opsional)</label>
                {!file ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-10 hover:border-blue-500 cursor-pointer transition-colors"
                  >
                    <div className="text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-semibold text-blue-600">Klik untuk mengunggah</span> atau seret dan lepas file
                      </p>
                      <p className="text-xs text-gray-500">PDF, DOCX, PPT, PNG, JPG, MP4, dll.</p>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  </div>
                ) : (
                  <div className="mt-2 flex items-center justify-between rounded-lg border border-gray-300 bg-white p-3">
                    <div className="flex items-center space-x-3">
                      <FileIcon className="h-6 w-6 text-gray-500" />
                      <span className="text-sm font-medium text-gray-800 truncate">{file.name}</span>
                    </div>
                    <button type="button" onClick={removeFile} className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </fieldset>
          </div>

          {/* Footer Aksi (Sticky) */}
          <div className="flex-shrink-0 sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Menyimpan...' : 'Simpan Materi'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}