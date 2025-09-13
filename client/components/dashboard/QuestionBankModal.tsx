// Di file: client/components/dashboard/QuestionBankModal.tsx
'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Modal from '@/components/ui/Modal';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import AddAssignmentFormOriginal from '@/components/dashboard/AddAssignmentForm';
import { Search, FileText } from 'lucide-react';
import QuestionDetailModal from './QuestionDetailModal'; // <-- Impor modal detail

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Komponen untuk Tab Impor dari Word
const ImportWordTab = ({ onImportSuccess, subjects, difficulties }: { onImportSuccess: () => void, subjects: any[], difficulties: string[] }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [subjectId, setSubjectId] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleImportSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !subjectId || !difficulty) {
      toast.error("File, mapel, dan kesulitan wajib diisi.");
      return;
    }
    setIsUploading(true);
    const toastId = toast.loading("Memproses dokumen Word...");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('subjectId', subjectId);
    formData.append('difficulty', difficulty);

    try {
      const response = await apiClient.post('/question-banks/import-word', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message, { id: toastId });
      onImportSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengimpor soal.", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Impor Soal dari Dokumen Word</h3>
        <p className="mt-1 text-sm text-gray-500">
          Unggah file .docx dengan format penomoran dan pilihan ganda standar.
        </p>
        <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-left text-xs text-yellow-800">
          <p><strong>Format Wajib:</strong></p>
          <ul className="list-disc list-inside">
            <li>Soal dimulai dengan angka dan titik (e.g., `1. Apa ibukota...`).</li>
            <li>Pilihan dimulai dengan huruf (A-E) dan titik (e.g., `A. Jakarta`).</li>
            <li>Tandai jawaban yang benar dengan tanda bintang `*` sebelum huruf (e.g., `*C. Bandung`).</li>
          </ul>
        </div>

        <form onSubmit={handleImportSubmit} className="mt-6 space-y-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-form">Mata Pelajaran</label>
              <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="input-form">
                <option value="">Pilih Mapel</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-form">Tingkat Kesulitan</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-form">
                <option value="">Pilih Tingkat</option>
                {difficulties.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label-form">File Dokumen (.docx)</label>
            <input type="file" onChange={handleFileChange} accept=".docx" className="file-input mt-1" />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={isUploading}>
            {isUploading ? 'Memproses...' : 'Impor Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ... (Interface declarations) ...
interface BankedQuestion {
  id: number;
  questionText: string;
  subject: { id: number; name: string };
  difficulty: 'mudah' | 'sedang' | 'sulit';
}
interface Subject {
  id: number;
  name: string;
}

export default function QuestionBankModal({ isOpen, onClose, topicId, onAssignmentAdded }: any) {
  const [activeTab, setActiveTab] = useState<'select' | 'create' | 'import'>('select');
  const [bankedQuestions, setBankedQuestions] = useState<BankedQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // State untuk modal detail
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);

  // ... (Filter states) ...
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const difficulties: BankedQuestion['difficulty'][] = ['mudah', 'sedang', 'sulit'];
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchPrerequisites = () => {
    apiClient.get('/subjects')
      .then(res => setSubjects(res.data))
      .catch(() => toast.error("Gagal memuat daftar mata pelajaran."));
  };

  const fetchBankedQuestions = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
    if (filterSubject) params.append('subjectId', filterSubject);
    if (filterDifficulty) params.append('difficulty', filterDifficulty);

    apiClient.get(`/question-banks?${params.toString()}`)
      .then(res => setBankedQuestions(res.data))
      .catch(() => toast.error("Gagal memuat gudang soal."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchPrerequisites();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && activeTab === 'select') {
      fetchBankedQuestions();
    }
  }, [isOpen, activeTab, debouncedSearchTerm, filterSubject, filterDifficulty]);

  const handleOpenDetailModal = (questionId: number) => {
    setEditingQuestionId(questionId);
    setIsDetailModalOpen(true);
  };

  const toggleQuestionSelection = (questionId: number) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleCreateAssignmentFromBank = async () => {
    if (selectedQuestions.length === 0) return;
    toast.success(`Membuat tugas dengan ${selectedQuestions.length} soal terpilih. (Fungsionalitas backend segera hadir)`);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterSubject('');
    setFilterDifficulty('');
  }


  return (
    <div className='text-gray-800'>
      <Modal isOpen={isOpen} onClose={onClose} title="Gudang Soal" isFullScreen={true}>
        <div className="flex flex-col h-full bg-gray-50">
          <div className="border-b border-gray-200 px-6 flex-shrink-0 bg-white">
            <nav className="-mb-px flex space-x-6">
              <button onClick={() => setActiveTab('select')} className={`tab-button ${activeTab === 'select' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Pilih dari Gudang</button>
              <button onClick={() => setActiveTab('create')} className={`tab-button ${activeTab === 'create' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Buat Soal Baru</button>
              <button onClick={() => setActiveTab('import')} className={`tab-button ${activeTab === 'import' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Impor Word</button>
            </nav>
          </div>

          <div className="flex-grow overflow-hidden">
            {activeTab === 'select' && (
              <div className="flex h-full">
                <aside className="w-1/4 max-w-xs flex-shrink-0 bg-white border-r p-6 space-y-6 overflow-y-auto">
                  <h3 className="font-semibold text-lg">Filter Soal</h3>
                  {/* ... Filter form (search, subject, difficulty) */}
                  <div className="space-y-2">
                    <label htmlFor="search" className="text-sm font-medium text-gray-700">Cari Soal</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-gray-400" />
                      </span>
                      <input
                        type="text"
                        id="search"
                        placeholder="Ketik kata kunci..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-gray-700">Mata Pelajaran</label>
                    <select
                      id="subject"
                      value={filterSubject}
                      onChange={(e) => setFilterSubject(e.target.value)}
                      className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Semua Mapel</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="difficulty" className="text-sm font-medium text-gray-700">Tingkat Kesulitan</label>
                    <select
                      id="difficulty"
                      value={filterDifficulty}
                      onChange={(e) => setFilterDifficulty(e.target.value)}
                      className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Semua Tingkat</option>
                      {difficulties.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
                    </select>
                  </div>

                  <button
                    onClick={handleResetFilters}
                    className="w-full text-sm text-blue-600 hover:underline"
                  >
                    Reset Filter
                  </button>
                </aside>
                <main className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-grow p-6 space-y-3 overflow-y-auto">
                    {isLoading && <p>Memuat...</p>}
                    {!isLoading && bankedQuestions.map(q => (
                      <div key={q.id} className="flex items-start p-4 border rounded-lg bg-white hover:shadow-md">
                        <input type="checkbox" onChange={() => toggleQuestionSelection(q.id)} checked={selectedQuestions.includes(q.id)} className="h-4 w-4 mt-1" />
                        <div className="ml-4 text-sm flex-grow cursor-pointer" onClick={() => handleOpenDetailModal(q.id)}>
                          <p className="font-medium text-gray-900">{q.questionText}</p>
                          {/* ... (info mapel & kesulitan) */}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex-shrink-0 p-4 border-t bg-white flex justify-end items-center">
                    <span className="text-sm font-medium text-gray-700 mr-4">
                      {selectedQuestions.length} soal terpilih
                    </span>
                    <button
                      onClick={handleCreateAssignmentFromBank}
                      disabled={selectedQuestions.length === 0 || isLoading}
                      className="btn-primary disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                      Buat Tugas
                    </button>
                  </div>
                </main>
              </div>
            )}
            {activeTab === 'create' && (
              <div className="p-6 overflow-y-auto h-full">
                <AddAssignmentFormOriginal
                  topicId={topicId}
                  onSuccess={() => {
                    onAssignmentAdded();
                    onClose();
                  }}
                />
              </div>
            )}
            {activeTab === 'import' && (
              <ImportWordTab
                onImportSuccess={() => setActiveTab('select')}
                subjects={subjects}
                difficulties={difficulties}
              />
            )}
          </div>
        </div>
      </Modal>

      <QuestionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        questionId={editingQuestionId}
        onQuestionUpdated={() => {
          fetchBankedQuestions(); // Refresh daftar soal setelah di-update
        }}
      />
    </div>
  );
}