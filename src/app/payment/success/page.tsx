import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/options";

export default async function PaymentSuccessPage() {
  const session = await getServerSession(authOption);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[var(--background)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl text-center">
        <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner shadow-green-500/20">
          <span className="text-5xl text-green-600">🎉</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--foreground)] mb-4">Payment Successful!</h1>
        <p className="text-[var(--muted-foreground)] mb-8">
          Welcome aboard! Your transaction was processed completely and the course has been added to your dashboard. 
        </p>

        <div className="space-y-4">
          <Link href="/courses" className="block w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-1">
            Browse More Courses
          </Link>
          <Link href={`/profile`} className="block w-full py-4 rounded-xl font-bold text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--muted)] transition-all">
            View My Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
