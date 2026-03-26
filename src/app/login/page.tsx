"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    <path fill="none" d="M1 1h22v22H1z"/>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        console.log(res);
        
        setError("Invalid email or password");
      } else if (res?.ok) {
        router.push("/");
        router.refresh(); // Update the navbar state
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center bg-[var(--background)] p-4 sm:p-8">
      <div className="w-full max-w-md bg-[var(--background)] border border-[var(--border)] rounded-[2rem] p-8 sm:p-10 shadow-[0_0_40px_-15px_rgba(59,130,246,0.2)] animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            <span className="text-3xl font-black text-white">S</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight mb-2">Welcome Back</h1>
          <p className="text-[var(--muted-foreground)] text-sm font-medium">Log in to your account to continue</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold shadow-sm border border-red-100 flex items-center justify-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[var(--foreground)] mb-2 ml-1" htmlFor="email">Email</label>
            <input 
              id="email"
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--muted)]/30 border border-[var(--border)] focus:border-blue-500 rounded-xl p-3.5 text-sm outline-none transition-all focus:ring-4 focus:ring-blue-500/10 placeholder-gray-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--foreground)] mb-2 ml-1" htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--muted)]/30 border border-[var(--border)] focus:border-blue-500 rounded-xl p-3.5 text-sm outline-none transition-all focus:ring-4 focus:ring-blue-500/10 placeholder-gray-400"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold text-sm py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 mt-6"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-8 flex items-center">
          <div className="flex-1 border-t border-[var(--border)]"></div>
          <p className="mx-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Or continue with</p>
          <div className="flex-1 border-t border-[var(--border)]"></div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          className="mt-6 w-full flex items-center justify-center gap-3 bg-[var(--background)] hover:bg-[var(--muted)]/50 border border-[var(--border)] text-[var(--foreground)] font-bold text-sm py-3.5 rounded-xl shadow-sm transition-all hover:shadow-md"
        >
          <GoogleIcon />
          Sign in with Google
        </button>

        <p className="mt-8 text-center text-sm text-[var(--muted-foreground)] font-medium">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 font-bold hover:text-blue-700 hover:underline underline-offset-4 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
