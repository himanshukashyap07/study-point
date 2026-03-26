"use client"
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentCorner() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("courses"); // courses, payments, result
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ username: "", avatar: "" });

  const [uploadLoading, setUploadLoading] = useState(false);
  const [resultForm, setResultForm] = useState({ courseId: "", year: new Date().getFullYear(), imageUrl: "", subjects: [{ subject: "", marks: 0 }] });

  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get("/api/users/me");
        console.log(res.data._doc);

        if (res.data.success) {
          setUser(res.data._doc);
          setProfileForm({ username: res.data._doc.username, avatar: res.data._doc.avatar });
        }
      } catch (err: any) {
        console.log(err);

        if (err?.response?.status === 401) {
          router.push("/login");
        } else {
          console.log(err);

          toast.error("Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (activeTab === 'payments') {
      axios.get("/api/payments").then(res => {
        if (res.data.success) setPayments(res.data.data);
      }).catch(e => console.error(e));
    }
  }, [activeTab]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.put("/api/users/me", profileForm);
      if (res.data.success) {
        setUser(res.data.data);
        setEditingProfile(false);
        toast.success("Profile updated! Refresh to see changes across site.");
      }
    } catch (e) {
      toast.error("Failed to update profile");
    }
  };

  const handleResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadLoading(true);
    try {
      const res = await axios.post("/api/StudentResult", resultForm);
      if (res.data.success) {
        toast.success("Result uploaded successfully!");
        setResultForm({ courseId: "", year: new Date().getFullYear(), imageUrl: "", subjects: [{ subject: "", marks: 0 }] });
      }
    } catch (e) {
      toast.error("Error uploading result");
    } finally {
      setUploadLoading(false);
    }
  }

  if (loading) return <div className="min-h-screen pt-24 pb-12 bg-gray-50 flex items-center justify-center"><div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  if (!user) return <div className="min-h-screen pt-24 pb-12 bg-gray-50 text-center"><p>Please login to view dashboard</p></div>;

  const enrolledCourses = user?.enrolledCourses || [];

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50 text-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <div className="flex flex-col md:flex-row gap-8">

          {/* Main Content (80%) */}
          <div className="w-full md:w-[80%] bg-white border rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">

            {/* Top Navigation inside Main Area */}
            <div className="flex gap-4 border-b pb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
              <button onClick={() => setActiveTab("courses")} className={`font-bold px-4 py-2 rounded-xl transition ${activeTab === 'courses' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Enrolled Courses</button>
              <button onClick={() => setActiveTab("payments")} className={`font-bold px-4 py-2 rounded-xl transition ${activeTab === 'payments' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Payment Receipts</button>
              <button onClick={() => setActiveTab("result")} className={`font-bold px-4 py-2 rounded-xl transition ${activeTab === 'result' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}>Upload Result</button>
            </div>

            <div className="mt-8 flex-1">

              {/* Courses Tab */}
              {activeTab === 'courses' && (
                <div className="animate-fade-in-up">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-gray-900">My Learning</h2>
                    <Link href="/courses" className="text-blue-600 font-bold hover:underline text-sm">Buy New Course →</Link>
                  </div>

                  {enrolledCourses.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {enrolledCourses.map((course: any) => (
                        <div key={course._id} className="bg-gray-50 border rounded-2xl overflow-hidden hover:shadow-md transition group h-full flex flex-col">
                          <div className="h-32 bg-gray-200 relative">
                            {course.thumbnail ? <img src={course.thumbnail} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>}
                            <div className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded">ACCESS GRANTED</div>
                          </div>
                          <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-gray-900 mb-2 truncate" title={course.title}>{course.title}</h3>
                            <p className="text-xs text-gray-500 mb-4 line-clamp-2">{course.description}</p>

                            <div className="mt-auto">
                              <Link href={`/courses/${course._id}/learn`} className="block w-full text-center bg-gray-900 hover:bg-black text-white py-2 px-1 rounded-xl text-sm font-bold transition cursor-pointer">
                                Go to Course
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-gray-50 border-2 border-dashed rounded-3xl">
                      <div className="text-6xl mb-4">🎓</div>
                      <h3 className="font-bold text-xl mb-2 text-gray-800">You don't have any courses</h3>
                      <Link href="/courses" className="text-blue-600 font-bold underline">Explore directories to buy or enroll free courses.</Link>
                    </div>
                  )}
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === 'payments' && (
                <div className="animate-fade-in-up">
                  <h2 className="text-2xl font-black text-gray-900 mb-6">Payment Receipts</h2>
                  {payments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-100 text-gray-700">
                          <tr>
                            <th className="px-4 py-3 rounded-tl-xl font-bold">Order ID</th>
                            <th className="px-4 py-3 font-bold">Course</th>
                            <th className="px-4 py-3 font-bold">Date</th>
                            <th className="px-4 py-3 rounded-tr-xl font-bold">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {payments.map((p, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-600 font-mono text-xs">{p.orderId || p._id}</td>
                              <td className="px-4 py-3 font-bold">{p.course?.title || "Course"}</td>
                              <td className="px-4 py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                              <td className="px-4 py-3 font-black text-blue-600">₹{p.amount || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-10 bg-gray-50 border border-dashed rounded-xl">No payment records found.</p>
                  )}
                </div>
              )}

              {/* Upload Result Tab */}
              {activeTab === 'result' && (
                <div className="animate-fade-in-up max-w-lg mx-auto bg-purple-50 p-6 md:p-8 rounded-3xl border border-purple-100">
                  <h2 className="text-2xl font-black text-purple-900 mb-2">Share Your Achievement</h2>
                  <p className="text-sm text-purple-700 mb-6">Upload your result and inspire others! Top rankers will be featured on the home page.</p>

                  <form onSubmit={handleResultSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-purple-900 mb-1">Select Course</label>
                      <select required value={resultForm.courseId} onChange={e => setResultForm({ ...resultForm, courseId: e.target.value })} className="w-full border-purple-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                        <option value="">-- Choose Course --</option>
                        {enrolledCourses.map((c: any) => <option key={c._id} value={c._id}>{c.title}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-purple-900 mb-1">Result Image URL (Mark sheet/Photo)</label>
                      <input type="file" accept="image/*,application/pdf" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const uploadData = new FormData();
                        uploadData.append('file', file);
                        try {
                          const res = await axios.post('/api/uploadFile', uploadData);
                          if (res.data.success) {
                            setResultForm(prev => ({ ...resultForm, marksheet: res.data.uploadResponse.url }));
                            toast.success("Result image uploaded!");
                          }
                        } catch (error) {
                          toast.error("Result upload failed");
                        }
                      }} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-purple-900 mb-1">Subject</label>
                        <input required type="text" placeholder="e.g. Physics" value={resultForm.subjects[0].subject} onChange={e => setResultForm({ ...resultForm, subjects: [{ ...resultForm.subjects[0], subject: e.target.value }] })} className="w-full border border-purple-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500 bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-purple-900 mb-1">Marks</label>
                        <input required type="number" placeholder="95" value={resultForm.subjects[0].marks || ''} onChange={e => setResultForm({ ...resultForm, subjects: [{ ...resultForm.subjects[0], marks: Number(e.target.value) }] })} className="w-full border border-purple-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500 bg-white" />
                      </div>
                    </div>
                    <button type="submit" disabled={uploadLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition shadow-md shadow-purple-500/20 mt-4 flex justify-center items-center gap-2">
                      {uploadLoading ? "Uploading..." : <><Upload size={18} /> Upload Result</>}
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>

          {/* Sidebar (20%) - Profile Info */}
          <div className="w-full md:w-[20%]">
            <div className="bg-white border rounded-3xl p-6 shadow-sm sticky top-28 overflow-hidden h-fit">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 z-0"></div>

              <div className="relative z-10 text-center">
                <div className="w-24 h-24 mx-auto rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                  {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <span className="text-4xl">U</span>}
                </div>

                {!editingProfile ? (
                  <>
                    <h2 className="font-extrabold text-xl text-gray-900 break-words">{user.username}</h2>
                    <p className="text-xs text-gray-500 mb-4 font-mono break-words">{user.email}</p>
                    <div className="flex justify-center mb-6">
                      {user.role === 'admin' ? <span className="bg-red-100 text-red-600 text-xs font-black px-3 py-1 rounded-full uppercase">Admin</span> : <span className="bg-gray-100 text-gray-600 text-xs font-black px-3 py-1 rounded-full uppercase">Student</span>}
                    </div>
                    <button onClick={() => setEditingProfile(true)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 rounded-xl transition text-sm shadow-sm">
                      Edit Profile
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleProfileUpdate} className="text-left space-y-3 mt-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700">Username</label>
                      <input type="text" value={profileForm.username} onChange={e => setProfileForm({ ...profileForm, username: e.target.value })} className="w-full border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700">Avatar URL</label>
                      <input type="text" value={profileForm.avatar} onChange={e => setProfileForm({ ...profileForm, avatar: e.target.value })} className="w-full border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button type="submit" className="flex-1 bg-blue-600 text-white text-xs font-bold py-2 rounded-lg">Save</button>
                      <button type="button" onClick={() => { setEditingProfile(false); setProfileForm({ username: user.username, avatar: user.avatar }) }} className="flex-1 bg-gray-200 text-gray-800 text-xs font-bold py-2 rounded-lg">Cancel</button>
                    </div>
                  </form>
                )}

                <div className="mt-8 border-t pt-6 text-left">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Stats</h4>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-600 font-medium">Courses</span>
                    <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">{enrolledCourses.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Join Year</span>
                    <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">{new Date(user.createdAt).getFullYear()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
