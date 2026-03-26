"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const emptyForm = { title: "", description: "", imageUrl: "", positionsAvailable: 1, location: "", salaryRange: "", endDate: "" };

export default function CareersManagement() {
  const [careers, setCareers] = useState<any[]>([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchCareers = async () => {
    try {
      const res = await axios.get("/api/careers");
      if (res.data.success) setCareers(res.data.data || []);
    } catch (e) { }
  };

  useEffect(() => { fetchCareers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, positionsAvailable: Number(formData.positionsAvailable) };
      let res;
      if (editingId) {
        res = await axios.patch(`/api/careers/${editingId}`, payload);
      } else {
        res = await axios.post("/api/careers", payload);
      }
      if (res.data.success) {
        toast.success(editingId ? "Updated!" : "Job Posted!");
        fetchCareers();
        setFormData(emptyForm);
        setEditingId(null);
      }
    } catch (e) { toast.error("Failed"); }
  };

  const handleEdit = (c: any) => {
    setEditingId(c._id);
    setFormData({
      title: c.title, description: c.description, imageUrl: c.imageUrl || "",
      positionsAvailable: c.positionsAvailable, location: c.location,
      salaryRange: c.salaryRange, endDate: c.endDate?.split("T")[0] || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    try {
      const res = await axios.delete(`/api/careers/${id}`);
      if (res.data.success) { toast.success("Deleted"); fetchCareers(); }
    } catch (e) { toast.error("Failed"); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 text-black min-h-[500px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-extrabold">{editingId ? "Edit Job Listing" : "Career Management"}</h2>
        {editingId && (
          <button onClick={() => { setEditingId(null); setFormData(emptyForm); }}
            className="text-sm bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg font-bold">
            Cancel Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mb-10 bg-gray-50 p-6 rounded-xl border flex flex-col gap-4">
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           <input required placeholder="Job Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="border p-2 rounded col-span-2" />
           <input required placeholder="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="border p-2 rounded" />
           <input required type="number" min="1" placeholder="Positions Available" value={formData.positionsAvailable} onChange={e => setFormData({...formData, positionsAvailable: Number(e.target.value)})} className="border p-2 rounded" />
           <input required placeholder="Salary Range (e.g. 10L - 15L)" value={formData.salaryRange} onChange={e => setFormData({...formData, salaryRange: e.target.value})} className="border p-2 rounded col-span-2" />
           <input required type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="border p-2 rounded" title="End Date" />
           <input placeholder="Image/Banner URL (optional)" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="border p-2 rounded" />
         </div>
         <textarea required placeholder="Job Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="border p-2 rounded" rows={3}></textarea>
         <button type="submit" className={`text-white font-bold p-3 rounded-lg w-fit ${editingId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
           {editingId ? "Save Changes" : "Post New Job"}
         </button>
      </form>

      <h3 className="text-xl font-bold mb-4 text-gray-700">All Listings ({careers.length})</h3>
      <div className="grid gap-4">
         {(careers || []).length > 0 ? (careers || []).map(c => (
            <div key={c._id} className="border p-5 rounded-xl flex justify-between group bg-white hover:border-blue-300 transition shadow-sm">
               <div>
                 <div className="flex items-center gap-3 mb-2">
                   <h4 className="font-bold text-lg text-blue-900">{c.title}</h4>
                   <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold">{c.positionsAvailable} Openings</span>
                 </div>
                 <p className="text-sm text-gray-500 mb-2 font-medium">📍 {c.location} | 💰 {c.salaryRange} | ⏳ Deadline: {new Date(c.endDate).toLocaleDateString()}</p>
                 <p className="text-gray-600 text-sm line-clamp-2">{c.description}</p>
               </div>
               <div className="flex items-center gap-2 pl-4 border-l ml-4 shrink-0">
                 <button onClick={() => handleEdit(c)} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg transition font-bold text-sm">Edit</button>
                 <button onClick={() => handleDelete(c._id)} className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg transition font-bold text-sm">Delete</button>
               </div>
            </div>
         )) : (
           <div className="text-center py-10 bg-gray-50 text-gray-500 rounded-xl border border-dashed">No open positions available.</div>
         )}
      </div>
    </div>
  );
}
