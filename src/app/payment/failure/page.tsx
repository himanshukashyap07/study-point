import Link from "next/link";

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[var(--background)] border border-red-500/30 rounded-3xl p-8 shadow-2xl text-center">
        <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-inner shadow-red-500/20">
          <span className="text-5xl text-red-600">❌</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--foreground)] mb-4">Payment Failed</h1>
        <p className="text-[var(--muted-foreground)] mb-8">
          We could not process your transaction at this time. Our secure checksum algorithm may have rejected the payload, or you cancelled the request. No charges were made.
        </p>

        <div className="space-y-4">
          <Link href="/courses" className="block w-full py-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-xl shadow-red-500/30 transition-all hover:-translate-y-1">
            Try Again
          </Link>
          <Link href="/" className="block w-full py-4 rounded-xl font-bold text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--muted)] transition-all">
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
