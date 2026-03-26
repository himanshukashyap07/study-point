"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, Star, BookOpen } from "lucide-react";

export default function Home() {
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [currentHeroIdx, setCurrentHeroIdx] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [topRankers, setTopRankers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch hero images
        const imgRes = await axios.get("/api/ImageSection");

        if (imgRes.data.success && Array.isArray(imgRes.data.data)) {
          // Find the category "home" or just use the first one if not explicit
          const homeSection = imgRes.data.data.find((sec: any) => sec.category?.toLowerCase() === "home" || sec.title?.toLowerCase() === "home");
          if (homeSection && homeSection.imageUrl?.length > 0) {
            setHeroImages(homeSection.imageUrl);
          } else if (imgRes.data.data.length > 0 && imgRes.data.data[0].imageUrl) {
            setHeroImages(imgRes.data.data[0].imageUrl);
          } else {
            // Default placeholder
            setHeroImages(["https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"]);
          }
        }

        console.log(imgRes.data)


        // Fetch course categories from curriculum
        const currRes = await axios.get("/api/curriculum");
        if (currRes.data.success && currRes.data.data) {
          setCategories(Object.keys(currRes.data.data));
        }

        // Fetch top rankers
        const rankRes = await axios.get("/api/StudentResult");
        if (rankRes.data.success) {
          setTopRankers(rankRes.data.data);
        }

        // Fetch testimonials (mock or real API)
        const testRes = await axios.get("/api/Testimonials").catch(() => null);
        if (testRes?.data?.success) {
          setTestimonials(Array.isArray(testRes.data.data) ? testRes.data.data : []);
        } else {
          setTestimonials([
            { _id: "1", name: "Ankit Sharma", text: "Study Point helped me crack my dream university entrance!", rating: 5 },
            { _id: "2", name: "Priya Singh", text: "The instructors are amazing and the content is top-notch.", rating: 5 },
            { _id: "3", name: "Rahul Verma", text: "Best platform for interactive learning.", rating: 4 },
          ]);
        }
      } catch (error) {
        console.error("Failed to load home data", error);
      }
    }
    fetchData();
  }, []);

  // Auto-slide hero images
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIdx((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages]);

  const nextHero = () => setCurrentHeroIdx((prev) => (prev + 1) % heroImages.length);
  const prevHero = () => setCurrentHeroIdx((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Dynamic Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] w-full bg-gray-900 overflow-hidden flex items-center justify-center">
        {heroImages.length > 0 ? (
          <>
            {heroImages.map((img, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentHeroIdx ? 'opacity-100 z-0' : 'opacity-0 -z-10'}`}
              >
                {/* Using img instead of Next.js Image to support dynamic user-uploaded URLs */}
                <img src={img} alt={`Hero ${idx}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/60 to-transparent" />
              </div>
            ))}

            {/* Swiper Controls */}
            {heroImages.length > 1 && (
              <>
                <button onClick={prevHero} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition">
                  <ChevronLeft size={32} />
                </button>
                <button onClick={nextHero} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition">
                  <ChevronRight size={32} />
                </button>
                {/* Dots */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {heroImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentHeroIdx(idx)}
                      className={`w-3 h-3 rounded-full transition-all ${idx === currentHeroIdx ? 'bg-blue-500 scale-125' : 'bg-white/50 hover:bg-white/80'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gray-900 animate-pulse" />
        )}

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 w-full">
          <div className="max-w-2xl animate-fade-in-up">
            <span className="inline-flex items-center px-3 py-1 text-sm font-bold text-blue-400 bg-blue-500/10 rounded-full mb-6 border border-blue-500/20 backdrop-blur-md">
              ✨ The future of learning is here
            </span>
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl mb-6 leading-tight drop-shadow-lg">
              Unlock Your <br />
              <span className="text-blue-400">True Potential</span>
            </h1>
            <p className="mt-4 text-xl text-gray-300 mb-10 max-w-xl drop-shadow">
              Study Point offers world-class education with industry experts, dynamic coursework, and a community dedicated to your success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/courses" className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold shadow-xl hover:bg-blue-500 hover:-translate-y-1 transition text-center">
                Explore Courses
              </Link>
              <Link href="/about" className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold hover:bg-white/20 transition text-center">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Course Categories */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-blue-600 font-bold tracking-widest uppercase text-sm mb-3">Programs</h2>
            <p className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Explore Our Categories</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.length > 0 ? categories.map((cat, idx) => (
              <Link key={idx} href={`/courses?category=${encodeURIComponent(cat)}`} className="bg-white p-8 rounded-3xl shadow-sm border hover:border-blue-500 hover:shadow-xl transition group text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                  <BookOpen size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{cat}</h3>
              </Link>
            )) : (
              // Fallback skeleton
              [1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white p-8 rounded-3xl border shadow-sm flex flex-col items-center animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded-2xl mb-6"></div>
                  <div className="h-6 bg-gray-200 w-24 rounded"></div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Top Rankers Section */}
      <section className="py-24 bg-white border-y">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-purple-600 font-bold tracking-widest uppercase text-sm mb-3">Hall of Fame</h2>
            <p className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Our Top Rankers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {topRankers.length > 0 ? topRankers.map((ranker, idx) => (
              <div key={idx} className="bg-purple-50 p-6 rounded-3xl border border-purple-100 hover:-translate-y-2 transition shadow-sm text-center relative overflow-hidden group">
                {idx === 0 && <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-bl-xl shadow-sm">Overachiever</div>}
                <div className="w-24 h-24 mx-auto bg-white rounded-full overflow-hidden border-4 border-purple-200 mb-4 shadow-md group-hover:border-purple-400 transition">
                  <img src={ranker.imageUrl || ranker.student?.avatar || "/guest.png"} alt={ranker.student?.username || "Student"} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 truncate">{ranker.student?.username || "Student"}</h3>
                <p className="text-sm font-bold text-purple-600 mt-1">{ranker.course?.title || "Course"} • {ranker.year}</p>
                <div className="mt-4 flex flex-col gap-1 items-center justify-center bg-white py-2 rounded-xl text-sm">
                  <span className="text-gray-500 font-semibold text-xs">Total Score</span>
                  <span className="font-black text-gray-900 text-xl">{ranker.totalScore}</span>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center text-gray-500 py-10 font-medium">No results declared yet. Stay tuned!</div>
            )}
          </div>
          {topRankers.length > 0 && (
            <div className="text-center mt-10">
              <Link href="/StudentResult" className="text-purple-600 font-bold hover:underline">View All Results →</Link>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials (Auto-scroll X-axis) */}
      <section className="py-24 bg-gray-900 overflow-hidden relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-16 relative z-10 text-center">
          <h2 className="text-blue-400 font-bold tracking-widest uppercase text-sm mb-3">Testimonials</h2>
          <p className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">What Our Students Say</p>
        </div>

        {/* Infinite scroll track */}
        <div className="relative w-full flex overflow-x-hidden group">
          <div className="flex animate-scroll whitespace-nowrap gap-6 px-6">
            {/* Duplicate items for infinite effect */}
            {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="bg-gray-800 border border-gray-700 p-8 rounded-3xl shadow-xl w-80 shrink-0 inline-flex flex-col whitespace-normal">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(t.rating || 5)].map((_, idx) => <Star key={idx} size={16} fill="currentColor" />)}
                </div>
                {/* API uses 'testimonial' field, fallback to 'text' for mock data */}
                <p className="text-gray-300 italic mb-6 flex-1">&quot;{t.testimonial || t.text}&quot;</p>
                <div className="flex items-center gap-3 mt-auto border-t border-gray-700 pt-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white shadow-inner">
                    {t.name?.charAt(0) || "S"}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">Verified Student</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global CSS for scroll animation if not in tailwind.config */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-300px * ${testimonials.length} - 1.5rem * ${testimonials.length})); }
          }
          .animate-scroll {
            animation: scroll 30s linear infinite;
          }
          .group:hover .animate-scroll {
            animation-play-state: paused;
          }
        `}} />
      </section>

    </div>
  );
}
