"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ResultPage() {
   const [results, setResults] = useState<any[]>([]);
   const [courses, setCourses] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   const [filter, setFilter] = useState({ courseId: "", year: "" });
   const [pagination, setPagination] = useState({ page: 1, limit: 12, totalPages: 1, total: 0 });

   useEffect(() => {
      // Load courses for filter dropdown
      axios.get("/api/courses").then(res => {
         if (res.data.success) setCourses(res.data.data);
      }).catch(() => { });
   }, []);

   useEffect(() => {
      fetchResults();
   }, [filter, pagination.page]);

   const fetchResults = async () => {
      setLoading(true);
      try {
         const query = new URLSearchParams({
            page: pagination.page.toString(),
            limit: pagination.limit.toString()
         });
         if (filter.courseId) query.append("courseId", filter.courseId);
         if (filter.year) query.append("year", filter.year);

         const res = await axios.get(`/api/StudentResult?${query.toString()}`);
         if (res.data.success) {
            setResults(res.data.data);
            setPagination(prev => ({ ...prev, totalPages: res.data.totalPages, total: res.data.total }));
         }
      } catch (e) {
         console.error("Failed to load results", e);
      } finally {
         setLoading(false);
      }
   };

   const currentYear = new Date().getFullYear();
   const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

   return (
      <div className="min-h-screen bg-gray-50 flex flex-col text-black">

         <div className="bg-blue-900 text-white py-20 px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Student Results &amp; Hall of Fame</h1>
            <p className="text-blue-200 text-lg max-w-2xl mx-auto">Discover the outstanding achievements of our top performers across all courses and years.</p>
         </div>

         <div className="max-w-7xl mx-auto w-full px-4 py-12 flex-1">
            {/* Advanced Search Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
               <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                  <select
                     value={filter.courseId}
                     onChange={(e) => { setFilter({ ...filter, courseId: e.target.value }); setPagination({ ...pagination, page: 1 }); }}
                     className="border-gray-300 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700 min-w-[250px]"
                  >
                     <option value="">All Courses</option>
                     {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>

                  <select
                     value={filter.year}
                     onChange={(e) => { setFilter({ ...filter, year: e.target.value }); setPagination({ ...pagination, page: 1 }); }}
                     className="border-gray-300 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700 min-w-[150px]"
                  >
                     <option value="">All Years</option>
                     {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
               </div>
               <p className="text-gray-500 font-bold whitespace-nowrap">Found {pagination.total} Results</p>
            </div>

            {loading ? (
               <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
               </div>
            ) : results.length > 0 ? (
               <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                     {results.map((r, idx) => (
                        <div key={r._id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group">
                           <div className="h-48 bg-gray-200 relative overflow-hidden">
                              <img src={r.imageUrl || "./guest.png"} alt={r.student?.username} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 font-black text-sm px-3 py-1 rounded-full shadow-md">
                                 {r.year}
                              </div>
                              {/* Rank Badge for the top ones if sorting by score */}
                              {idx < 3 && pagination.page === 1 && !filter.courseId && !filter.year && (
                                 <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black text-sm px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                                    🏆 Rank {idx + 1}
                                 </div>
                              )}
                           </div>
                           <div className="p-6">
                              <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{r.student?.username || "Anonymous"}</h3>
                              <p className="text-gray-500 text-sm mb-4 truncate">{r.course?.title || "Unknown Course"}</p>

                              <div className="flex items-center justify-between border-t pt-4">
                                 <span className="text-sm font-bold text-gray-400">Total Score</span>
                                 <span className="text-2xl font-black text-blue-600">{r.totalScore}</span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Pagination Controls */}
                  {pagination.totalPages > 1 && (
                     <div className="flex justify-center items-center gap-4 mt-12">
                        <button
                           disabled={pagination.page === 1}
                           onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                           className="bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 disabled:opacity-50 transition"
                        >
                           Previous
                        </button>
                        <span className="font-bold text-gray-500">Page {pagination.page} of {pagination.totalPages}</span>
                        <button
                           disabled={pagination.page === pagination.totalPages}
                           onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                           className="bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 disabled:opacity-50 transition"
                        >
                           Next
                        </button>
                     </div>
                  )}
               </>
            ) : (
               <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 flex flex-col items-center">
                  <div className="text-6xl mb-4 text-gray-300">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">No results found</h3>
                  <p className="text-gray-500 max-w-sm">Try adjusting your filters or search criteria.</p>
               </div>
            )}
         </div>
      </div>
   );
}
