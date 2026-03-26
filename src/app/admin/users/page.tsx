"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/users");
      if (res.data.success) setUsers(res.data.data);
    } catch (e) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (id: string, isBlock: boolean) => {
    try {
      const res = await axios.patch(`/api/users/${id}`, { isBlock: !isBlock });
      if (res.data.success) {
        toast.success(isBlock ? "User Unblocked" : "User Blocked");
        fetchUsers();
      }
    } catch (e) {
      console.log(e);

      toast.error("Action failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to completely delete this user?")) return;
    try {
      const res = await axios.delete(`/api/users/${id}`);
      if (res.data.success) {
        toast.success("User Deleted");
        fetchUsers();
      }
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const filteredUsers = (users || []).filter(u => u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-black min-h-[500px]">
      <h2 className="text-3xl font-extrabold mb-6">Users Management</h2>
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-2 border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-y">
                <th className="p-3 font-semibold text-gray-600">Avatar</th>
                <th className="p-3 font-semibold text-gray-600">Username</th>
                <th className="p-3 font-semibold text-gray-600">Email</th>
                <th className="p-3 font-semibold text-gray-600">Role</th>
                <th className="p-3 font-semibold text-gray-600">Status</th>
                <th className="p-3 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <img src={u.avatar || "/guest.png"} className="w-10 h-10 rounded-full object-cover bg-gray-200" />
                  </td>
                  <td className="p-3 font-bold">{u.username}</td>
                  <td className="p-3 text-gray-500">{u.email}</td>
                  <td className="p-3"><span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-bold uppercase">{u.role}</span></td>
                  <td className="p-3">
                    {u.isBlock ? <span className="text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded">Blocked</span> : <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">Active</span>}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button onClick={() => handleBlock(u._id, u.isBlock)} className={`px-3 py-1 text-xs font-bold rounded ${u.isBlock ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {u.isBlock ? "Unblock" : "Block"}
                    </button>
                    <button onClick={() => handleDelete(u._id)} className="px-3 py-1 text-xs font-bold rounded bg-red-100 text-red-700">Delete</button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={6} className="p-10 text-center text-gray-500">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
