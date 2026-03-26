"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import CommentSection from "@/components/CommentSection";
import axios from "axios";

function PlayVideoContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const videoId = searchParams.get("videoId");
  const router = useRouter();
  
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideo() {
      try {
        const res = await axios.get(`/api/courses/${id}/videos`);
        if(res.data.success) {
          const vids = res.data.data;
          const targetVid = vids.find((v: any) => v._id === videoId);
          if (targetVid) setVideo(targetVid);
          else if(vids.length > 0) setVideo(vids[0]);
        }
      } catch (e) {
        console.error("Error fetching video metadata", e);
      } finally {
        setLoading(false);
      }
    }
    fetchVideo();
  }, [id, videoId]);

  if (loading) {
     return <div className="min-h-screen pt-24 pb-12 flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600" /></div>;
  }

  if (!video) {
    return <div className="min-h-screen flex items-center justify-center pt-24 text-center font-bold text-gray-500 text-xl">Video not found.</div>;
  }

  const match = video.videoUrl?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
  const ytId = match ? match[1] : null;

  return (
    <div className="pt-24 pb-12 bg-gray-50 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1">
        
        {/* Part 1: Video Player (Left Split) */}
        <div className="w-full lg:flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden h-fit transition-all duration-300">
          <div className="w-full aspect-video bg-gray-900 relative">
             {ytId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}?modestbranding=1&rel=0&showinfo=0&autoplay=1`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="w-full h-full absolute inset-0 border-0"
                ></iframe>
             ) : (
                <video controls controlsList="nodownload" autoPlay className="w-full h-full outline-none object-contain bg-gray-900">
                  <source src={video.videoUrl} type="video/mp4" />
                </video>
             )}
          </div>
          <div className="p-6 md:p-8 lg:p-10 bg-white">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">{video.title}</h1>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-3xl">{video.description}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
              {video.duration && <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border border-blue-200">⏱ {video.duration} mins</span>}
              <button onClick={() => router.push(`/courses/${id}`)} className="text-gray-500 text-sm font-bold bg-transparent border border-gray-200 px-5 py-2 rounded-full hover:text-gray-900 hover:bg-gray-50 hover:scale-105 transition-all flex items-center gap-2">
                <span>←</span> Back to Course
              </button>
            </div>
          </div>
        </div>

        {/* Part 2: Comments (Right Split) */}
        <div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden shrink-0" style={{ maxHeight: '800px' }}>
           <div className="bg-blue-50 p-6 border-b border-blue-100 flex flex-col shrink-0">
             <h2 className="font-extrabold text-xl text-blue-900 flex items-center gap-3">
               <span className="text-2xl drop-shadow-sm">💬</span> Class Discussions
             </h2>
             <p className="text-xs text-blue-600 mt-1 font-semibold">Join the conversation with other students</p>
           </div>
           <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-white">
              <CommentSection videoId={video._id} />
           </div>
        </div>

      </div>
    </div>
  );
}

export default function PlayVideoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 pb-12 flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600" /></div>}>
        <PlayVideoContent />
    </Suspense>
  )
}
