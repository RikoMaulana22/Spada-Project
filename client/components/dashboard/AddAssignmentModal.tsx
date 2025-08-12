'use client';

import { useState, FormEvent, useEffect } from 'react';
import apiClient from '@/lib/axios';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash } from 'react-icons/fa';

// Definisikan tipe data secara lokal untuk komponen ini
type AssignmentType = 'pilgan' | 'esai' | 'link_google';

// PERUBAHAN 1: Menambahkan `explanation` pada OptionState
interface OptionState {
  optionText: string;
  isCorrect: boolean;
  explanation?: string; // Penjelasan mengapa jawaban ini benar (opsional)
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

// PERUBAHAN 2: Menyesuaikan state awal
const initialQuestionState: QuestionState = { questionText: '', options: [{ optionText: '', isCorrect: true, explanation: '' }] };
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

  useEffect(() => {
    if (isOpen) {
      setAssignment(initialAssignmentState);
    }
  }, [isOpen]);

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
      questions: [...prev.questions, { questionText: '', options: [{ optionText: '', isCorrect: true, explanation: '' }] }]
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

  // PERUBAHAN 3: Handler baru untuk mengelola input penjelasan
  const handleExplanationChange = (qIndex: number, oIndex: number, value: string) => {
    const updatedQuestions = [...assignment.questions];
    updatedQuestions[qIndex].options[oIndex].explanation = value;
    setAssignment(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const addOption = (qIndex: number) => {
    const updatedQuestions = [...assignment.questions];
    updatedQuestions[qIndex].options.push({ optionText: '', isCorrect: false, explanation: '' });
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
    setAssignment(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!topicId) return;

    if (assignment.type === 'pilgan') {
      for (const q of assignment.questions) {
        if (!q.options.some(opt => opt.isCorrect)) {
          toast.error(`Pertanyaan "${q.questionText.substring(0, 20)}..." belum memiliki kunci jawaban.`);
          return;
        }
      }
    }

    const loadingToast = toast.loading('Menyimpan tugas...');
    setIsLoading(true);

    const payload = { ...assignment };
    if (payload.type !== 'link_google') {
      delete (payload as any).externalUrl;
    }
    if (payload.type === 'link_google') {
      payload.questions = [];
    } else if (payload.type === 'esai') {
      payload.questions = payload.questions.map(q => ({
        questionText: q.questionText,
        options: [] // Memastikan options selalu array kosong untuk esai
      }));
    }

    try {
      await apiClient.post(`/assignments/topic/${topicId}`, payload);
      toast.success('Tugas berhasil dibuat!', { id: loadingToast });
      onAssignmentAdded();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal membuat tugas.', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buat Tugas / Kuis Baru">
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto text-gray-800 p-1">
        {/* ... (Detail Tugas Utama & Pengaturan Kuis tidak berubah) ... */}
        {/* Detail Tugas Utama */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold text-lg">Detail Tugas</h3>
          <div>
            <label className="block text-sm font-medium">Judul</label>
            <input type="text" name="title" value={assignment.title} onChange={handleChange} required className="form-input border w-full mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium">Deskripsi</label>
            <textarea name="description" value={assignment.description} onChange={handleChange} rows={3} className="form-textarea border w-full mt-1"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium">Tipe Tugas</label>
            <select name="type" value={assignment.type} onChange={handleChange} className="form-select border mt-1 w-full">
              <option value="pilgan">Pilihan Ganda</option>
              <option value="esai">Esai</option>
              <option value="link_google">Tugas Link (Google Docs, dll)</option>
            </select>
          </div>
          {assignment.type === 'link_google' && (
            <div>
              <label className="block text-sm font-medium">URL Eksternal</label>
              <input type="url" name="externalUrl" value={assignment.externalUrl} onChange={handleChange} required className="form-input w-full mt-1" placeholder="https://docs.google.com/..." />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium">Tanggal Tenggat</label>
            <input type="datetime-local" name="dueDate" value={assignment.dueDate} onChange={handleChange} required className="form-input mt-1 w-full" />
          </div>
        </div>

        {assignment.type === 'pilgan' && (
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold text-lg">Pengaturan Kuis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Waktu Mulai (Opsional)</label>
                <input type="datetime-local" name="startTime" value={assignment.startTime} onChange={handleChange} className="form-input mt-1 w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium">Waktu Selesai (Opsional)</label>
                <input type="datetime-local" name="endTime" value={assignment.endTime} onChange={handleChange} className="form-input mt-1 w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium">Batas Waktu (Menit)</label>
                <input type="number" name="timeLimit" value={assignment.timeLimit} onChange={handleChange} className="form-input mt-1 w-full" placeholder="Contoh: 60" />
                <p className="text-xs text-gray-500 mt-1">Isi 0 jika tidak ada batas waktu.</p>
              </div>
              <div>
                <label className="block text-sm font-medium">Batas Mengerjakan</label>
                <input type="number" name="attemptLimit" value={assignment.attemptLimit} onChange={handleChange} className="form-input mt-1 w-full" placeholder="Contoh: 1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Nilai Kelulusan (KKM)</label>
                <input type="number" name="passingGrade" value={assignment.passingGrade} onChange={handleChange} className="form-input mt-1 w-full" placeholder="Contoh: 75" />
              </div>
            </div>
          </div>
        )}

        {/* Form Pertanyaan Dinamis */}
        {(assignment.type === 'pilgan' || assignment.type === 'esai') && (
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold text-lg">Soal</h3>
            {assignment.questions.map((q, qIndex) => (
              <div key={qIndex} className="p-4 border rounded-md bg-gray-50/50 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="font-bold">Pertanyaan {qIndex + 1}</label>
                  {assignment.questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                  )}
                </div>
                <textarea value={q.questionText} onChange={(e) => handleQuestionChange(qIndex, e.target.value)} required rows={3} className="w-full border form-textarea" placeholder="Tuliskan pertanyaan di sini..." />

                {assignment.type === 'pilgan' && (
                  <div className="pl-4 border-l-4 border-blue-200 space-y-3">
                    <h4 className="font-semibold text-sm text-gray-600">Pilihan Jawaban</h4>
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex}>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct_option_${qIndex}`}
                            checked={opt.isCorrect}
                            onChange={() => setCorrectOption(qIndex, oIndex)}
                            className="form-radio h-5 w-5 text-blue-600"
                          />
                          <input
                            type="text"
                            placeholder={`Opsi ${oIndex + 1}`}
                            value={opt.optionText}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                            required
                            className="form-input border w-full"
                          />
                          {q.options.length > 1 && (
                            <button type="button" onClick={() => removeOption(qIndex, oIndex)} className="text-gray-400 hover:text-red-500 p-1">
                              <FaTrash size={14} />
                            </button>
                          )}
                        </div>

                        {/* PERUBAHAN 4: Menampilkan textarea jika opsi ini adalah jawaban yang benar */}
                        {opt.isCorrect && (
                          <div className="mt-2 pl-7">
                            <textarea
                              placeholder="Jelaskan mengapa jawaban ini benar (opsional)..."
                              rows={2}
                              value={opt.explanation || ''}
                              onChange={(e) => handleExplanationChange(qIndex, oIndex, e.target.value)}
                              className="form-textarea w-full text-sm bg-blue-50/50 border-blue-200"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addOption(qIndex)} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold mt-2">
                      <FaPlus size={12} />
                      <span>Tambah Opsi</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button type="button" onClick={addQuestion} className="w-full text-center px-4 py-2 border-2 border-dashed rounded-lg text-blue-700 hover:bg-blue-50">
              + Tambah Pertanyaan Baru
            </button>

          </div>
        )}

        <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Batal</button>
          <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg disabled:bg-blue-300 hover:bg-blue-700">
            {isLoading ? 'Menyimpan...' : 'Simpan Tugas'}
          </button>
        </div>
      </form>
    </Modal>
  );
}