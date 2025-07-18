'use client';

import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

export default function HomePage() {
  const [searchText, setSearchText] = useState('');
  const [expandedClass, setExpandedClass] = useState<number | null>(null); // 7, 8, 9

  const [active, setActive] = useState(false);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Cari:', searchText);
  };

  // Data mapel tiap kelas
  const subjectsByClass = {
    7: ['Matematika', 'IPA', 'IPS', 'Bahasa Indonesia'],
    8: ['Fisika', 'PKN', 'Biologi', 'Bahasa Inggris'],
    9: ['Kimia', 'Ekonomi', 'Seni Budaya', 'PJOK'],
  };

  const toggleClass = (grade: number) => {
    setExpandedClass((prev) => (prev === grade ? null : grade));
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        Sistem Pembelajaran dalam Jaringan
      </h1>

      <div className="bg-white p-10 rounded-lg shadow-md">
        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="mb-8 flex items-center max-w-lg">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search courses"
            className="w-full px-4 py-1 border text-gray-600 border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 border border-blue-600 rounded-r-md hover:bg-blue-700"
            aria-label="Search"
          >
            <FaSearch />
          </button>
        </form>

        {/* Course Categories */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Kategori Kelas</h2>
          {active && ( 
          <ul className="space-y-2 list-none ml-4">
            {[7, 8, 9].map((grade) => (
              <li key={grade}>
                <button
                  onClick={() => toggleClass(grade)}
                  className="flex items-center text-blue-600 font-medium focus:outline-none"
                >
                  {/* start */}
                  {expandedClass === grade ? <FaChevronDown className="mr-2" /> : <FaChevronRight className="mr-2" />}
                  Kelas {['VII', 'VIII', 'IX'][grade - 7]}
                  {/* finish */}
                </button>

{/* start */}
                {expandedClass === grade && (
                  <ul className="ml-6 mt-1 space-y-1">
                    {subjectsByClass[grade as 7 | 8 | 9].map((subject, index) => (
                      <li key={index} className="text-gray-700">{subject}</li>
                    ))}
                  </ul>
                )}
                {/* finish */}
              </li>
            ))}
          </ul>
          )}
        </div>
      </div>
    </div>
  );
}
