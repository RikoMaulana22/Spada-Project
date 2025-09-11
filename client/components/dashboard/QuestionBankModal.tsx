// Path: client/components/dashboard/QuestionBankModal.tsx
'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import AddAssignmentFormOriginal from '@/components/dashboard/AddAssignmentForm';
import { Search } from 'lucide-react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}


interface QuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: number | null;
  onAssignmentAdded: () => void;
}


interface BankedQuestion {
  id: number;
  questionText: string;
  type: 'pilgan' | 'esai' | 'upload_gambar' | 'link_google';
  subject: { id: number; name: string };
  difficulty: 'mudah' | 'sedang' | 'sulit';
}

interface Subject {
  id: number;
  name: string;
}

export default function QuestionBankModal({ isOpen, onClose, topicId, onAssignmentAdded }: QuestionBankModalProps) {
  const [activeTab, setActiveTab] = useState<'select' | 'create'>('select');
  const [bankedQuestions, setBankedQuestions] = useState<BankedQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const difficulties: BankedQuestion['difficulty'][] = ['mudah', 'sedang', 'sulit'];

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (isOpen) {
      apiClient.get('/subjects')
        .then(res => setSubjects(res.data))
        .catch(() => toast.error("Gagal memuat daftar mata pelajaran."));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && activeTab === 'select') {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (filterSubject) params.append('subjectId', filterSubject);
      if (filterDifficulty) params.append('difficulty', filterDifficulty);

      apiClient.get(`/question-bank?${params.toString()}`)
        .then(res => setBankedQuestions(res.data))
        .catch(() => toast.error("Gagal memuat gudang soal."))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, activeTab, debouncedSearchTerm, filterSubject, filterDifficulty]);

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
    <div className='text-gray-700'>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Gudang Soal"
        isFullScreen={true}
      >
        <div className="flex flex-col h-full bg-gray-50">
          <div className="border-b border-gray-200 px-6 flex-shrink-0 bg-white">
            <nav className="-mb-px flex space-x-6">
              <button
                onClick={() => setActiveTab('select')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'select' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Pilih dari Gudang
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'create' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Buat Soal Baru
              </button>
            </nav>
          </div>

          <div className="flex-grow overflow-hidden">
            {activeTab === 'select' && (
              <div className="flex h-full">
                <aside className="w-1/4 max-w-xs flex-shrink-0 bg-white border-r border-gray-200 p-6 space-y-6 overflow-y-auto">
                  <h3 className="font-semibold text-lg text-gray-800">Filter Soal</h3>

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
                    {isLoading ? (
                      <p className="text-center text-gray-500">Memuat soal...</p>
                    ) : bankedQuestions.length > 0 ? (
                      bankedQuestions.map(q => (
                        <div key={q.id} className="flex items-start p-4 border rounded-lg shadow-sm bg-white transition-all hover:shadow-md">
                          <input
                            type="checkbox"
                            id={`q-${q.id}`}
                            checked={selectedQuestions.includes(q.id)}
                            onChange={() => toggleQuestionSelection(q.id)}
                            className="h-4 w-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="ml-4 text-sm flex-grow">
                            <label htmlFor={`q-${q.id}`} className="font-medium text-gray-900 block cursor-pointer">{q.questionText}</label>
                            <div className="text-gray-500 mt-1 flex items-center space-x-2 text-xs">
                              
                              {/* === PERBAIKAN 2: Hapus q.topic.name dari tampilan === */}
                              <span>{q.subject?.name}</span>

                              <span className="font-mono text-gray-400">|</span>
                              <span className={`capitalize px-2 py-0.5 rounded-full ${q.difficulty === 'sulit' ? 'bg-red-100 text-red-800' : q.difficulty === 'sedang' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                {q.difficulty}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-gray-500">Tidak ada soal yang cocok dengan filter Anda.</p>
                        <p className="text-sm text-gray-400 mt-1">Coba reset filter atau gunakan kata kunci lain.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white flex justify-end items-center">
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
          </div>
        </div>
      </Modal>
    </div>
  );
}