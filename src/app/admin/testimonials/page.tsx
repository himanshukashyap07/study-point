"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: "", role: "", testimonial: "", imageUrl: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchTestimonials = async () => {
    try {
      const res = await axios.get("/api/Testimonials");
      if (res.data.success) setTestimonials(res.data.data || []);
    } catch (e) { }
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (editingId) {
        res = await axios.patch(`/api/Testimonials/${editingId}`, formData);
      } else {
        res = await axios.post("/api/Testimonials", formData);
      }
      if (res.data.success) {
        toast.success(editingId ? "Updated!" : "Created!");
        fetchTestimonials();
        setFormData({ name: "", role: "", testimonial: "", imageUrl: "" });
        setEditingId(null);
      }
    } catch (e) { toast.error("Failed"); }
  };

  const handleEdit = (t: any) => {
    setEditingId(t._id);
    setFormData({ name: t.name, role: t.role, testimonial: t.testimonial, imageUrl: t.imageUrl });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this?")) return;
    try {
      const res = await axios.delete(`/api/Testimonials/${id}`);
      if (res.data.success) { toast.success("Deleted"); fetchTestimonials(); }
    } catch (e) { toast.error("Failed"); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-black min-h-[500px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold">{editingId ? "Edit Testimonial" : "Testimonials Management"}</h2>
        {editingId && (
          <button onClick={() => { setEditingId(null); setFormData({ name: "", role: "", testimonial: "", imageUrl: "" }); }}
            className="text-sm bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg font-bold">
            Cancel Edit
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="mb-10 bg-gray-50 p-6 rounded-xl border flex flex-col gap-4">
         <div className="flex gap-4">
           <div className="flex-1">
             <label className="text-xs font-bold">Student Name</label>
             <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded" />
           </div>
           <div className="flex-1">
             <label className="text-xs font-bold">Role/Course</label>
             <input required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border p-2 rounded" />
           </div>
           <div className="flex-1">
             <label className="text-xs font-bold">Image URL</label>
             <input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full border p-2 rounded" />
           </div>
         </div>
         <div className="flex items-end gap-4">
             <div className="flex-1">
                <label className="text-xs font-bold">Testimonial Text</label>
                <input required value={formData.testimonial} onChange={e => setFormData({...formData, testimonial: e.target.value})} className="w-full border p-2 rounded" />
             </div>
             <button type="submit" className={`font-bold p-2 rounded h-[42px] px-6 text-white ${editingId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
               {editingId ? "Update" : "Add"}
             </button>
         </div>
      </form>

      <h3 className="text-xl font-bold mb-4 text-gray-700">All Testimonials ({testimonials.length})</h3>
      <div className="grid gap-4">
         {(testimonials || []).map(t => (
            <div key={t._id} className="border p-4 rounded-xl flex justify-between items-center group hover:border-blue-200 transition">
               <div className="flex items-center gap-4">
                 <img src={t.imageUrl || "/guest.png"} className="w-12 h-12 rounded-full object-cover" alt={t.name} />
                 <div>
                   <h4 className="font-bold flex items-center gap-2">{t.name} <span className="text-gray-400 text-xs font-normal">({t.role})</span></h4>
                   <p className="italic text-gray-600 text-sm">&quot;{t.testimonial}&quot;</p>
                 </div>
               </div>
               <div className="flex gap-2 shrink-0 ml-4">
                 <button onClick={() => handleEdit(t)} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold transition">Edit</button>
                 <button onClick={() => handleDelete(t._id)} className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold transition">Delete</button>
               </div>
            </div>
         ))}
         {testimonials.length === 0 && <p className="text-center text-gray-400 py-8 border border-dashed rounded-xl">No testimonials yet.</p>}
      </div>
    </div>
  );
}
