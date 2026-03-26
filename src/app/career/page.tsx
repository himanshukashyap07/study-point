"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";

export default function CareerPage() {
  const [careers, setCareers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getCareers() {
      try {
        const res = await axios.get("/api/careers")
        console.log(res.data);

        if (!res.data.success) {
          toast.error(res.data.message);
          return;
        }
        setCareers(res.data.data || [])
      } catch (error) {
        toast.error("Failed to fetch careers")
        return;
      } finally {
        setLoading(false)
      }
    }
    getCareers()
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white py-24 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Careers at Study Point</h1>
        <p className="text-blue-200 text-lg max-w-2xl mx-auto">
          Join our passionate team and help shape the future of education. Explore open positions below.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600" />
          </div>
        ) : careers.length == 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300 flex flex-col items-center">
            <div className="text-6xl mb-4">💼</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Open Positions</h3>
            <p className="text-gray-500 max-w-sm">
              We don&apos;t have any openings right now, but check back soon!
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {careers.map((c) => (
              <div key={c._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-lg hover:border-blue-300 transition-all">
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  {c.imageUrl && (
                    <Image width={200} height={200} src={(c.imageUrl === "none" ? "/guest.png" : c.imageUrl)} alt={c.title} className="w-full md:w-40 h-32 object-cover rounded-xl shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h2 className="text-xl font-extrabold text-gray-900">{c.title}</h2>
                      <span className="text-xs bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full">
                        {c.positionsAvailable} Opening{c.positionsAvailable > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium mb-3">
                      <span>📍 {c.location}</span>
                      <span>💰 {c.salaryRange}</span>
                      <span>⏳ Deadline: {new Date(c.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{c.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
