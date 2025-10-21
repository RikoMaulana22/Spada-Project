"use client";
import { useRouter } from 'next/navigation';

interface QuestionResult {
  isCorrect: boolean | null;
}

interface QuizNavigationProps {
  results: QuestionResult[];
}

export default function QuizNavigation({ results }: QuizNavigationProps) {
  const router = useRouter();
  const handleFinishReview = () => {
    router.push('/dashboard'); // Arahkan ke halaman dashboard
  };

  return (
    <div className="w-full md:w-48 flex-shrink-0">
      <div className="bg-white p-4 rounded-lg shadow-md border sticky top-28">
        <h3 className="font-semibold mb-3 text-gray-800">Quiz Navigation</h3>
        <div className="grid grid-cols-5 gap-2">
          {results.map((result, index) => (
            <a
              key={index}
              className={`h-8 w-8 flex items-center justify-center rounded text-white font-bold ${result.isCorrect ? 'bg-green-500' : 'bg-red-500'
                }`}
            >
              {index + 1}
            </a>
          ))}
        </div>
        <button onClick={handleFinishReview}
          className="text-blue-600 hover:underline mt-4 text-sm">
          Finish review
        </button>
      </div>
    </div>
  );
}