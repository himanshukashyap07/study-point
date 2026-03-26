import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function CourseManager() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialForm = { title: "", description: "", category: "", board: "", medium: "", class: "", subject: "", price: 0, isFree: false, thumbnail: "" };
  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    try {
      const [catRes, crsRes] = await Promise.all([
        axios.get('/api/curriculum'),
        axios.get('/api/courses')
      ]);
      if (catRes.data.success && catRes.data.data) {
        setCategories(Object.keys(catRes.data.data));
      }
      if (crsRes.data.success) {
        setCourses(crsRes.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : (type === 'number' ? Number(value) : value);
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (editingId) {
        res = await axios.patch(`/api/courses/${editingId}`, formData);
      } else {
        res = await axios.post("/api/courses", formData);
      }

      if (res.data.success) {
        toast.success(editingId ? "Course updated!" : "Course created successfully!");
        setFormData(initialForm);
        setEditingId(null);
        loadData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process course");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (c: any) => {
    setEditingId(c._id);
    setFormData({ title: c.title, description: c.description, category: c.category, board: c.board, medium: c.medium, class: c.class, subject: c.subject, price: c.price, isFree: c.isFree, thumbnail: c.thumbnail });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course permanently?")) return;
    try {
      const res = await axios.delete(`/api/courses/${id}`);
      if (res.data.success) {
        toast.success("Course deleted");
        loadData();
      }
    } catch (e) {
      toast.error("Failed to delete course");
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-black px-4">
      <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">{editingId ? "Edit Course" : "Create New Course"}</h2>
          {editingId && <button onClick={() => { setEditingId(null); setFormData(initialForm); }} className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-lg font-bold">Cancel Edit</button>}
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <input name="title" value={formData.title} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category (Root Node)</label>
              <select name="category" value={formData.category} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition">
                <option value="">-- Select Category --</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Board</label>
              <input name="board" value={formData.board} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Medium</label>
              <input name="medium" value={formData.medium} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Class</label>
              <input name="class" value={formData.class} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
              <input name="subject" value={formData.subject} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
            </div>
            <div>
              <label className=" text-sm font-semibold text-gray-700 mb-1 flex items-center justify-between">
                Price (Amount)
                <label className="flex items-center gap-2 cursor-pointer text-blue-600 font-normal">
                  <input type="checkbox" name="isFree" checked={formData.isFree} onChange={handleChange} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                  Is Free
                </label>
              </label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} disabled={formData.isFree} min="0" required={!formData.isFree} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-50" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Thumbnail</label>
              <div className="flex gap-2">
                <input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const uploadData = new FormData();
                  uploadData.append('file', file);
                  try {
                    const res = await axios.post('/api/uploadFile', uploadData);
                    if (res.data.success) {
                      setFormData(prev => ({ ...prev, thumbnail: res.data.uploadResponse.url }));
                      toast.success("Thumbnail uploaded!");
                    }
                  } catch (error) {
                    toast.error("Image upload failed");
                  }
                }} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              {formData.thumbnail && <p className="text-xs text-green-600 mt-1 truncate">Uploaded: {formData.thumbnail}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"></textarea>
          </div>
          <button type="submit" disabled={loading} className={`w-full text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-70 ${editingId ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'}`}>
            {loading ? "Processing..." : editingId ? "Save Changes" : "Create Course"}
          </button>
        </form>
      </div>

      <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg md:text-xl font-bold mb-6">Existing Courses</h3>
        <div className="grid gap-4">
          {courses.map(c => (
            <div key={c._id} className="border p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between hover:bg-gray-50 transition">
              <div className="flex items-center gap-4 flex-1 w-full">
                {c.thumbnail ? <img src={c.thumbnail} className="w-16 h-12 object-cover rounded-md" /> : <div className="w-16 h-12 bg-gray-200 rounded-md flex items-center justify-center">📚</div>}
                <div>
                  <h4 className="font-bold text-gray-900">{c.title}</h4>
                  <p className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">{c.category} &gt; {c.board} &gt; {c.class}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => startEdit(c)} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition">Edit</button>
                <button onClick={() => handleDelete(c._id)} className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition">Delete</button>
              </div>
            </div>
          ))}
          {courses.length === 0 && <p className="text-center text-gray-500 py-6">No courses created yet.</p>}
        </div>
      </div>
    </div>
  );
}
