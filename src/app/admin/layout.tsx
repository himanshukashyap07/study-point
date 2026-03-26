"use client";

import Link from "next/link";
import React, { useState } from 'react';
import { Menu, X, LogOut, Settings, BookOpen, Image as ImageIcon, Users, Briefcase, CreditCard, MessageSquare, Trophy, Home } from 'lucide-react';
import { useSession, signOut } from "next-auth/react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <div className="flex -mt-16 lg:mt-0 h-screen lg:h-[calc(100vh-64px)] bg-gray-50 text-black overflow-hidden relative font-sans">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-gray-100 fixed top-0 w-full z-20 shadow-sm">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all active:scale-95 border border-gray-100 shadow-sm"
          aria-label="Toggle Menu"
        >
          {isSidebarOpen ? <X size={24} className="text-gray-600" /> : <Menu size={24} className="text-blue-600" />}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-500/20">S</div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight">Admin</h2>
        </div>

        <div className="flex items-center">
          {session?.user ? (
            <img 
              src={session.user.avatar || "/guest.png"} 
              alt="User" 
              className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover ring-2 ring-blue-50"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white shadow-md" />
          )}
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-100 flex flex-col h-full overflow-y-auto shadow-2xl z-40 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-10 lg:shadow-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-8 border-b border-gray-50 sticky top-0 bg-white/90 backdrop-blur-md z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-500/30 group-hover:scale-105 transition-all">S</div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Study Point</h2>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block -mt-1">Control Panel</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-6 flex flex-col gap-1.5 overflow-y-auto mt-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-4">Main Menu</p>
          <SidebarLink href="/admin" label="Dashboard" icon={<Home size={20} />} onClick={() => setIsSidebarOpen(false)} />
          <SidebarLink href="/admin/images" label="Gallery" icon={<ImageIcon size={20} />} onClick={() => setIsSidebarOpen(false)} />
          <SidebarLink href="/admin/users" label="Students" icon={<Users size={20} />} onClick={() => setIsSidebarOpen(false)} />
          <SidebarLink href="/admin/careers" label="Careers" icon={<Briefcase size={20} />} onClick={() => setIsSidebarOpen(false)} />
          <SidebarLink href="/admin/payments" label="Sales" icon={<CreditCard size={20} />} onClick={() => setIsSidebarOpen(false)} />
          <SidebarLink href="/admin/testimonials" label="Testimonials" icon={<MessageSquare size={20} />} onClick={() => setIsSidebarOpen(false)} />
          <SidebarLink href="/admin/results" label="Results" icon={<Trophy size={20} />} onClick={() => setIsSidebarOpen(false)} />
        </nav>

        {/* User Profile Section at Bottom */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          {session?.user ? (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white shadow-md border border-gray-100 ring-1 ring-black/5">
              <img 
                src={session.user.avatar || "/guest.png"} 
                alt="User" 
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-blue-50 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate leading-tight">{session.user.username}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight truncate">{session.user.role}</p>
                </div>
              </div>
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="p-2">
              <Link href="/login" className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:scale-[1.02] transition-all active:scale-95">
                Admin Login
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 p-4 lg:p-12 bg-[#F8FAFC] overflow-y-auto h-full pt-28 lg:pt-12 w-full scroll-smooth">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ href, label, icon, onClick }: { href: string; label: string; icon: React.ReactNode; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-4 rounded-2xl text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all font-bold group relative active:scale-[0.98]"
    >
      <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-blue-100/50 transition-colors">
        <span className="group-hover:scale-110 transition-transform block">{icon}</span>
      </div>
      <span className="text-[15px] tracking-tight">{label}</span>
      <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
        <div className="w-1.5 h-6 rounded-full bg-blue-500" />
      </div>
    </Link>
  );
}
