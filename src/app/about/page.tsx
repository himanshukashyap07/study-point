"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

export default function About() {
  const [aboutImage, setAboutImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImage() {
      try {
        const res = await axios.get("/api/ImageSection");
        if (res.data.success && Array.isArray(res.data.data)) {
          const aboutSec = res.data.data.find((sec: any) => sec.category?.toLowerCase() === "about" || sec.title?.toLowerCase() === "about");
          if (aboutSec && aboutSec.imageUrl && aboutSec.imageUrl.length > 0) {
            setAboutImage(aboutSec.imageUrl[0]);
          }
        }
      } catch (error) {
        console.error("Failed to load about image", error);
      }
    }
    fetchImage();
  }, []);

  return (
    <div className="py-24 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20 animate-fade-in-up">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">About Study Point</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our mission is to democratize education by providing high-quality, accessible, and industry-relevant courses to students worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-md bg-white border border-gray-200">
            {aboutImage ? (
              <img src={aboutImage} alt="Our Campus" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                </div>
                <span className="text-gray-500 font-bold mb-1">Our Campus</span>
                <span className="text-gray-400 text-sm">Image coming soon</span>
              </div>
            )}
          </div>
          <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Who We Are</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                Founded in 2026, Study Point has quickly become a premier destination for lifelong learners. We believe that learning shouldn't stop after an exam. It is a continuous journey that prepares you for the dynamic challenges of the real world.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                We envision a world where anyone, anywhere has the power to transform their life through learning. Our instructors are top-tier industry professionals dedicated to giving you practical, hands-on experience.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-32">
           <div className="text-center mb-16">
             <h2 className="text-3xl font-bold text-gray-900">Meet Our Leadership</h2>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 text-center">
             {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <div className="w-28 h-28 mx-auto bg-gray-100 border border-gray-200 rounded-full mb-6 flex items-center justify-center group-hover:border-blue-500 transition-colors">
                    <span className="text-4xl text-gray-400">👤</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Leader Name</h3>
                  <p className="text-blue-600 font-bold mb-4 tracking-wide uppercase text-xs">Title {i}</p>
                  <p className="text-gray-500 text-sm">Passionate about changing the world through innovative educational paradigms and technology.</p>
                </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
