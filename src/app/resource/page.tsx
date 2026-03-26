"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";

function ResourceContent() {
   const searchParams = useSearchParams();
   const url = searchParams.get("url");

   if (!url) {
      return <div className="p-20 text-center text-xl font-bold">No Resource Found</div>;
   }

   return (
      <div className="flex-1 w-full bg-gray-900 relative">
         {/* Using google docs viewer or direct iframe with toolbar=0 */}
         <iframe
            src={`${url}#toolbar=0`}
            className="w-full h-full absolute inset-0"
            frameBorder="0"
            onContextMenu={(e) => e.preventDefault()}
         ></iframe>
         {/* An overlay to prevent right-click downloading if desired */}
         <div className="absolute inset-0 z-10 pointer-events-none" onContextMenu={(e) => e.preventDefault()}></div>
      </div>
   );
}

export default function ResourcePage() {
   return (
      <main className="min-h-screen flex flex-col pt-20 bg-gray-900 text-white">
         <Navbar />
         <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center z-20 shadow-md">
            <h1 className="text-xl font-bold">Resource Viewer (Protected)</h1>
            <p className="text-sm text-gray-400 font-semibold px-3 py-1 bg-gray-900 rounded-lg">Downloading is disabled</p>
         </div>
         <Suspense fallback={<div className="p-20 text-center animate-pulse">Loading Document...</div>}>
            <ResourceContent />
         </Suspense>
      </main>
   );
}
