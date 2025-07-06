// Path: client/components/dashboard/EditTopicModal.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import apiClient from '@/lib/axios';
import Modal from '@/components/ui/Modal';
import { TopicInfo } from '@/types'; // Asumsikan tipe ini ada

interface EditTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: TopicInfo | null;
  onTopicUpdated: () => void;
}

export default function EditTopicModal({ isOpen, onClose, topic, onTopicUpdated }: EditTopicModalProps) {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Isi form dengan judul topik saat ini ketika modal dibuka
  useEffect(() => {
    if (topic) {
      setTitle(topic.title);
    }
  }, [topic]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setIsLoading(true);
    setError(null);
    try {
      await apiClient.put(`/topics/${topic.id}`, { title });
      onTopicUpdated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengupdate topik.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Topik">
      <form onSubmit={handleSubmit}>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="mb-4">
          <label htmlFor="topic-title-edit" className="block text-sm font-medium">Judul Topik</label>
          <input
            type="text"
            id="topic-title-edit"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}