'use client';

import { useState, useEffect, FormEvent, useMemo } from 'react';
import apiClient from '@/lib/axios';
import { Subject } from '@/types'; // Pastikan Anda memiliki file types/index.ts

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClassCreated: () => void;
  
}

export default function CreateClassModal({ isOpen, onClose, onClassCreated }: CreateClassModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- TAMBAHAN 1: State untuk file gambar dan pratinjaunya ---
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // -----------------------------------------------------------

  useEffect(() => {
    if (isOpen) {
      // Reset form setiap kali modal dibuka
      setName('');
      setDescription('');
      setSelectedGrade('');
      setSubjectId('');
      setError(null);
      // --- TAMBAHAN 2: Reset state gambar ---
      setImageFile(null);
      setImagePreview(null);
      // ---------------------------------------

      const fetchSubjects = async () => {
        try {
          const response = await apiClient.get('/subjects');
          setAllSubjects(response.data);
        } catch (error) {
          console.error('Gagal mengambil mata pelajaran', error);
          setError('Gagal memuat daftar mata pelajaran.');
        }
      };
      fetchSubjects();
    }
  }, [isOpen]);

  const filteredSubjects = useMemo(() => {
    if (!selectedGrade) return [];
    return allSubjects.filter(subject => subject.grade === parseInt(selectedGrade, 10));
  }, [selectedGrade, allSubjects]);

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGrade(e.target.value);
    setSubjectId('');
  };

  // --- TAMBAHAN 3: Fungsi untuk menangani perubahan input file gambar ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setImageFile(file); // Simpan objek File
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl); // Buat URL pratinjau untuk ditampilkan
    }
  };
  // --------------------------------------------------------------------

  // --- MODIFIKASI 4: Ubah handleSubmit untuk mengirim FormData ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Gunakan FormData untuk mengirim teks dan file
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('subjectId', subjectId);
    if (imageFile) {
      formData.append('image', imageFile); // 'image' adalah nama field untuk backend
    }

    try {
      await apiClient.post('/classes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Set header yang sesuai
        },
      });
      onClassCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat kelas.');
    } finally {
      setIsLoading(false);
    }
  };
  // ------------------------------------------------------------

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex justify-center items-center z-50">
      <div className=" bg-white p-6 rounded-lg shadow-xl w-full max-w-md text-gray-800">
        <h2 className="text-xl text-gray-900 font-bold mb-4">Buat Kelas Baru</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Kelas</label>
            <input
              type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Contoh: Matematika Kelas 7A"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Pilihan Kelas</label>
            <select
              id="grade" value={selectedGrade} onChange={handleGradeChange} required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="" disabled>Pilih Tingkatan Kelas</option>
              <option value="7">Kelas 7</option>
              <option value="8">Kelas 8</option>
              <option value="9">Kelas 9</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Mata Pelajaran</label>
            <select
              id="subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required
              disabled={!selectedGrade}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"
            >
              <option value="" disabled>Pilih Mata Pelajaran</option>
              {filteredSubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi (Opsional)</label>
            <textarea
              id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* --- TAMBAHAN 5: Input untuk unggah gambar --- */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Gambar Sampul Kelas (Opsional)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Pratinjau Gambar" className="mx-auto h-24 w-auto rounded-md" />
                ) : (
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Unggah file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                  </label>
                  <p className="pl-1">atau tarik dan lepas</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF hingga 2MB</p>
              </div>
            </div>
          </div>
          {/* ------------------------------------------- */}

          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
              Batal
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}