"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { redirect, usePathname } from "next/navigation";
import { User, ChevronDown } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import axios from "axios";

interface IUser {
  email: string;
  username: string;
  avatar: string;
  role: string;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [userData, setUserData] = useState<IUser>();
  const [openUserData, setOpenUserData] = useState(false);
  const [courseDropdown, setCourseDropdown] = useState(false);
  const [roots, setRoots] = useState<string[]>([]);
  const session = useSession();

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const user = session.data?.user;
    if (user) {
      setUserData(user as IUser);
    }
  }, [session]);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await axios.get("/api/curriculum");
        if (res.data.success && res.data.data) {
          setRoots(Object.keys(res.data.data));
        }
      } catch (e) {
        console.error("Failed to fetch curriculum roots for navbar", e);
      }
    }
    fetchMenu();
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 glass border-b border-[var(--border)] transition-all duration-300 ${pathname.startsWith('/admin') ? 'hidden lg:block' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-gradient tracking-tight">
              {/* <Image src="/logo.png" alt="Logo" width={32} height={32} /> */}
              Study Point
            </Link>
          </div>

          <div className="hidden md:flex space-x-6 items-center">
            <Link href="/" className={`${isActive('/') ? 'text-[var(--primary)] font-semibold' : 'text-[var(--foreground)] font-medium hover:text-[var(--primary)]'} transition-colors duration-200`}>
              Home
            </Link>
            <Link href="/StudentResult" className={`${isActive('/StudentResult') ? 'text-[var(--primary)] font-semibold' : 'text-[var(--foreground)] font-medium hover:text-[var(--primary)]'} transition-colors duration-200`}>
              Result
            </Link>
            <Link href="/about" className={`${isActive('/about') ? 'text-[var(--primary)] font-semibold' : 'text-[var(--foreground)] font-medium hover:text-[var(--primary)]'} transition-colors duration-200`}>
              About Us
            </Link>
            
            {/* Courses Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setCourseDropdown(true)}
              onMouseLeave={() => setCourseDropdown(false)}
            >
              <Link href="/courses" className={`flex items-center gap-1 ${isActive('/courses') ? 'text-[var(--primary)] font-semibold' : 'text-[var(--foreground)] font-medium hover:text-[var(--primary)]'} transition-colors duration-200`}>
                Course <ChevronDown size={14} className={`transition-transform ${courseDropdown ? 'rotate-180' : ''}`} />
              </Link>
              {courseDropdown && (
                <div className="absolute top-full left-0 w-48 pt-1 z-50">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2">
                    {roots.length > 0 ? roots.map(root => (
                      <Link key={root} href={`/courses?category=${encodeURIComponent(root)}`} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[var(--primary)]">
                        {root}
                      </Link>
                    )) : (
                      <div className="px-4 py-2 text-sm text-gray-500">No categories</div>
                    )}
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                    <Link href="/courses" className="block px-4 py-2 text-sm font-bold text-[var(--primary)] hover:bg-gray-50 dark:hover:bg-gray-700">
                      View All Courses
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {userData && (
              <Link href="/me" className={`${isActive('/me') ? 'text-[var(--primary)] font-semibold' : 'text-[var(--foreground)] font-medium hover:text-[var(--primary)]'} transition-colors duration-200`}>
                Student Corner
              </Link>
            )}

            <Link href="/contact" className={`${isActive('/contact') ? 'text-[var(--primary)] font-semibold' : 'text-[var(--foreground)] font-medium hover:text-[var(--primary)]'} transition-colors duration-200`}>
              Contact Us
            </Link>


            {userData?.role === "admin" && (
              <Link href="/admin" className={`${isActive('/admin') ? 'text-[var(--primary)] font-semibold' : 'text-[var(--foreground)] font-medium hover:text-[var(--primary)]'} transition-colors duration-200`}>
                Admin
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {userData ? (
              <div className="relative dropdown" onMouseEnter={() => setOpenUserData(true)} onMouseLeave={() => setOpenUserData(false)}>
                <Image 
                  alt="userImage" 
                  src={userData.avatar || "/guest.png"}
                  width={40}
                  height={40}
                  className="rounded-full w-10 h-10 object-cover border-2 border-[var(--primary)]"
                />
                {openUserData && (
                  <div className="absolute top-full right-0 mt-2 min-w-[200px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3 z-50 flex flex-col gap-2">
                    <div className="text-sm border-b pb-2 mb-1">
                      <p className="font-bold text-gray-900 dark:text-white">{userData.username}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs truncate">{userData.email}</p>
                    </div>
                    <Link href="/me" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[var(--primary)] py-1">Dashboard</Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="mt-2 w-full bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 text-sm font-bold py-2 px-3 rounded-md transition-colors duration-200 text-center"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-6 py-2 rounded-full font-medium transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-[var(--primary)]/40 hover:-translate-y-0.5 active:scale-95 duration-200">
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-[var(--foreground)] focus:outline-none p-2 rounded-md hover:bg-[var(--muted)] transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute w-full backdrop-blur-xl bg-[var(--background)]/95 border-b border-[var(--border)] transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-4 pt-2 pb-6 space-y-1 shadow-2xl">
          <Link href="/" className={`block px-3 py-3 rounded-md text-base ${isActive('/') ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-bold' : 'font-medium hover:bg-[var(--muted)] hover:text-[var(--primary)]'} transition-colors`} onClick={() => setIsOpen(false)}>Home</Link>
          <Link href="/StudentResult" className={`block px-3 py-3 rounded-md text-base ${isActive('/StudentResult') ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-bold' : 'font-medium hover:bg-[var(--muted)] hover:text-[var(--primary)]'} transition-colors`} onClick={() => setIsOpen(false)}>Result</Link>
          <Link href="/about" className={`block px-3 py-3 rounded-md text-base ${isActive('/about') ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-bold' : 'font-medium hover:bg-[var(--muted)] hover:text-[var(--primary)]'} transition-colors`} onClick={() => setIsOpen(false)}>About Us</Link>
          <Link href="/courses" className={`block px-3 py-3 rounded-md text-base ${isActive('/courses') ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-bold' : 'font-medium hover:bg-[var(--muted)] hover:text-[var(--primary)]'} transition-colors`} onClick={() => setIsOpen(false)}>Courses</Link>
          {userData && <Link href="/me" className={`block px-3 py-3 rounded-md text-base ${isActive('/me') ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-bold' : 'font-medium hover:bg-[var(--muted)] hover:text-[var(--primary)]'} transition-colors`} onClick={() => setIsOpen(false)}>Student Corner</Link>}
          <Link href="/contact" className={`block px-3 py-3 rounded-md text-base ${isActive('/contact') ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-bold' : 'font-medium hover:bg-[var(--muted)] hover:text-[var(--primary)]'} transition-colors`} onClick={() => setIsOpen(false)}>Contact Us</Link>
          <Link href="/career" className={`block px-3 py-3 rounded-md text-base ${isActive('/career') ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-bold' : 'font-medium hover:bg-[var(--muted)] hover:text-[var(--primary)]'} transition-colors`} onClick={() => setIsOpen(false)}>Career</Link>
          {userData?.role === "admin" && <Link href="/admin" className={`block px-3 py-3 rounded-md text-base ${isActive('/admin') ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-bold' : 'font-medium hover:bg-[var(--muted)] hover:text-[var(--primary)]'} transition-colors`} onClick={() => setIsOpen(false)}>Admin</Link>}
          
          <div className="border-t border-gray-200 dark:border-gray-800 my-2 pt-2">
            {!userData ? (
               <Link href="/login" className="block w-full text-center bg-[var(--primary)] text-white px-4 py-3 rounded-lg font-bold" onClick={() => setIsOpen(false)}>Login</Link>
            ) : (
               <button onClick={() => { signOut({ callbackUrl: '/login' }); setIsOpen(false); }} className="block w-full text-center bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-4 py-3 rounded-lg font-bold">Sign Out</button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
