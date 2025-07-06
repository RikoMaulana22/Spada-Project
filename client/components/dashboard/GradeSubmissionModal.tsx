// Path: client/components/dashboard/GradeSubmissionModal.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import apiClient from '@/lib/axios';
import Modal from '@/components/ui/Modal';
import { Submission } from '@/types';
import toast from 'react-hot-toast'; // <-- 1. IMPORT toast

interface GradeSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission | null;
  onGradeSuccess: () => void;
}

export default function GradeSubmissionModal({ isOpen, onClose, submission, onGradeSuccess }: GradeSubmissionModalProps) {
  const [score, setScore] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  // State 'feedback' tidak lagi dibutuhkan, kita ganti dengan toast

  useEffect(() => {
    if (submission) {
      setScore(submission.score?.toString() || '');
    }
  }, [submission]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!submission) return;

    const numericScore = parseFloat(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      // --- 2. GANTI setFeedback DENGAN toast.error ---
      toast.error('Nilai harus berupa angka antara 0 dan 100.');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.put(`/submissions/${submission.id}/grade`, {
        score: numericScore
      });
      // --- 3. GANTI alert DENGAN toast.success ---
      toast.success('Nilai berhasil disimpan!');
      
      onGradeSuccess();
      onClose();

    } catch (err: any) {
      // --- 4. GANTI setFeedback DENGAN toast.error ---
      toast.error(err.response?.data?.message || 'Gagal menyimpan nilai.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Beri Nilai untuk ${submission?.student.fullName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Area feedback tidak lagi diperlukan di sini */}
        
        {submission?.essayAnswer && (
          <div>
            <label className="block text-sm font-bold text-gray-800">Jawaban Siswa</label>
            <div className="mt-2 p-3 bg-gray-50 border rounded-md max-h-48 overflow-y-auto text-gray-700 whitespace-pre-wrap">
                {submission.essayAnswer}
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="score" className="block text-sm font-medium text-gray-700">Nilai (0-100)</label>
          <input
            type="number" id="score" name="score" value={score}
            onChange={(e) => setScore(e.target.value)}
            required min="0" max="100" step="0.1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="Masukkan nilai"
          />
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
            {isLoading ? 'Menyimpan...' : 'Simpan Nilai'}
          </button>
        </div>
      </form>
    </Modal>
  );
}