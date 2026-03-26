"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatarFile: null as File | null,
    avatarPreview: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        avatarFile: file,
        avatarPreview: URL.createObjectURL(file)
      }));
    }
  };

  const validateStep1 = () => {
    setError("");
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let avatarUrl = "";

      // Step 2a: Upload avatar if exists
      if (formData.avatarFile) {
        const uploadData = new FormData();
        uploadData.append("file", formData.avatarFile);
        
        const uploadRes = await axios.post("/api/uploadFile", uploadData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        
        if (uploadRes.data.success) {
          avatarUrl = uploadRes.data.uploadResponse.url;
        } else {
          throw new Error("Avatar upload failed");
        }
      }

      // Step 2b: Register User
      const res = await axios.post("/api/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        avatar: avatarUrl
      });

      if (res.status === 201) {
        setStep(3); // Success & Verification
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "An error occurred during registration"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center bg-[var(--background)] p-4 sm:p-8">
      <div className="w-full max-w-md bg-[var(--background)] border border-[var(--border)] rounded-[2rem] p-8 sm:p-10 shadow-[0_0_40px_-15px_rgba(168,85,247,0.2)] relative overflow-hidden transition-all duration-500">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="animate-fade-in-right">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight mb-2">Create Account</h1>
              <p className="text-[var(--muted-foreground)] text-sm font-medium">Step 1: Account Details</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold shadow-sm border border-red-100 flex items-center justify-center animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleNextStep1} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-1.5 ml-1" htmlFor="username">Username</label>
                <input 
                  id="username" type="text" required
                  value={formData.username} onChange={handleChange}
                  className="w-full bg-[var(--muted)]/30 border border-[var(--border)] focus:border-purple-500 rounded-xl p-3 text-sm outline-none transition-all focus:ring-4 focus:ring-purple-500/10"
                  placeholder="Johndoe"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-1.5 ml-1" htmlFor="email">Email</label>
                <input 
                  id="email" type="email" required
                  value={formData.email} onChange={handleChange}
                  className="w-full bg-[var(--muted)]/30 border border-[var(--border)] focus:border-purple-500 rounded-xl p-3 text-sm outline-none transition-all focus:ring-4 focus:ring-purple-500/10"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-1.5 ml-1" htmlFor="password">Password</label>
                <input 
                  id="password" type="password" required
                  value={formData.password} onChange={handleChange}
                  className="w-full bg-[var(--muted)]/30 border border-[var(--border)] focus:border-purple-500 rounded-xl p-3 text-sm outline-none transition-all focus:ring-4 focus:ring-purple-500/10"
                  placeholder="••••••••" minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-1.5 ml-1" htmlFor="confirmPassword">Confirm Password</label>
                <input 
                  id="confirmPassword" type="password" required
                  value={formData.confirmPassword} onChange={handleChange}
                  className="w-full bg-[var(--muted)]/30 border border-[var(--border)] focus:border-purple-500 rounded-xl p-3 text-sm outline-none transition-all focus:ring-4 focus:ring-purple-500/10"
                  placeholder="••••••••" minLength={6}
                />
              </div>

              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm py-4 rounded-xl shadow-lg shadow-purple-500/30 transition-all hover:-translate-y-1 mt-6">
                Next: Choose Avatar
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-[var(--muted-foreground)] font-medium">
              Already have an account? <Link href="/login" className="text-purple-600 font-bold hover:text-purple-700 hover:underline underline-offset-4">Sign in</Link>
            </p>
          </div>
        )}

        {/* Step 2: Avatar Upload */}
        {step === 2 && (
          <div className="animate-fade-in-right">
             <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight mb-2">Identity</h1>
              <p className="text-[var(--muted-foreground)] text-sm font-medium">Step 2: Upload an Avatar</p>
            </div>
            
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold shadow-sm border border-red-100 flex items-center justify-center animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitFinal} className="space-y-6 flex flex-col items-center">
               <div className="relative group w-32 h-32 rounded-full border-4 border-[var(--border)] hover:border-purple-500 transition-colors overflow-hidden flex items-center justify-center bg-[var(--muted)]/30 cursor-pointer">
                 {formData.avatarPreview ? (
                   <img src={formData.avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-4xl text-gray-400 group-hover:text-purple-500 transition-colors">📷</span>
                 )}
                 <input type="file" id="avatar" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
               </div>

               <p className="text-xs text-[var(--muted-foreground)] text-center max-w-xs">Click the circle to browse for an image. You can skip this step if you want to use the default avatar.</p>

               <div className="w-full flex gap-3 mt-8">
                  <button type="button" onClick={() => setStep(1)} disabled={isLoading} className="w-1/3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-[var(--foreground)] font-bold text-sm py-4 rounded-xl transition-all">
                    Back
                  </button>
                  <button type="submit" disabled={isLoading} className="w-2/3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold text-sm py-4 rounded-xl shadow-lg shadow-purple-500/30 transition-all hover:-translate-y-1">
                    {isLoading ? "Finalizing..." : "Complete Setup"}
                  </button>
               </div>
            </form>
          </div>
        )}

        {/* Step 3: Success & Verification */}
        {step === 3 && (
          <div className="text-center animate-fade-in-up py-4">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-green-200">
               <span className="text-5xl text-green-500">✓</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight mb-4">Registration Complete!</h1>
            <p className="text-[var(--muted-foreground)] font-medium mb-8 leading-relaxed">
               We've successfully created your account, <strong>{formData.username}</strong>!<br/><br/>
               A verification link has been sent to <strong>{formData.email}</strong>. Please check your inbox and verify your email to unlock all features.
            </p>

            <button onClick={() => router.push("/login")} className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-black text-white font-bold text-sm py-4 rounded-xl shadow-lg transition-all hover:-translate-y-1">
              Go to Login Page
            </button>
          </div>
        )}

      </div>
    </div>
  );
}