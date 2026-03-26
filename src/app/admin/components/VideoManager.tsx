import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function VideoManager() {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialForm = { title: "", description: "", videoUrl: "", thumbnail: "", order: 1, duration: 0, isFree: false, courseId: "", resources: "" };
  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    try {
      const crsRes = await axios.get('/api/courses');
      if (crsRes.data.success) setCourses(crsRes.data.data);
      if (formData.courseId) {
        const vidRes = await axios.get(`/api/videos?courseId=${formData.courseId}`);
        if(vidRes.data.success) setVideos(vidRes.data.data);
      }
    } catch (e) {
      toast.error("Failed to load data");
    }
  };

  useEffect(() => { loadData(); }, [formData.courseId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : (type === 'number' ? Number(value) : value);
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, resources: formData.resources ? formData.resources.toString().split(",").map(s => s.trim()) : [] };
      let res;
      if (editingId) {
         res = await axios.patch(`/api/videos/${editingId}`, payload);
      } else {
         res = await axios.post("/api/videos", payload);
      }
      
      if (res.data.success) {
        toast.success(editingId ? "Video updated successfully!" : "Video added successfully!");
        setFormData({ ...initialForm, courseId: formData.courseId, order: editingId ? formData.order : formData.order + 1 });
        setEditingId(null);
        loadData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process video");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (v: any) => {
      setEditingId(v._id);
      setFormData({ title: v.title, description: v.description, videoUrl: v.videoUrl, thumbnail: v.thumbnail, order: v.order, duration: v.duration, isFree: v.isFree, courseId: v.courseId, resources: v.resources ? v.resources.join(", ") : "" });
      window.scrollTo(0,0);
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this video permanently?")) return;
    try {
       const res = await axios.delete(`/api/videos/${id}`);
       if(res.data.success) { toast.success("Deleted"); loadData(); }
    } catch(e) { toast.error("Delete failed"); }
  }

  return (
    <div className="max-w-4xl mx-auto text-black px-4">
      <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-xl md:text-2xl font-bold text-gray-800">{editingId ? "Edit Video" : "Add Video to Course"}</h2>
           {editingId && <button onClick={() => {setEditingId(null); setFormData({...initialForm, courseId: formData.courseId});}} className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-lg font-bold">Cancel Edit</button>}
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Select Course</label>
            <select name="courseId" value={formData.courseId} onChange={handleChange} required disabled={!!editingId} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-50">
              <option value="">-- Choose a Course --</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.title} ({c.class} - {c.subject})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Video Title</label>
              <input name="title" value={formData.title} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Video URL (m3u8/mp4)</label>
              <input name="videoUrl" value={formData.videoUrl} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Thumbnail</label>
              <input type="file" accept="image/*" onChange={
                async (e) => {
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
              {formData.thumbnail && <p className="text-xs text-green-600 mt-1 truncate">Uploaded: {formData.thumbnail}</p>}
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Order Index</label>
                <input type="number" name="order" value={formData.order} onChange={handleChange} required min="1" className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (mins)</label>
                <input type="number" name="duration" value={formData.duration} onChange={handleChange} required min="0" className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center justify-between">
              Resources Links
              <label className="flex items-center gap-2 cursor-pointer text-blue-600 font-normal">
                <input type="checkbox" name="isFree" checked={formData.isFree} onChange={handleChange} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                Is Free Preview
              </label>
            </label>
            <input name="resources" value={formData.resources} onChange={handleChange} placeholder="Comma separated URLs for notes/pdfs..." className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"></textarea>
          </div>
          <button type="submit" disabled={loading} className={`w-full text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-70 ${editingId ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30' : 'bg-gray-900 hover:bg-black shadow-gray-900/30'}`}>
            {loading ? "Processing..." : editingId ? "Save Changes" : "Add Video"}
          </button>
        </form>
      </div>

      {formData.courseId && (
        <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-lg md:text-xl font-bold mb-6">Course Videos ({videos.length})</h3>
           <div className="grid gap-3">
              {videos.map(v => (
                 <div key={v._id} className="border p-4 rounded-xl flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-gray-200 rounded flex flex-shrink-0 items-center justify-center font-bold">{v.order}</div>
                       <div>
                         <h4 className="font-bold text-gray-900">{v.title}</h4>
                         <p className="text-xs text-gray-500">{v.duration} mins {v.isFree && <span className="text-green-600 font-bold ml-2">Preview</span>}</p>
                       </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                       <button onClick={()=>startEdit(v)} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-600 hover:text-white transition">Edit</button>
                       <button onClick={()=>handleDelete(v._id)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition">Delete</button>
                    </div>
                 </div>
              ))}
              {videos.length === 0 && <p className="text-center text-gray-500">No videos for this course yet.</p>}
           </div>
        </div>
      )}
    </div>
  );
}
