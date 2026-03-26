import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/DbConnect";
import { Course } from "@/models/Course";
import { User } from "@/models/User";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import CheckoutButton from "@/components/CheckoutButton";

export default async function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();

  const courseDoc = await Course.findById(id).lean();
  if (!courseDoc) {
    redirect("/courses");
  }

  // Convert mongoose doc to plain object safely for passing to client components if needed
  const course = JSON.parse(JSON.stringify(courseDoc));

  const session = await getServerSession(authOption);
  let isEnrolled = false;
  let userId = null;

  if (session && session.user) {
    userId = (session.user as any)._id;
    if (session.user.role === "admin" || session.user.role === "instructor") {
      isEnrolled = true;
    } else {
      const userDoc = await User.findById(userId).lean();
      if (userDoc && Array.isArray(userDoc.enrolledCourses) && userDoc.enrolledCourses.some((cId: any) => cId.toString() === id)) {
        isEnrolled = true;
      }
    }
  }

  // If the course is free, we treat everyone as enrolled for viewing purposes
  if (course.isFree) {
    isEnrolled = true;
  }

  return (
    <div className="pt-24 pb-16 bg-[var(--background)] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-8 font-medium">
          <Link href="/courses" className="hover:text-[var(--primary)] transition-colors">Courses</Link>
          <span>/</span>
          <span className="text-[var(--primary)] font-bold">{course.category}</span>
          <span>/</span>
          <span className="truncate max-w-[200px] text-[var(--foreground)]">{course.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Main Course Info (Left Col) */}
          <div className="lg:col-span-2 space-y-10">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-purple-100 text-purple-700 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">{course.category}</span>
                <span className="bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">{course.subject}</span>
                <span className="bg-orange-100 text-orange-700 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">{course.board} - Class {course.class}</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-[var(--foreground)] tracking-tight leading-tight mb-6">
                {course.title}
              </h1>
              <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
                {course.description || "This course provides comprehensive material precisely curated to master the subject and ace your examinations with confidence."}
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-[var(--border)]">
              <div className="flex flex-col items-center justify-center p-4 bg-[var(--muted)]/30 rounded-2xl">
                <span className="text-3xl mb-2">🎥</span>
                <span className="text-2xl font-black text-[var(--foreground)]">{course.totalVideo || 0}</span>
                <span className="text-xs text-[var(--muted-foreground)] font-bold uppercase tracking-wider">Videos</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-[var(--muted)]/30 rounded-2xl">
                <span className="text-3xl mb-2">⏱</span>
                <span className="text-2xl font-black text-[var(--foreground)]">{Math.round((course.totalDuration || 0) / 60)}</span>
                <span className="text-xs text-[var(--muted-foreground)] font-bold uppercase tracking-wider">Minutes</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-[var(--muted)]/30 rounded-2xl">
                <span className="text-3xl mb-2">📝</span>
                <span className="text-2xl font-black text-[var(--foreground)]">{course.medium}</span>
                <span className="text-xs text-[var(--muted-foreground)] font-bold uppercase tracking-wider">Medium</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-[var(--muted)]/30 rounded-2xl">
                <span className="text-3xl mb-2">👥</span>
                <span className="text-2xl font-black text-[var(--foreground)]">{course.enrolledStudents?.length || 0}</span>
                <span className="text-xs text-[var(--muted-foreground)] font-bold uppercase tracking-wider">Enrolled</span>
              </div>
            </div>

            {/* What you'll learn */}
            <div className="bg-[var(--background)] border border-[var(--border)] rounded-3xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">What you'll learn</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✔</span>
                  <span className="text-[var(--muted-foreground)]">Complete conceptual clarity of {course.subject}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✔</span>
                  <span className="text-[var(--muted-foreground)]">Comprehensive PYQ solutions for {course.board}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✔</span>
                  <span className="text-[var(--muted-foreground)]">In-depth topic wise mock tests</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✔</span>
                  <span className="text-[var(--muted-foreground)]">Premium notes and study material</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Sticky Sidebar (Right Col) */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-[var(--background)]/80 backdrop-blur-xl border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl shadow-[var(--border)]/20">
              <div className="relative w-full aspect-video bg-gray-200">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 text-5xl">
                    📚
                  </div>
                )}
                {/* Overlay Play Icon equivalent */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group cursor-pointer hover:bg-black/10 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <span className="text-blue-600 text-xl ml-1">▶</span>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="text-4xl font-extrabold text-[var(--foreground)] tracking-tight mb-2 flex items-center gap-3">
                  {course.isFree ? "Free" : `₹${course.price}`}
                  {!course.isFree && <span className="text-lg text-[var(--muted-foreground)] line-through decoration-2">₹{Math.round(course.price * 1.5)}</span>}
                </div>

                {course.isFree && !isEnrolled && (
                  <p className="text-sm text-green-600 font-bold mb-6">Enjoy lifetime free access to this material!</p>
                )}

                <div className="mt-8">
                  {isEnrolled ? (
                    <Link href={`/courses/${course._id}/learn`} className="block w-full py-4 rounded-xl font-bold text-center text-lg bg-green-600 hover:bg-green-700 text-white shadow-xl hover:shadow-green-500/30 transition-all duration-300 transform hover:-translate-y-1">
                      Go to Course
                    </Link>
                  ) : session && session.user ? (
                    <CheckoutButton courseId={course._id} userId={userId} amount={course.price} />
                  ) : (
                    <Link href="/login" className="block w-full py-4 rounded-xl font-bold text-center text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      Log in to Purchase
                    </Link>
                  )}
                </div>

                <p className="text-xs text-center text-[var(--muted-foreground)] mt-6 font-medium">
                  30-Day Money-Back Guarantee
                </p>

                <div className="mt-6 pt-6 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--foreground)] mb-4">This course includes:</h4>
                  <ul className="space-y-3 text-sm text-[var(--muted-foreground)]">
                    <li className="flex items-center gap-3"><span>📱</span> Access on mobile and TV</li>
                    <li className="flex items-center gap-3"><span>♾️</span> Full lifetime access</li>
                    <li className="flex items-center gap-3"><span>🏆</span> Certificate of completion</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
