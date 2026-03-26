"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import Script from "next/script";

// Helper to extract YouTube ID
function getYouTubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
  return match ? match[1] : null;
}

export default function Courses() {
  return (
    <Suspense fallback={<div className="pt-24 pb-12 bg-gray-50 min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div></div>}>
      <CoursesInner />
    </Suspense>
  );
}

function CoursesInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Drill-down states — initialise category from URL if present
  const [category, setCategory] = useState<string | null>(searchParams.get("category"));
  const [board, setBoard] = useState<string | null>(null);
  const [medium, setMedium] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [playingVideo, setPlayingVideo] = useState<any | null>(null);

  const [videos, setVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get("/api/users/me");
        if (res.data.success) {
          setEnrolledCourses(res.data.enrolledCourses || []);
        }
      } catch (e) {
        // Not logged in or error
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await axios.get("/api/courses");
        if (res.data.success) {
          setCourses(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  useEffect(() => {
    async function fetchVideos() {
      if (!selectedCourse) return;
      setLoadingVideos(true);
      try {
        // Assume API supports filtering by courseId or we just fetch all and filter client-side
        const res = await axios.get(`/api/videos?courseId=${selectedCourse._id}`);
        if (res.data.success) {
          // If the API returns all because courseId filter isn't implemented strictly, filter it:
          const courseVids = res.data.data.filter((v: any) => v.courseId === selectedCourse._id);
          setVideos(courseVids);
        }
      } catch (e) {
        console.error("Failed to fetch videos", e);
      } finally {
        setLoadingVideos(false);
      }
    }
    fetchVideos();
  }, [selectedCourse]);

  // Derived lists for each stage
  const categories = Array.from(new Set(courses.map(c => c.category)));
  const boardsForCategory = Array.from(new Set(courses.filter(c => c.category === category).map(c => c.board)));
  const mediumsForBoard = Array.from(new Set(courses.filter(c => c.category === category && c.board === board).map(c => c.medium)));
  const coursesForMedium = courses.filter(c => c.category === category && c.board === board && c.medium === medium);

  const resetToCategory = () => { setBoard(null); setMedium(null); setSelectedCourse(null); };
  const resetToBoard = () => { setMedium(null); setSelectedCourse(null); };
  const resetToMedium = () => { setSelectedCourse(null); };

  const handlePlayVideo = (video: any) => {
    if (!selectedCourse) return;
    const isFree = selectedCourse.isFree || video.isFree;
    const isEnrolled = enrolledCourses?.includes(selectedCourse._id);
    if (isFree || isEnrolled) {
      router.push(`/courses/${selectedCourse._id}/playvideo?videoId=${video._id}`);
    } else {
      toast.error("Please buy the course to access this video!");
    }
  };

  const handleBuyCourse = async () => {
    if (!selectedCourse) return;
    try {
      const initRes = await axios.post("/api/paytm/initiate", { courseId: selectedCourse._id });
      if (!initRes.data.success) {
        return toast.error(initRes.data.message || "Failed to initiate payment");
      }
      
      const { txnToken, orderId, amount } = initRes.data.data || initRes.data;
      
      // MOCK FALLBACK for local dev without keys
      if (txnToken.includes("MOCK_TOKEN")) {
        const verifyRes = await axios.post("/api/paytm/verify", {
          courseId: selectedCourse._id,
          isMock: true
        });
        if (verifyRes.data.success) {
          toast.success("Mock Payment Successful! Course Unlocked.");
          setEnrolledCourses(prev => [...prev, selectedCourse._id]);
        }
        return;
      }

      // REAL PAYTM FLOW
      const config = {
        root: "",
        flow: "WEBSTAGING",
        data: {
          orderId: orderId,
          token: txnToken,
          tokenType: "TXN_TOKEN",
          amount: amount
        },
        handler: {
          notifyMerchant: function (eventName: string, data: any) {
            console.log("notifyEvent", eventName, data);
          },
          transactionStatus: function (data: any) {
            axios.post("/api/paytm/verify", {
              courseId: selectedCourse._id,
              paytmResponse: data
            }).then(res => {
              if (res.data.success) {
                toast.success("Payment Verified & Course Unlocked!");
                setEnrolledCourses(prev => [...prev, selectedCourse._id]);
              } else {
                toast.error("Payment Verification Failed");
              }
            }).catch(() => toast.error("Error verifying payment"));

            (window as any).Paytm.CheckoutJS.close();
          }
        }
      };

      if ((window as any).Paytm && (window as any).Paytm.CheckoutJS) {
        (window as any).Paytm.CheckoutJS.init(config).then(function onSuccess() {
          (window as any).Paytm.CheckoutJS.invoke();
        }).catch(function onError(error: any) {
          toast.error("Error loading Paytm UI");
        });
      } else {
        toast.error("Paytm SDK not loaded");
      }

    } catch (e: any) {
      console.log(e);

      toast.error(e.message || "Payment initiation failed. Are you logged in?");
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-12 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen text-black">
      <Script type="application/javascript" src={`https://securegw-stage.paytm.in/merchantpgpui/checkoutjs/merchants/${process.env.NEXT_PUBLIC_PAYTM_MID || "TEST"}.js`} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-10 text-center animate-fade-in-up">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">
            Course Directory
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Navigate through our structured educational content to find exactly what you need.
          </p>
        </div>

        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 mb-8 text-sm font-bold border-b pb-4">
          <button onClick={() => { setCategory(null); resetToCategory(); }} className={`${!category ? 'text-blue-600' : 'text-gray-400 hover:text-gray-700'}`}>All Categories</button>

          {category && (
            <>
              <span className="text-gray-300">/</span>
              <button onClick={resetToCategory} className={`${!board ? 'text-blue-600' : 'text-gray-400 hover:text-gray-700'}`}>{category}</button>
            </>
          )}

          {board && (
            <>
              <span className="text-gray-300">/</span>
              <button onClick={resetToBoard} className={`${!medium ? 'text-blue-600' : 'text-gray-400 hover:text-gray-700'}`}>{board}</button>
            </>
          )}

          {medium && (
            <>
              <span className="text-gray-300">/</span>
              <button onClick={resetToMedium} className={`${!selectedCourse ? 'text-blue-600' : 'text-gray-400 hover:text-gray-700'}`}>{medium}</button>
            </>
          )}

          {selectedCourse && (
            <>
              <span className="text-gray-300">/</span>
              <span className="text-blue-600">{selectedCourse.title}</span>
            </>
          )}
        </div>

        {/* Level 1: Categories */}
        {!category && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Select Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((cat, idx) => (
                <button key={idx} onClick={() => setCategory(cat)} className="bg-white border rounded-2xl p-8 shadow-sm hover:shadow-lg hover:border-blue-500 transition-all text-center group">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎓</div>
                  <h3 className="text-xl font-bold text-gray-900">{cat}</h3>
                </button>
              ))}
              {categories.length === 0 && <p className="col-span-full text-gray-500 text-center py-10">No categories found.</p>}
            </div>
          </div>
        )}

        {/* Level 2: Boards */}
        {category && !board && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Select Board under {category}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {boardsForCategory.map((b, idx) => (
                <button key={idx} onClick={() => setBoard(b)} className="bg-white border rounded-2xl p-8 shadow-sm hover:shadow-lg hover:border-purple-500 transition-all text-center group">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🏛️</div>
                  <h3 className="text-xl font-bold text-gray-900">{b}</h3>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Level 3: Mediums */}
        {category && board && !medium && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Select Medium for {board}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {mediumsForBoard.map((m, idx) => (
                <button key={idx} onClick={() => setMedium(m)} className="bg-white border rounded-2xl p-8 shadow-sm hover:shadow-lg hover:border-green-500 transition-all text-center group">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🗣️</div>
                  <h3 className="text-xl font-bold text-gray-900">{m}</h3>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Level 4: Courses */}
        {category && board && medium && !selectedCourse && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Available Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coursesForMedium.map((course) => (
                <div key={course._id} onClick={() => setSelectedCourse(course)} className="bg-white rounded-3xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden flex flex-col group">
                  <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-blue-50 to-purple-50">📚</div>
                    )}
                    {course.isFree ? (
                      <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">FREE</span>
                    ) : (
                      <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">₹{course.price}</span>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <span className="text-xs font-bold text-blue-600 uppercase mb-2">{course.class} • {course.subject}</span>
                    <h3 className="text-xl font-extrabold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{course.description || "Comprehensive materials for the best learning experience."}</p>
                    <div className="pt-4 border-t flex justify-between text-xs text-gray-500 font-bold">
                      <span>🎥 {course.totalVideo || 0} Videos</span>
                      <span>⏱ {Math.round((course.totalDuration || 0) / 60)} mins</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Level 5: Course Resources (Videos & PDFs) */}
        {selectedCourse && (
          <div className="animate-fade-in-up">
            <div className="bg-white rounded-3xl p-8 border shadow-sm mb-8 flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 h-64 bg-gray-100 rounded-2xl overflow-hidden shadow-inner">
                {selectedCourse.thumbnail ? (
                  <img src={selectedCourse.thumbnail} alt="thumb" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">📚</div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex gap-2 text-xs font-bold uppercase mb-3">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{selectedCourse.board}</span>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">{selectedCourse.medium}</span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">{selectedCourse.class}</span>
                </div>
                <h1 className="text-4xl font-black text-gray-900 mb-4">{selectedCourse.title}</h1>
                <p className="text-gray-600 mb-6 leading-relaxed">{selectedCourse.description}</p>

                <div className="flex items-center gap-6">
                  {selectedCourse.isFree ? (
                    <span className="text-2xl font-black text-green-500">Free to Access</span>
                  ) : enrolledCourses?.includes(selectedCourse._id) ? (
                    <span className="text-2xl font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">✨ Course Purchased</span>
                  ) : (
                    <span className="text-3xl font-black text-blue-600">₹{selectedCourse.price}</span>
                  )}

                  {(!selectedCourse.isFree && !enrolledCourses?.includes(selectedCourse._id)) && (
                    <button onClick={handleBuyCourse} className="bg-gray-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-black transition-colors shadow-lg flex items-center gap-2">
                      💳 Buy Now
                    </button>
                  )}

                  {(selectedCourse.isFree || enrolledCourses?.includes(selectedCourse._id)) && (
                    <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="bg-gray-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-black transition-colors shadow-lg">
                      Start Learning
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Videos List */}
            <h2 className="text-3xl font-black text-gray-900 mb-6">Course Material</h2>
            {loadingVideos ? (
              <div className="py-10 text-center text-gray-500 font-bold animate-pulse">Loading resources...</div>
            ) : videos.length > 0 ? (
              <div className="space-y-4">
                {videos.map((video) => (
                  <div key={video._id} className="bg-white border rounded-2xl p-4 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-md transition">
                    <div className="w-full md:w-48 h-32 bg-gray-200 rounded-xl overflow-hidden shrink-0 relative">
                      {video.thumbnail ? (
                        <img src={video.thumbnail} alt="vidthumb" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🎥</div>
                      )}
                      {video.isFree && <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">PREVIEW</span>}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <span className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-1">Episode {video.order}</span>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{video.title}</h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">{video.description}</p>

                      <div className="flex flex-wrap items-center gap-4 mt-auto">
                        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg flex items-center gap-1">⏱ {video.duration} mins</span>

                        {/* Render attached PDF/Note resources */}
                        {video.resources?.length > 0 && video.resources.map((resUrl: string, i: number) => (
                          <a key={i} href={resUrl} target="_blank" rel="noreferrer" className="text-xs font-bold bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 flex items-center gap-1 transition">
                            📄 Resource {i + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-center p-4">
                      <button onClick={() => handlePlayVideo(video)} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm text-xl pl-1">
                        ▶
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed rounded-3xl p-12 text-center">
                <div className="text-6xl mb-4 text-gray-200">📭</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Material Yet</h3>
                <p className="text-gray-500">The instructor is still preparing the content for this course.</p>
              </div>
            )}
          </div>
        )}
      </div>



    </div>
  );
}
