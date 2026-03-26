"use client";

import { useState } from "react";
import CurriculumManager from "./components/CurriculumManager";
import CourseManager from "./components/CourseManager";
import VideoManager from "./components/VideoManager";
import AdminResults from "./results/page";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'course' | 'video' | 'results'>('curriculum');

  return (
    <div className="w-full h-full text-black">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-gray-500">Manage curriculum structure, courses, and educational content.</p>
        </header>

        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 flex gap-2">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'curriculum' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              📚 Curriculum Tree
            </button>
            <button
              onClick={() => setActiveTab('course')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'course' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              🎓 Create Course
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'video' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              🎥 Add Video
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'results' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              🏆 Results
            </button>
          </div>
        </div>

        <div className="transition-all">
          {activeTab === 'curriculum' && <CurriculumManager />}
          {activeTab === 'course' && <CourseManager />}
          {activeTab === 'video' && <VideoManager />}
          {activeTab === 'results' && <AdminResults />}
        </div>
      </div>
    </div>
  );
}
