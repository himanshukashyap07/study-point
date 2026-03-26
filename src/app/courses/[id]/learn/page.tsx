"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import CommentSection from "@/components/CommentSection";
import axios from "axios";

export default function CourseLearnPage() {
  const { id } = useParams();
  const router = useRouter();
  const [videos, setVideos] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await axios.get(`/api/courses/${id}/videos`);
        console.log(res);

        const data = res.data;

        if (data.success) {
          setVideos(data.data);
          // Set the first available video as active
          if (data.data.length > 0) {
            setActiveVideo(data.data[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchVideos();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-[var(--background)] flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">📭</div>
        <h2 className="text-3xl font-extrabold text-[var(--foreground)] mb-4">No content available</h2>
        <p className="text-[var(--muted-foreground)] mb-8">This course doesn't have any videos uploaded yet. Check back soon!</p>
        <button onClick={() => router.push(`/courses/${id}`)} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const handleVideoSelect = (video: any) => {
    // If videoUrl is undefined, it means the user lacks access (handled by our backend)
    if (!video.videoUrl) {
      alert("This video is locked. Please purchase the course to unlock full access.");
      router.push(`/courses/${id}`);
      return;
    }
    setActiveVideo(video);
  };

  return (
    <div className="pt-24 pb-12 bg-[var(--background)] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 flex flex-col lg:flex-row gap-8">

        {/* Left Col - Video Player & Details */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative border border-[var(--border)]">
            {activeVideo?.videoUrl ? (
              (() => {
                const match = activeVideo.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
                const ytId = match ? match[1] : null;

                if (ytId) {
                  return (
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?modestbranding=1&rel=0&showinfo=0&autoplay=1`}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full absolute inset-0 border-0"
                    ></iframe>
                  );
                } else {
                  return (
                    <video controls controlsList="nodownload" autoPlay key={activeVideo.videoUrl} onContextMenu={(e) => e.preventDefault()} className="w-full h-full object-contain bg-black absolute inset-0 outline-none">
                      <source src={activeVideo.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  );
                }
              })()
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-gray-900 to-black text-white absolute inset-0">
                <span className="text-6xl text-gray-600 mb-4">🔒</span>
                <h3 className="text-2xl font-bold mb-2">Content Locked</h3>
                <p className="text-gray-400">Please enroll in this course to get access to this premium content.</p>
              </div>
            )}
          </div>

          <div className="bg-[var(--background)] border border-[var(--border)] rounded-3xl p-6 shadow-sm">
            <h1 className="text-3xl font-extrabold text-[var(--foreground)] mb-2">{activeVideo?.title || "Course Introduction"}</h1>
            <p className="text-[var(--muted-foreground)] mb-4">{activeVideo?.description || "Watch this module to learn the core concepts."}</p>

            <div className="flex items-center gap-4 text-sm font-semibold text-[var(--muted-foreground)]">
              {activeVideo?.duration && <span className="flex items-center gap-1 bg-[var(--muted)]/50 px-3 py-1 rounded-full">⏱ {activeVideo.duration} mins</span>}
              {activeVideo?.isFree && <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200">🆓 Free Preview</span>}
            </div>

            {/* Attached Resources */}
            {activeVideo?.resources && activeVideo.resources.length > 0 && (
              <div className="mt-8 pt-6 border-t border-[var(--border)]">
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2"><span>📎</span> Attached Resources</h3>
                <div className="flex flex-col gap-2">
                  {activeVideo.resources.map((res: string, idx: number) => {
                    const isFree = activeVideo.isFree;
                    if (isFree) {
                      return (
                        <a key={idx} href={res} target="_blank" rel="noopener noreferrer" download className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)]/30 hover:border-blue-500/50 transition-all group">
                          <span className="flex items-center gap-3 font-medium text-[var(--foreground)]"><span className="text-2xl">📄</span> Resource Link {idx + 1} (Free)</span>
                          <span className="text-green-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Download ↓</span>
                        </a>
                      );
                    } else {
                      return (
                        <a key={idx} href={`/resource?url=${encodeURIComponent(res)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)]/30 hover:border-blue-500/50 transition-all group">
                          <span className="flex items-center gap-3 font-medium text-[var(--foreground)]"><span className="text-2xl">📄</span> Resource Link {idx + 1} (Premium)</span>
                          <span className="text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">View Only 👁️</span>
                        </a>
                      );
                    }
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Comment Section below video details */}
          {activeVideo && (
            <div className="bg-[var(--background)] border border-[var(--border)] rounded-3xl p-6 shadow-sm">
              <CommentSection videoId={activeVideo._id} />
            </div>
          )}

        </div>

        {/* Right Col - Sidebar Playlist */}
        <div className="w-full lg:w-1/3 flex flex-col h-[800px]">
          <div className="bg-[var(--background)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-xl flex flex-col h-full">
            <div className="p-6 border-b border-[var(--border)] bg-[var(--muted)]/20">
              <h2 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight">Course Modules</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">{videos.length} Lectures</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {videos.map((video, idx) => {
                const isActive = activeVideo?._id === video._id;
                const isLocked = !video.videoUrl && !video.isFree;

                return (
                  <button
                    key={video._id}
                    onClick={() => handleVideoSelect(video)}
                    className={`w-full text-left p-4 rounded-2xl flex items-start gap-4 transition-all duration-300 ${isActive
                        ? "bg-blue-600 border-transparent shadow-lg shadow-blue-500/20 transform scale-[1.02]"
                        : "bg-[var(--background)] hover:bg-[var(--muted)] border border-[var(--border)] hover:border-gray-300"
                      }`}
                  >
                    <div className={`mt-1 font-black text-sm w-6 h-6 flex items-center justify-center shrink-0 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}>
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-sm leading-tight mb-1 truncate ${isActive ? 'text-white' : 'text-[var(--foreground)]'}`}>
                        {video.title}
                      </h4>
                      <div className={`text-xs font-semibold flex items-center gap-3 ${isActive ? 'text-blue-100' : 'text-[var(--muted-foreground)]'}`}>
                        <span className="flex items-center gap-1">⏱ {video.duration}m</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center justify-center text-xl pl-2">
                      {isLocked ? (
                        <span title="Locked" className={isActive ? 'text-blue-200' : 'text-gray-400'}>🔒</span>
                      ) : isActive ? (
                        <span className="text-white animate-pulse">▶</span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
