"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const emptyForm = { title: "", category: "home", imageUrl: "", description: "" };

export default function ImageManagement() {
  const [images, setImages] = useState<any[]>([]);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchImages = async () => {
    try {
      const res = await axios.get("/api/ImageSection");
      if (res.data.success) setImages(res.data.data || []);
    } catch (e) {
      toast.error("Failed to fetch images");
    }
  };

  useEffect(() => { fetchImages(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, imageUrl: formData.imageUrl.split(',').map(s => s.trim()) };
      let res;
      if (editingId) {
        res = await axios.patch(`/api/ImageSection/${editingId}`, payload);
      } else {
        res = await axios.post("/api/ImageSection", payload);
      }
      if (res.data.success) {
        toast.success(editingId ? "Image Section Updated!" : "Image Section Created!");
        fetchImages();
        setFormData(emptyForm);
        setEditingId(null);
      }
    } catch (e) {
      toast.error("Failed to save image section");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (img: any) => {
    setEditingId(img._id);
    setFormData({
      title: img.title,
      category: img.category,
      imageUrl: (img.imageUrl || []).join(", "),
      description: img.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this section?")) return;
    try {
      const res = await axios.delete(`/api/ImageSection/${id}`);
      if (res.data.success) { toast.success("Deleted"); fetchImages(); }
    } catch (e) { toast.error("Delete failed"); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 text-black min-h-[500px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-extrabold">{editingId ? "Edit Image Section" : "Global Images UI"}</h2>
        {editingId && (
          <button onClick={() => { setEditingId(null); setFormData(emptyForm); }}
            className="text-sm bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg font-bold">
            Cancel Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mb-10 bg-gray-50 p-6 rounded-xl border">
         <h3 className="font-bold text-lg mb-4">{editingId ? "Update Image Section" : "Add New Image Section"}</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input required placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="border px-4 py-2 rounded-lg" />
            <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="border px-4 py-2 rounded-lg bg-white">
              <option value="home">Home Hero Image</option>
              <option value="instructor">Instructor Profile</option>
              <option value="about">About Section image</option>
              <option value="director">Director Message Image</option>
              <option value="logo">Website Logo</option>
            </select>
            <input required placeholder="Image URLs (comma separated for multiple)" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="border px-4 py-2 rounded-lg md:col-span-2" />
            <textarea required placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="border px-4 py-2 rounded-lg md:col-span-2" rows={2}></textarea>
         </div>
         <button disabled={loading} type="submit" className={`text-white font-bold px-6 py-2 rounded-lg shadow disabled:opacity-50 ${editingId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
           {loading ? "Saving..." : editingId ? "Save Changes" : "Create Section"}
         </button>
      </form>

      <h3 className="text-xl font-bold mb-4 text-gray-700">All Image Sections ({images.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {(images || []).map(img => (
            <div key={img._id} className="border rounded-xl p-4 shadow-sm flex flex-col hover:border-blue-300 transition">
              <div className="flex justify-between items-start mb-2">
                 <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded uppercase">{img.category}</span>
                 <div className="flex gap-1">
                   <button onClick={() => handleEdit(img)} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-2 py-1 rounded text-xs font-bold transition">Edit</button>
                   <button onClick={() => handleDelete(img._id)} className="bg-red-50 text-red-500 hover:bg-red-600 hover:text-white px-2 py-1 rounded text-xs font-bold transition">Delete</button>
                 </div>
              </div>
              <h4 className="font-bold">{img.title}</h4>
              <p className="text-sm text-gray-500 mb-3">{img.description}</p>
              <div className="flex gap-2 mt-auto overflow-x-auto">
                 {(img.imageUrl || []).map((url: string, i: number) => (
                    <img key={i} src={url} className="w-16 h-16 object-cover rounded bg-gray-100 shrink-0" alt={`img-${i}`} />
                 ))}
              </div>
            </div>
         ))}
         {images.length === 0 && <p className="col-span-full text-center text-gray-400 py-8 border border-dashed rounded-xl">No image sections yet.</p>}
      </div>
    </div>
  );
}
