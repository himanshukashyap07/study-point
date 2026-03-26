import Link from "next/link";
import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 text-black">
      {/* 20% Sidebar */}
      <aside className="w-1/5 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto shadow-sm z-10">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-extrabold text-blue-600">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <SidebarLink href="/admin" label="Course Management" icon="📚" />
          <SidebarLink href="/admin/images" label="Image Section" icon="🖼️" />
          <SidebarLink href="/admin/users" label="Users Management" icon="👥" />
          <SidebarLink href="/admin/careers" label="Career List" icon="💼" />
          <SidebarLink href="/admin/payments" label="Payments & Sales" icon="💳" />
          <SidebarLink href="/admin/testimonials" label="Testimonials" icon="💬" />
        </nav>
      </aside>

      {/* 80% Content */}
      <main className="w-4/5 p-8 bg-gray-50 overflow-y-auto h-full">
        {children}
      </main>
    </div>
  );
}

function SidebarLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-semibold group border border-transparent hover:border-blue-100">
      <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
