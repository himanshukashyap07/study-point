"use client";

import { useState } from "react";
import { Layers, PlusCircle, Video, Trophy } from "lucide-react";
import CurriculumManager from "./components/CurriculumManager";
import CourseManager from "./components/CourseManager";
import VideoManager from "./components/VideoManager";
import AdminResults from "./results/page";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'course' | 'video' | 'results'>('curriculum');

  return (
    <div className="w-full h-full text-black">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center px-4">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm md:text-lg max-w-2xl mx-auto font-medium">Streamline your educational content. Manage curriculum structure, courses, and student achievements from one place.</p>
        </header>

        <div className="flex justify-start md:justify-center mb-12 px-4 overflow-x-auto no-scrollbar">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/5 border border-white p-1.5 flex gap-2 min-w-max ring-1 ring-black/5">
            <TabButton 
              active={activeTab === 'curriculum'} 
              onClick={() => setActiveTab('curriculum')}
              icon={<Layers size={18} />}
              label="Curriculum Tree"
            />
            <TabButton 
              active={activeTab === 'course'} 
              onClick={() => setActiveTab('course')}
              icon={<PlusCircle size={18} />}
              label="Create Course"
            />
            <TabButton 
              active={activeTab === 'video'} 
              onClick={() => setActiveTab('video')}
              icon={<Video size={18} />}
              label="Add Video"
            />
            <TabButton 
              active={activeTab === 'results'} 
              onClick={() => setActiveTab('results')}
              icon={<Trophy size={18} />}
              label="Results"
              activeColor="bg-purple-600"
            />
          </div>
        </div>

        <div className="transition-all duration-500 ease-in-out">
          {activeTab === 'curriculum' && <CurriculumManager />}
          {activeTab === 'course' && <CourseManager />}
          {activeTab === 'video' && <VideoManager />}
          {activeTab === 'results' && <AdminResults />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, activeColor = "bg-blue-600" }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, activeColor?: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 md:px-7 py-3 rounded-xl text-xs md:text-sm font-black transition-all flex items-center gap-2.5 whitespace-nowrap active:scale-95 ${
        active 
          ? `${activeColor} text-white shadow-lg shadow-blue-500/25` 
          : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm'
      }`}
    >
      <span className={active ? 'animate-pulse' : ''}>{icon}</span>
      {label}
    </button>
  );
}
