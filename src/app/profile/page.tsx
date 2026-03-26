import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/DbConnect";
import { User } from "@/models/User";
import { Course } from "@/models/Course";
import Link from "next/link";
import { redirect } from "next/navigation";
import ChangePassword from "./ChangePassword";

export default async function ProfileDashboard() {
  const session = await getServerSession(authOption);
  
  if (!session || !session.user) {
    redirect("/login");
  }

  await dbConnect();
  
  // We populate the enrolledCourses array to get full course objects
  const userDoc = await User.findById((session.user as any)._id).populate({
    path: 'enrolledCourses',
    model: Course
  }).lean();

  if (!userDoc) {
    redirect("/login");
  }

  // Safely parse populated document to pass strictly valid JSON to the client/React
  const user = JSON.parse(JSON.stringify(userDoc));

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 lg:p-12 mb-12 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full border-4 border-white/20 bg-white/10 shadow-xl overflow-hidden backdrop-blur-md flex items-center justify-center text-white shrink-0">
                 {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                 ) : (
                    <span className="text-6xl font-bold uppercase">{user.username?.charAt(0) || "U"}</span>
                 )}
              </div>
              
              <div className="text-center sm:text-left text-white space-y-2 flex-1">
                 <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                   <h1 className="text-4xl font-extrabold tracking-tight">{user.username}</h1>
                   {user.role === 'admin' && <span className="text-xs bg-red-500 text-white font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">Admin</span>}
                   {user.role === 'instructor' && <span className="text-xs bg-amber-500 text-white font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">Instructor</span>}
                 </div>
                 <p className="text-blue-100 font-medium text-lg opacity-90">{user.email}</p>
                 <p className="text-blue-100/70 text-sm">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                 {(user.role === 'admin' || user.role === 'instructor') && (
                   <Link href="/admin" className="w-full text-center bg-white/20 hover:bg-white text-white hover:text-blue-600 font-bold py-3 px-6 rounded-xl transition-all shadow-lg backdrop-blur-sm whitespace-nowrap">
                     Admin Dashboard
                   </Link>
                 )}
                 <Link href="/courses" className="w-full text-center bg-transparent border border-white/30 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl transition-all whitespace-nowrap">
                   Browse More Courses
                 </Link>
              </div>
           </div>
        </div>

        {/* Change Password Component */}
        <ChangePassword />

        {/* My Learning Section */}
        <div className="mb-10 animate-fade-in-up">
           <h2 className="text-3xl font-extrabold text-[var(--foreground)] mb-2">My Learning</h2>
           <p className="text-[var(--muted-foreground)] text-sm">Jump back in and continue your educational journey.</p>
        </div>

        {user.enrolledCourses && user.enrolledCourses.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
             {user.enrolledCourses.map((course: any) => (
                <div key={course._id} className="group bg-[var(--background)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-[1.02] transform transition-all duration-300 flex flex-col cursor-pointer ring-1 ring-transparent hover:ring-blue-500/50">
                  <div className="relative h-48 bg-gray-200">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 text-5xl">📚</div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                       <div className="w-16 h-16 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
                         <span className="text-2xl ml-1">▶</span>
                       </div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex gap-2 mb-3">
                      <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 px-2 py-1 rounded-md">{course.category}</span>
                      <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{course.subject}</span>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--foreground)] mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-xs text-[var(--muted-foreground)] mb-6 flex-1 line-clamp-2">{course.description}</p>
                    
                    <Link href={`/courses/${course._id}/learn`} className="block w-full py-3 bg-[var(--muted)] hover:bg-blue-600 text-[var(--foreground)] hover:text-white text-center font-bold rounded-xl transition-colors">
                       Continue Learning
                    </Link>
                  </div>
                </div>
             ))}
           </div>
        ) : (
           <div className="bg-[var(--muted)]/20 border-2 border-dashed border-[var(--border)] rounded-3xl p-12 text-center animate-fade-in-up">
              <div className="text-6xl mb-4">🎓</div>
              <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">You haven't enrolled yet.</h3>
              <p className="text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">It looks like your library is currently empty. Explore our directory and enroll in a course to unlock premium videos, notes, and tests!</p>
              <Link href="/courses" className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xl shadow-blue-500/20 transform hover:-translate-y-1 transition-all">
                Explore Courses Directory
              </Link>
           </div>
        )}

      </div>
    </div>
  );
}
