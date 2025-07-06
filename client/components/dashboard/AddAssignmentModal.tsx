// Path: client/components/dashboard/AddAssignmentModal.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import apiClient from '@/lib/axios';
import Modal from '@/components/ui/Modal';

// Definisikan tipe secara manual di frontend agar sesuai dengan enum di Prisma
export type AssignmentType = 'pilgan' | 'esai' | 'upload_gambar';

// Definisikan tipe untuk form state
interface OptionState {
  optionText: string;
  isCorrect: boolean;
}
interface QuestionState {
  questionText: string;
  options: OptionState[];
}

// PERUBAHAN 1: Interface state diperbarui
interface AssignmentState {
  title: string;
  description: string;
  type: AssignmentType;
  dueDate: string;
  questions: QuestionState[];
  // --- FIELD STATE BARU ---
  startTime: string;
  endTime: string;
  timeLimit: number;
  attemptLimit: number;
  passingGrade: number;
}

// PERUBAHAN 2: State awal diperbarui
const initialQuestionState: QuestionState = { questionText: '', options: [{ optionText: '', isCorrect: true }] };
const initialAssignmentState: AssignmentState = {
  title: '',
  description: '',
  type: 'pilgan', // Default ke pilihan ganda
  dueDate: '',
  questions: [initialQuestionState],
  // --- STATE AWAL BARU ---
  startTime: '',
  endTime: '',
  timeLimit: 60, // Default 60 menit
  attemptLimit: 1, // Default 1 kali
  passingGrade: 70, // Default 70
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAssignment(initialAssignmentState);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  // PERUBAHAN 3: Handler yang lebih umum untuk semua input form utama
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Untuk input number, konversi nilainya
    const finalValue = type === 'number' ? parseInt(value, 10) || 0 : value;

    setAssignment(prev => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  // Handler untuk pertanyaan (tidak berubah)
  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...assignment.questions];
    updatedQuestions[index].questionText = value;
    setAssignment(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const addQuestion = () => {
    setAssignment(prev => ({ ...prev, questions: [...prev.questions, initialQuestionState] }));
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...assignment.questions];
    updatedQuestions.splice(index, 1);
    setAssignment(prev => ({ ...prev, questions: updatedQuestions }));
  };

  // Handler untuk Pilihan Jawaban (tidak berubah)
  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updatedQuestions = [...assignment.questions];
    updatedQuestions[qIndex].options[oIndex].optionText = value;
    setAssignment(prev => ({ ...prev, questions: updatedQuestions }));
  };
  
  const setCorrectOption = (qIndex: number, oIndex: number) => {
    const updatedQuestions = [...assignment.questions];
    updatedQuestions[qIndex].options.forEach((opt, index) => {
      opt.isCorrect = index === oIndex;
    });
    setAssignment(prev => ({...prev, questions: updatedQuestions}));
  }

  const addOption = (qIndex: number) => {
    const updatedQuestions = [...assignment.questions];
    updatedQuestions[qIndex].options.push({ optionText: '', isCorrect: false });
    setAssignment(prev => ({ ...prev, questions: updatedQuestions }));
  };
  
  const removeOption = (qIndex: number, oIndex: number) => {
     const updatedQuestions = [...assignment.questions];
     updatedQuestions[qIndex].options.splice(oIndex, 1);
     setAssignment(prev => ({...prev, questions: updatedQuestions}));
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!topicId) return;

    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post(`/assignments/topic/${topicId}`, assignment);
      onAssignmentAdded();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat tugas.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Isi Pengaturan Kuis (Post Test/UTS/UAS)">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {/* Form utama */}
        <div>
          <label className="block text-sm font-medium">Judul Tugas</label>
          <input type="text" name="title" value={assignment.title} onChange={handleChange} required className="mt-1 w-full form-input" placeholder="Contoh: Post Test Modul 3"/>
        </div>
        <div>
          <label className="block text-sm font-medium">Deskripsi</label>
          <textarea name="description" value={assignment.description} onChange={handleChange} rows={3} className="mt-1 w-full form-input" placeholder="Petunjuk pengerjaan atau keterangan"></textarea>
        </div>
        
        {/* PERUBAHAN 4: Form untuk pengaturan baru ditambahkan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
          <div>
            <label className="block text-sm font-medium">Tipe Tugas</label>
            <select name="type" value={assignment.type} onChange={handleChange} className="mt-1 w-full form-input">
              <option value="esai">Esai</option>
              <option value="pilgan">Pilihan Ganda</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Tanggal Tenggat</label>
            <input type="datetime-local" name="dueDate" value={assignment.dueDate} onChange={handleChange} required className="mt-1 w-full form-input"/>
          </div>
          <div>
            <label className="block text-sm font-medium">Waktu Mulai</label>
            <input type="datetime-local" name="startTime" value={assignment.startTime} onChange={handleChange} className="form-input w-full"/>
          </div>
          <div>
            <label className="block text-sm font-medium">Waktu Tutup</label>
            <input type="datetime-local" name="endTime" value={assignment.endTime} onChange={handleChange} className="form-input w-full"/>
          </div>
          <div>
            <label className="block text-sm font-medium">Batas Waktu (menit)</label>
            <input type="number" name="timeLimit" value={assignment.timeLimit} onChange={handleChange} className="form-input w-full"/>
          </div>
          <div>
            <label className="block text-sm font-medium">Batas Percobaan</label>
            <input type="number" name="attemptLimit" value={assignment.attemptLimit} onChange={handleChange} className="form-input w-full"/>
          </div>
          <div>
            <label className="block text-sm font-medium">Nilai Minimum</label>
            <input type="number" name="passingGrade" value={assignment.passingGrade} onChange={handleChange} className="form-input w-full"/>
          </div>
        </div>

        {/* Form Pertanyaan Dinamis (Tidak berubah) */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-semibold">Soal Kuis</h3>
          {assignment.questions.map((q, qIndex) => (
            <div key={qIndex} className="p-3 border rounded-md bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold">Pertanyaan {qIndex + 1}</label>
                {assignment.questions.length > 1 && <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-500 text-xs">Hapus</button>}
              </div>
              <textarea value={q.questionText} onChange={(e) => handleQuestionChange(qIndex, e.target.value)} required rows={2} className="w-full form-input"></textarea>
              
              {assignment.type === 'pilgan' && (
                <div className="mt-2 space-y-2">
                   {q.options.map((opt, oIndex) => (
                     <div key={oIndex} className="flex items-center gap-2">
                       <input type="radio" name={`correct_option_${qIndex}`} checked={opt.isCorrect} onChange={() => setCorrectOption(qIndex, oIndex)} className="form-radio"/>
                       <input type="text" value={opt.optionText} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} required className="w-full form-input form-input-sm" placeholder={`Pilihan ${oIndex + 1}`} />
                       {q.options.length > 1 && <button type="button" onClick={() => removeOption(qIndex, oIndex)} className="text-red-500 text-xs">X</button>}
                     </div>
                   ))}
                   <button type="button" onClick={() => addOption(qIndex)} className="text-blue-600 text-sm mt-1">+ Tambah Pilihan</button>
                </div>
              )}
            </div>
          ))}
          <button type="button" onClick={addQuestion} className="text-sm font-semibold text-blue-700 hover:text-blue-900">+ Tambah Pertanyaan</button>
        </div>

        {/* Tombol Aksi (Tidak berubah) */}
        <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Batal</button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
            {isLoading ? 'Menyimpan...' : 'Simpan dan Tampilkan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}