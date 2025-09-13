'use client';

import { useState, useEffect, FormEvent } from 'react';
import Modal from '@/components/ui/Modal';
import apiClient from '@/lib/axios';
import toast from 'react-hot-toast';
import { BankedQuestion, Subject, QuestionOption } from '@/types'; // Import QuestionOption

interface QuestionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    questionId: number | null;
    onQuestionUpdated: () => void;
}

export default function QuestionDetailModal({ isOpen, onClose, questionId, onQuestionUpdated }: QuestionDetailModalProps) {
    const [question, setQuestion] = useState<BankedQuestion | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    
    useEffect(() => {
        if (isOpen && questionId) {
            setIsLoading(true);
            Promise.all([
                apiClient.get('/subjects'),
                apiClient.get(`/question-banks/${questionId}`)
            ]).then(([subjectsRes, questionRes]) => {
                setSubjects(subjectsRes.data);
                setQuestion(questionRes.data);
            }).catch(() => {
                toast.error("Gagal memuat detail soal.");
                onClose();
            }).finally(() => {
                setIsLoading(false);
            });
        }
    }, [isOpen, questionId, onClose]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setQuestion(prev => prev ? { ...prev, [name]: value } : null);
    };
    
    const handleOptionTextChange = (index: number, text: string) => {
        setQuestion(prev => {
            if (!prev || !prev.options) return prev;
            const newOptions = [...prev.options];
            newOptions[index] = { ...newOptions[index], text: text };
            return { ...prev, options: newOptions };
        });
    };

    const handleCorrectOptionChange = (index: number) => {
         setQuestion(prev => {
            if (!prev || !prev.options) return prev;
            const newOptions = prev.options.map((opt, idx) => ({
                ...opt,
                isCorrect: idx === index
            }));
            return { ...prev, options: newOptions };
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!question) return;

        setIsSaving(true);
        const toastId = toast.loading("Menyimpan perubahan...");

        const payload = {
            questionText: question.questionText,
            // PERBAIKAN: Kirim nilai difficulty dalam huruf besar
            difficulty: question.difficulty.toUpperCase(),
            subjectId: question.subjectId,
            options: question.options?.map(({ text, isCorrect }) => ({ text, isCorrect }))
        };

        try {
            await apiClient.put(`/question-banks/${question.id}`, payload);
            toast.success("Soal berhasil diperbarui!", { id: toastId });
            onQuestionUpdated();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal menyimpan perubahan.", { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detail & Edit Soal" isFullScreen={false}>
            {isLoading && <div className="p-6 text-center">Memuat...</div>}
            {!isLoading && question && (
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="label-form">Teks Pertanyaan</label>
                        <textarea name="questionText" value={question.questionText} onChange={handleTextChange} className="input-form" rows={3}></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-form">Mata Pelajaran</label>
                            <select name="subjectId" value={question.subjectId} onChange={handleTextChange} className="input-form">
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                           <label className="label-form">Tingkat Kesulitan</label>
                            {/* PERBAIKAN: value diatur ke huruf kecil untuk tampilan, tapi akan dikirim sbg huruf besar */}
                            <select name="difficulty" value={question.difficulty.toLowerCase()} onChange={handleTextChange} className="input-form capitalize">
                                <option value="mudah">Mudah</option>
                                <option value="sedang">Sedang</option>
                                <option value="sulit">Sulit</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="label-form">Pilihan Jawaban</label>
                        <div className="space-y-2 mt-1">
                            {question.options?.map((opt, index) => (
                                <div key={opt.id || index} className="flex items-center gap-2">
                                    <input type="radio" name="correctOption" checked={opt.isCorrect} onChange={() => handleCorrectOptionChange(index)} className="h-5 w-5 text-blue-600 focus:ring-blue-500"/>
                                    <input type="text" value={opt.text} onChange={(e) => handleOptionTextChange(index, e.target.value)} className="input-form flex-grow"/>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="pt-4 flex justify-end">
                        <button type="submit" className="btn-primary" disabled={isSaving}>
                            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
}