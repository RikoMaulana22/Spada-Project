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
  const [selectedGrade, setSelectedGrade] = useState(''); // State untuk kelas yang dipilih
  const [subjectId, setSubjectId] = useState('');
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]); // Menyimpan semua mapel
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ambil semua daftar mata pelajaran sekali saja saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      // Reset form setiap kali modal dibuka
      setName('');
      setDescription('');
      setSelectedGrade('');
      setSubjectId('');
      setError(null);

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

  // Filter mata pelajaran berdasarkan kelas yang dipilih
  const filteredSubjects = useMemo(() => {
    if (!selectedGrade) return [];
    return allSubjects.filter(subject => subject.grade === parseInt(selectedGrade, 10));
  }, [selectedGrade, allSubjects]);

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGrade(e.target.value);
    setSubjectId(''); // Reset pilihan mapel saat kelas berubah
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post('/classes', { name, description, subjectId });
      onClassCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat kelas.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
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
          
          {/* --- INPUT BARU UNTUK PILIH KELAS --- */}
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

          {/* --- INPUT MATA PELAJARAN YANG SUDAH DIFILTER --- */}
          <div className="mb-4">
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Mata Pelajaran</label>
            <select
              id="subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required
              disabled={!selectedGrade} // Nonaktif jika kelas belum dipilih
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