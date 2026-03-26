"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function AdminResults() {
  const [results, setResults] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    studentId: "",
    courseId: "",
    year: new Date().getFullYear(),
    imageUrl: "",
    subjects: [{ subject: "", marks: 0 }],
  });

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/StudentResult");
      if (res.data.success) setResults(res.data.data || []);
    } catch (e) {
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    axios.get("/api/courses").then(res => {
      if (res.data.success) setCourses(res.data.data);
    }).catch(() => { });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/StudentResult", formData);
      if (res.data.success) {
        toast.success("Result created!");
        fetchResults();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to create result");
      return
    } finally {
      setFormData({ studentId: "", courseId: "", year: new Date().getFullYear(), imageUrl: "", subjects: [{ subject: "", marks: 0 }] });
    }
  };

  const handleDelete = async (id: string) => {
    // if (!confirm("Delete this result?")) return;
    try {
      console.log("id is", id);

      const res = await axios.delete(`/api/StudentResult?id=${id}`);
      if (res.data.success) { toast.success("Deleted"); fetchResults(); }
    } catch (e) { console.error(e); toast.error("Failed to delete"); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 text-black min-h-[500px]">
      <h2 className="text-2xl md:text-3xl font-extrabold mb-6">Student Results Management</h2>

      {/* Create Form */}
      <form onSubmit={handleSubmit} className="mb-10 bg-gray-50 p-6 rounded-xl border flex flex-col gap-4">
        <h3 className="font-bold text-lg">Add New Result</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold block mb-1">Student Email / ID</label>
            <input
              required
              placeholder="Student email or user ID"
              value={formData.studentId}
              onChange={e => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Course</label>
            <select
              required
              value={formData.courseId}
              onChange={e => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full border px-3 py-2 rounded-lg bg-white"
            >
              <option value="">-- Select Course --</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Year</label>
            <input
              type="number"
              required
              value={formData.year}
              onChange={e => setFormData({ ...formData, year: Number(e.target.value) })}
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">student Image</label>
            <div className="flex gap-2">
              <input type="file" accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const uploadData = new FormData();
                uploadData.append('file', file);
                try {
                  const res = await axios.post('/api/uploadFile', uploadData);
                  if (res.data.success) {
                    setFormData(prev => ({ ...prev, imageUrl: res.data.uploadResponse.url }));
                    toast.success("Result image uploaded!");
                  }
                } catch (error) {
                  toast.error("Result upload failed");
                }
              }} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>

          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Subject</label>
            <input
              required
              placeholder="e.g. Mathematics"
              value={formData.subjects[0].subject}
              onChange={e => setFormData({ ...formData, subjects: [{ ...formData.subjects[0], subject: e.target.value }] })}
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Marks</label>
            <input
              type="number"
              required
              placeholder="95"
              value={formData.subjects[0].marks || ""}
              onChange={e => setFormData({ ...formData, subjects: [{ ...formData.subjects[0], marks: Number(e.target.value) }] })}
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg w-fit shadow">
          Add Result
        </button>
      </form>

      {/* Results List */}
      <h3 className="text-xl font-bold mb-4 text-gray-700">All Results ({results.length})</h3>
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
        </div>
      ) : results.length > 0 ? (
        <div className="grid gap-4">
          {results.map(r => (
            <div key={r._id} className="border rounded-xl p-4 flex items-center gap-4 hover:border-blue-200 transition shadow-sm">
              <img
                src={r.imageUrl || "/guest.png"}
                alt={r.student?.username}
                className="w-16 h-16 object-cover rounded-xl shrink-0"
              />
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">{r.student?.username || r.student?.email || "Unknown Student"}</h4>
                <p className="text-sm text-gray-500">{r.course?.title || "Unknown Course"} • {r.year}</p>
                <p className="text-sm font-bold text-blue-600 mt-1">Total Score: {r.totalScore}</p>
                <div className="flex items-center gap-2">
                  {
                    r.marksheet && (
                      <a key={r._id} href={r.marksheet} target="_blank" rel="noreferrer" className="text-xs font-bold bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 flex items-center gap-1 transition cursor-pointer">
                        📄 Result
                      </a>
                    )
                  }
                </div>
              </div>
              <button
                onClick={() => handleDelete(r._id)}
                className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed text-gray-400">
          No results found. Add the first one above.
        </div>
      )}
    </div>
  );
}
