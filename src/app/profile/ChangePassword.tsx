"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/api/users/change-password", { oldPassword, newPassword });
      if (res.data.success) {
        toast.success("Password changed successfully");
        setOldPassword("");
        setNewPassword("");
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--background)] border border-[var(--border)] rounded-3xl p-8 mb-12 shadow-sm animate-fade-in-up">
      <h2 className="text-2xl font-extrabold text-[var(--foreground)] mb-6">Security Settings</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <div>
          <label className="text-sm font-bold text-[var(--foreground)] block mb-2">Old Password</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full bg-[var(--muted)]/50 border border-[var(--border)] text-[var(--foreground)] px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="text-sm font-bold text-[var(--foreground)] block mb-2">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-[var(--muted)]/50 border border-[var(--border)] text-[var(--foreground)] px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
            required
            minLength={6}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
