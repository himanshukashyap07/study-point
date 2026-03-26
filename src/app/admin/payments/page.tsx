"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function PaymentsAndSales() {
   const [payments, setPayments] = useState<any[]>([]);
   
   useEffect(() => {
      // Mock fetch until GET /api/payments/all is created
      axios.get("/api/payments/me").then(res => setPayments(res.data.data)).catch(()=>null);
   }, []);

   return (
     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 text-black min-h-[500px]">
       <h2 className="text-2xl md:text-3xl font-extrabold mb-6">Payments & Sales Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
             <h3 className="text-blue-100 font-bold mb-1">Total Sales</h3>
             <p className="text-4xl font-black">₹{(payments || []).reduce((acc, p) => acc + (p.amount||0), 0)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
             <h3 className="text-purple-100 font-bold mb-1">Transactions</h3>
             <p className="text-4xl font-black">{(payments || []).length}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl text-white shadow-lg">
             <h3 className="text-gray-400 font-bold mb-1">Active Courses Sold</h3>
             <p className="text-4xl font-black">{new Set((payments || []).map(p => p.course?._id)).size}</p>
          </div>
       </div>

       <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
       <div className="overflow-x-auto border rounded-xl">
          <table className="w-full text-left">
             <thead className="bg-gray-50 border-b">
                <tr>
                   <th className="p-3">Order ID</th>
                   <th className="p-3">User</th>
                   <th className="p-3">Course</th>
                   <th className="p-3">Date</th>
                   <th className="p-3 font-bold text-right">Amount</th>
                </tr>
             </thead>
             <tbody className="divide-y">
                {(payments || []).map((p, i) => (
                   <tr key={i} className="hover:bg-gray-50">
                      <td className="p-3 text-xs font-mono text-gray-500">{p.orderId || p._id}</td>
                      <td className="p-3 font-bold">{p.user?.username || "Student"}</td>
                      <td className="p-3">{p.course?.title || "Course"}</td>
                      <td className="p-3 text-gray-500 text-sm">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 font-black text-blue-600 text-right">₹{p.amount || 0}</td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
     </div>
   )
}
