'use client';

import { useState, FormEvent, useEffect } from 'react';
import apiClient from '@/lib/axios';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash } from 'react-icons/fa';

// Definisikan tipe data secara lokal untuk komponen ini
type AssignmentType = 'pilgan' | 'esai' | 'link_google';

interface OptionState {
  optionText: string;
  isCorrect: boolean;
}
interface QuestionState {
  questionText: string;
  options: OptionState[];
}
interface AssignmentState {
  title: string;
  description: string;
  type: AssignmentType;
  dueDate: string;
  externalUrl: string;
  questions: QuestionState[];
  startTime: string;
  endTime: string;
  timeLimit: number;
  attemptLimit: number;
  passingGrade: number;
}

// State awal untuk form saat pertama kali dibuka atau di-reset
const initialQuestionState: QuestionState = { questionText: '', options: [{ optionText: '', isCorrect: true }] };
const initialAssignmentState: AssignmentState = {
  title: '',
  description: '',
  type: 'pilgan',
  dueDate: '',
  externalUrl: '',
  questions: [initialQuestionState],
  startTime: '',
  endTime: '',
  timeLimit: 60,
  attemptLimit: 1,
  passingGrade: 70,
};

interface AddAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: number | null;
  onAssignmentAdded: () => void;
}

export default function AddAssignmentModal({ isOpen, onClose, topicId, onAssignmentAdded }: AddAssignmentModalProps) {
  const [assignment, setAssignment] = useState<AssignmentState>(initialAssignmentState);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      setAssignment(initialAssignmentState);
    }
  }, [isOpen]);

  // Handler umum untuk input form utama
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? parseInt(value, 10) || 0 : value;
    setAssignment(prev => ({ ...prev, [name]: finalValue }));
  };

  // --- Handler untuk Pertanyaan ---
  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...assignment.questions];
    updatedQuestions[index].questionText = value;
    setAssignment(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const addQuestion = () => {
    setAssignment(prev => ({
      ...prev,
      questions: [...prev.questions, { questionText: '', options: [{ optionText: '', isCorrect: true }] }]
    }));
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = assignment.questions.filter((_, qIndex) => qIndex !== index);
    setAssignment(prev => ({ ...prev, questions: updatedQuestions }));
  };

  // --- Handler untuk Pilihan Jawaban ---
  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updatedQuestions = [...assignment.questions];
    updatedQuestions[qIndex].options[oIndex].optionText = value;
    setAssignment(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const addOption = (qIndex: number) => {
    const updatedQuestions = [...assignment.questions];
    updatedQuestions[qIndex].options.push({ optionText: '', isCorrect: false });
    setAssignment(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const updatedOptions = assignment.questions[qIndex].options.filter((_, optIndex) => optIndex !== oIndex);
    const updatedQuestions = [...assignment.questions];
    updatedQuestions[qIndex].options = updatedOptions;
    setAssignment(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const setCorrectOption = (qIndex: number, oIndex: number) => {
    const updatedQuestions = [...assignment.questions];
    updatedQuestions[qIndex].options.forEach((opt, index) => {
      opt.isCorrect = index === oIndex;
    });
    setAssignment(prev => ({...prev, questions: updatedQuestions}));
  };

  // --- FUNGSI SIMPAN TUGAS (handleSubmit) YANG SUDAH LENGKAP ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!topicId) return;

    const loadingToast = toast.loading('Menyimpan tugas...');
    setIsLoading(true);
    
    // Siapkan payload yang akan dikirim ke backend
    const payload = { ...assignment };
    if (payload.type !== 'link_google') {
        delete (payload as any).externalUrl;
    }
    if (payload.type === 'link_google') {
        payload.questions = [];
    } else if (payload.type === 'esai') {
        // Untuk esai, kita hanya butuh teks pertanyaannya saja, bukan pilihan jawaban
        payload.questions = [{ questionText: payload.questions[0]?.questionText || 'Jelaskan...', options: [] }];
    }

    try {
      await apiClient.post(`/assignments/topic/${topicId}`, payload);
      toast.success('Tugas berhasil dibuat!', { id: loadingToast });
      onAssignmentAdded(); // Refresh data di halaman utama
      onClose(); // Tutup modal
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal membuat tugas.', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
            <div className="space-y-4 p-4 text-gray-800  rounded-lg">

    <Modal isOpen={isOpen} onClose={onClose} title="Buat Tugas / Kuis Baru">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto  text-gray-800 p-1">
        {/* Detail Tugas Utama */}
        <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold text-lg">Detail Tugas</h3>
            <div>
                <label className="block text-sm font-medium">Judul</label>
                <input type="text" name="title" value={assignment.title} onChange={handleChange} required className="form-input border  w-full mt-1" />
            </div>
            <div>
                <label className="block text-sm font-medium">Deskripsi</label>
                <textarea name="description" value={assignment.description} onChange={handleChange} rows={3} className="form-textarea border w-full mt-1"></textarea>
            </div>
            <div>
                <label className="block text-sm font-medium">Tipe Tugas</label>
                <select name="type" value={assignment.type} onChange={handleChange} className="form-select  border mt-1 w-full">
                    <option value="pilgan">Pilihan Ganda</option>
                    <option value="esai">Esai</option>
                    <option value="link_google">Tugas Link (Google Docs, dll)</option>
                </select>
            </div>
            {assignment.type === 'link_google' && (
                <div>
                    <label className="block text-sm font-medium">URL Eksternal</label>
                    <input type="url" name="externalUrl" value={assignment.externalUrl} onChange={handleChange} required className="form-input w-full mt-1" placeholder="https://docs.google.com/..."/>
                </div>
            )}
             <div>
                <label className="block text-sm font-medium">Tanggal Tenggat</label>
                <input type="datetime-local" name="dueDate" value={assignment.dueDate} onChange={handleChange} required className="form-input mt-1 w-full"/>
            </div>
        </div>

        {/* Form Pertanyaan Dinamis (jika bukan tugas link) */}
        {(assignment.type === 'pilgan' || assignment.type === 'esai') && (
            <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold text-lg">Soal</h3>
                {assignment.questions.map((q, qIndex) => (
                    <div key={qIndex} className="p-4 border rounded-md bg-gray-50/50 space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="font-bold">Pertanyaan {qIndex + 1}</label>
                            {assignment.questions.length > 1 && (
                                <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                            )}
                        </div>
                        <textarea value={q.questionText} onChange={(e) => handleQuestionChange(qIndex, e.target.value)} required rows={3} className="w-full border form-input" />
                        
                        {assignment.type === 'pilgan' && (
                            <div className="space-y-2 pt-2 border-t">
                                <label className="text-sm font-medium">Pilihan Jawaban (tandai yang benar)</label>
                                {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-2">
                                        <input type="radio" name={`correct_option_${qIndex}`} checked={opt.isCorrect} onChange={() => setCorrectOption(qIndex, oIndex)} className="form-radio"/>
                                        <input type="text" value={opt.optionText} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} required className="form-input flex-grow" />
                                        {q.options.length > 1 && (
                                            <button type="button" onClick={() => removeOption(qIndex, oIndex)} className="text-gray-400 hover:text-red-600 p-1"><FaTrash size={12} /></button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={() => addOption(qIndex)} className="text-blue-600 text-sm font-semibold flex items-center gap-1 mt-2">
                                    <FaPlus size={10} /> Tambah Pilihan
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                {assignment.type !== 'esai' && (
                  <button type="button" onClick={addQuestion} className="text-blue-700 font-semibold text-sm">+ Tambah Pertanyaan</button>
                )}
            </div>
        )}

        <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
          <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg">
            {isLoading ? 'Menyimpan...' : 'Simpan Tugas'}
          </button>
        </div>
      </form>
    </Modal>
    </div>
            
  );
}