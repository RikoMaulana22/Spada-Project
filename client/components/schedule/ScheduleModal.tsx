'use client';

interface Schedule {
    id: number;
    startTime: string;
    endTime: string;
    subject: { name: string };
    class: { name: string };
    teacher: { fullName: string };
}

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    scheduleData: Record<string, Schedule[]> | null;
}

const daysOrder = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"];

export default function ScheduleModal({ isOpen, onClose, scheduleData }: ScheduleModalProps) {
    if (!isOpen|| !scheduleData) {
    return null;
}

    // Urutkan hari sesuai dengan `daysOrder`
    const sortedDays = Object.keys(scheduleData).sort((a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b));

    return (
        <div className="fixed inset-0  bg-opacity-60  text-gray-800 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Jadwal Pelajaran</h2>
                    <button onClick={onClose} className="text-2xl">&times;</button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                    {sortedDays.length > 0 ? sortedDays.map(day => (
                        <div key={day}>
                            <h3 className="text-xl font-semibold capitalize mb-2 border-b pb-1">{day.toLowerCase()}</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Jam</th>
                                            <th className="px-4 py-2 text-left">Mata Pelajaran</th>
                                            <th className="px-4 py-2 text-left">Kelas</th>
                                            <th className="px-4 py-2 text-left">Guru</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scheduleData[day].map((schedule: Schedule) => (
                                            <tr key={schedule.id} className="border-b">
                                                <td className="px-4 py-2 font-mono">{schedule.startTime} - {schedule.endTime}</td>
                                                <td className="px-4 py-2 font-medium">{schedule.subject.name}</td>
                                                <td className="px-4 py-2">{schedule.class.name}</td>
                                                <td className="px-4 py-2">{schedule.teacher.fullName}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )) : <p>Jadwal belum tersedia.</p>}
                </div>
            </div>
        </div>
    );
}