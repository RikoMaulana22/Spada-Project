// Path: client/components/dashboard/AddAssignment.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash } from 'react-icons/fa';

type AssignmentType = 'pilgan' | 'esai' | 'link_google';

interface OptionState {
  optionText: string;
  isCorrect: boolean;
  explanation?: string;
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

interface AddAssignmentFormProps {
  topicId: number | null;
  onSuccess: () => void;
}

export default function AddAssignmentForm({ topicId, onSuccess }: AddAssignmentFormProps) {
  const [assignment, setAssignment] = useState<AssignmentState>(initialAssignmentState);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? parseInt(value, 10) || 0 : value;
    setAssignment(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...assignment.questions];
    updatedQuestions[index].questionText = value;
    setAssignment(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const addQuestion = () => {
    setAssignment(prev => ({
      ...prev,
      questions: [...prev.questions, { ...initialQuestionState }]
    }));
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = assignment.questions.filter((_, qIndex) => qIndex !== index);
    setAssignment(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updatedQuestions = [...assignment.questions];
    updatedQuestions[qIndex].options[oIndex].optionText = value;
    setAssignment(prev => ({ ...prev, questions: updatedQuestions }));
  };

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
    if (payload.type === 'link_google' || payload.type === 'esai') {
      payload.questions = payload.questions.map(q => ({
        questionText: q.questionText,
        options: []
      }));
    }

    try {
      // This endpoint will need to be adjusted to save to the Question Bank
      await apiClient.post(`/assignments/topic/${topicId}`, payload);
      toast.success('Tugas berhasil dibuat!', { id: loadingToast });
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal membuat tugas.', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[60vh] overflow-y-auto p-1">
      {/* Form fields for assignment details */}
      <div className="space-y-4 p-4 rounded-lg">
        <h3 className="font-semibold text-lg">Detail Tugas</h3>
        <div>
          <label className="block text-sm font-medium">Judul</label>
          <input type="text"
            name="title"
            value={assignment.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
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
            <option value="link_google">Tugas Link</option>
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

      {/* Dynamic Question Form */}
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
        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? 'Menyimpan...' : 'Simpan Tugas'}
        </button>
      </div>
    </form>
  );
}