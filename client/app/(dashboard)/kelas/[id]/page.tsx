'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/axios';
import Link from 'next/link';
// --- PERUBAHAN 1: Impor FaYoutube & YouTubeEmbed ---
import { FaChevronDown, FaChevronRight, FaFilePdf, FaClipboardList, FaPencilAlt, FaTrash, FaCalendarCheck, FaYoutube } from 'react-icons/fa';
import YouTubeEmbed from '@/components/ui/YouTubeEmbed';
// --- BATAS PERUBAHAN ---
import { useAuth } from '@/contexts/AuthContext';
import AddTopicModal from '@/components/dashboard/AddTopicModal';
import AddActivityModal from '@/components/dashboard/AddActivityModal';
import AddMaterialModal from '@/components/dashboard/AddMaterialModal';
import EditTopicModal from '@/components/dashboard/EditTopicModal';
import AddAssignmentModal from '@/components/dashboard/AddAssignmentModal';
import AddAttendanceModal from '@/components/dashboard/AddAttendanceModal';
import EditAssignmentModal from '@/components/dashboard/EditAssignmentModal';


// --- PERUBAHAN 2: Perbarui Tipe MaterialInfo ---
interface MaterialInfo {
  id: number;
  title: string;
  fileUrl?: string | null; // Dibuat opsional
  youtubeUrl?: string | null; // Dibuat opsional
}
// --- BATAS PERUBAHAN ---
interface AssignmentInfo { id: number; title: string; type: string; dueDate: string; }
interface AttendanceInfo { id: number; title: string; }
interface TopicInfo {
  id: number;
  title: string;
  order: number;
  materials: MaterialInfo[];
  assignments: AssignmentInfo[];
  attendance?: AttendanceInfo | null;
}
interface ClassDetails {
  id: number;
  name: string;
  isEnrolled: boolean;
  teacherId: number;
  topics: TopicInfo[];
}

export default function ClassDetailPage() {
  const params = useParams();
  const { id } = params;
  const { user } = useAuth();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  
  const [classData, setClassData] = useState<ClassDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openTopics, setOpenTopics] = useState<Record<number, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [isEditTopicModalOpen, setIsEditTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TopicInfo | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  const toggleTopic = (topicId: number) => {
    setOpenTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const fetchData = useCallback(async () => {
    if (id) {
      setError(null);
      try {
        const response = await apiClient.get(`/classes/${id}`);
        setClassData(response.data);
      } catch (err) {
        setError('Gagal memuat data kelas.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenActivityModal = (topicId: number) => {
    setSelectedTopicId(topicId);
    setIsActivityModalOpen(true);
  };

  const handleDeleteTopic = async (topicId: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus topik ini? Semua materi dan tugas di dalamnya akan ikut terhapus.')) {
      try {
        await apiClient.delete(`/topics/${topicId}`);
        fetchData();
      } catch (error) {
        console.error("Gagal menghapus topik:", error);
        alert('Gagal menghapus topik.');
      }
    }
  };

  const handleOpenEditModal = (topic: TopicInfo) => {
    setEditingTopic(topic);
    setIsEditTopicModalOpen(true);
  };

  const handleMarkAttendance = async (attendanceId: number) => {
    try {
      const response = await apiClient.post(`/attendance/${attendanceId}/record`);
      alert(response.data.message || 'Kehadiran berhasil dicatat!');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal mencatat kehadiran.');
      console.error(error);
    }
  };

  const isTeacher = user?.role === 'guru' && user?.id === classData?.teacherId;

  if (isLoading) return <div className="p-8 text-center">Memuat...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!classData) return <div className="p-8 text-center">Kelas tidak ditemukan.</div>;


  return (
    <>
    
      {/* --- Semua modal (tidak ada perubahan) --- */}
      <AddTopicModal isOpen={isTopicModalOpen} onClose={() => setIsTopicModalOpen(false)} classId={classData.id} nextOrder={classData.topics?.length + 1 || 1} onTopicCreated={fetchData} />
      <AddActivityModal 
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onSelectMaterial={() => { setIsActivityModalOpen(false); setIsMaterialModalOpen(true); }}
        onSelectAssignment={() => { setIsActivityModalOpen(false); setIsAssignmentModalOpen(true); }}
        onSelectAttendance={() => { setIsActivityModalOpen(false); setIsAttendanceModalOpen(true); }}
      />
      <AddMaterialModal isOpen={isMaterialModalOpen} onClose={() => setIsMaterialModalOpen(false)} topicId={selectedTopicId} onMaterialAdded={fetchData} />
      <EditTopicModal isOpen={isEditTopicModalOpen} onClose={() => setIsEditTopicModalOpen(false)} topic={editingTopic} onTopicUpdated={fetchData} />
      <AddAssignmentModal isOpen={isAssignmentModalOpen} onClose={() => setIsAssignmentModalOpen(false)} topicId={selectedTopicId} onAssignmentAdded={fetchData} />
      <AddAttendanceModal isOpen={isAttendanceModalOpen} onClose={() => setIsAttendanceModalOpen(false)} topicId={selectedTopicId} onAttendanceAdded={fetchData} />

      {/* --- Tampilan Halaman --- */}
      <div className="space-y-6  ">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800">{classData.name}</h1>
          {isTeacher && (
            <button onClick={() => setIsEditing(!isEditing)} className={`px-4 py-2 rounded-lg text-white font-semibold transition-colors ${isEditing ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
              {isEditing ? 'Matikan Mode Edit' : 'Hidupkan Mode Edit'}
            </button>
          )}
        </div>

        <div className="space-y-4 ">
          {classData.topics?.map((topic) => (
            <div key={topic.id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center">
                <button onClick={() => toggleTopic(topic.id)} className="flex-grow flex items-center  text-gray-800 text-left">
                  <span className="font-semibold text-xl">{topic.title}</span>
                  {openTopics[topic.id] ? <FaChevronDown className="ml-4" /> : <FaChevronRight className="ml-4" />}
                </button>
                {isEditing && (
                  <div className="flex gap-3">
                    <button onClick={() => handleOpenEditModal(topic)} className="text-gray-500 hover:text-blue-600"><FaPencilAlt /></button>
                    <button onClick={() => handleDeleteTopic(topic.id)} className="text-gray-500 hover:text-red-600"><FaTrash /></button>
                  </div>
                )}
              </div>
              
              {openTopics[topic.id] && (
                <div className="pt-4 pl-6 pr-2 space-y-3 border-t mt-3">
                  
                  {/* --- PERUBAHAN 3: Logika untuk Menampilkan Berbagai Jenis Materi --- */}
                  {topic.materials?.map((material) => (
                    <div key={material.id} className="p-3 bg-slate-50 border rounded-md hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-3 text-gray-700 font-semibold">
                        {/* Ikon berubah tergantung jenis materi */}
                        {material.fileUrl && <FaFilePdf className="text-red-500" />}
                        {material.youtubeUrl && <FaYoutube className="text-red-600" />}
                        <span>{material.title}</span>
                      </div>
                      
                      {/* Tampilkan link download jika ada fileUrl */}
                      {material.fileUrl && (
                        <a href={`${backendUrl}${material.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-1 block">
                          Download Materi
                        </a>
                      )}

                      {/* Tampilkan video HANYA jika link YouTube ada */}
                      {material.youtubeUrl && (
                        <div className="mt-4">
                          <YouTubeEmbed url={material.youtubeUrl} />
                        </div>
                      )}
                    </div>
                  ))}
                  {/* --- BATAS PERUBAHAN --- */}


                  {/* Setiap tugas dibungkus box sendiri */}
                  {topic.assignments?.map((assignment) => (
                    <div key={assignment.id} className="flex justify-between items-center p-3 bg-slate-50 border rounded-md hover:bg-slate-100 transition-colors">
                      <Link href={`/tugas/${assignment.id}`} className="flex items-center gap-3 text-gray-700 font-semibold">
                        <FaClipboardList className="text-green-500" />
                        <span>{assignment.title}</span>
                      </Link>
                    </div>
                  ))}
                  
                  {/* Setiap absensi dibungkus box sendiri */}
                  {topic.attendance && (
                    <div className="flex justify-between items-center p-3 bg-slate-50 border rounded-md hover:bg-slate-100 transition-colors">
                      {user?.role === 'guru' ? (
                        <Link href={`/absensi/${topic.attendance.id}`} className="flex items-center gap-3 font-semibold text-gray-800">
                          <FaCalendarCheck className="text-indigo-500" />
                          <span>{topic.attendance.title}</span>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-3 font-semibold text-gray-800">
                          <FaCalendarCheck className="text-indigo-500" />
                          <span>{topic.attendance.title}</span>
                        </div>
                      )}
                      {user?.role === 'siswa' && (
                        <button 
                          onClick={() => handleMarkAttendance(topic.attendance!.id)}
                          className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700"
                        >
                          Tandai Kehadiran
                        </button>
                      )}
                    </div>
                  )}

                  {/* Tombol tambah aktivitas untuk guru */}
                  {isEditing && (
                    <div className="mt-4 pt-4 border-t border-dashed">
                      <button onClick={() => handleOpenActivityModal(topic.id)} className="text-blue-600 font-semibold hover:text-blue-800">
                        + Tambah Aktivitas atau Sumber Daya
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {isEditing && (
            <div className="flex justify-center mt-6">
              <button onClick={() => setIsTopicModalOpen(true)} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700">
                + Tambah Topik Baru
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}