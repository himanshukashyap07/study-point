"use client"
import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Contact form submitted:", { name, email });
    setEmail("");
    setName("");
  };

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md mt-16 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 -translate-y-1/2 left-1/4 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 -translate-y-1/2 right-1/4 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Logo & Desc */}
          <div className="md:col-span-1">
            <Link href="/" className="text-2xl font-bold text-gradient tracking-tight">
              Study Point
            </Link>
            <p className="mt-6 text-sm text-[var(--muted-foreground)] leading-relaxed">
              Empowering the next generation with premium educational experiences. Elevate your learning journey today.
            </p>
          </div>

          {/* Column 1: Quick Link */}
          <div>
            <h3 className="text-xs font-bold text-[var(--foreground)] tracking-widest uppercase mb-6">Quick Link</h3>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors duration-200">About Us</Link></li>
              <li><Link href="/career" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors duration-200">Career</Link></li>
              <li><Link href="/StudentResult" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors duration-200">Result</Link></li>
              <li><Link href="/contact" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors duration-200">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 2: Contact Info */}
          <div>
            <h3 className="text-xs font-bold text-[var(--foreground)] tracking-widest uppercase mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="text-sm text-[var(--muted-foreground)]"><strong>Address:</strong> 123 Education Lane, Knowledge City, IN 12345</li>
              <li className="text-sm text-[var(--muted-foreground)]"><strong>Contact no.:</strong> +91 98765 43210</li>
              <li className="text-sm text-[var(--muted-foreground)]"><strong>Email:</strong> info@studypoint.com</li>
            </ul>
          </div>

          {/* Column 3: Contact Form */}
          <div>
            <h3 className="text-xs font-bold text-[var(--foreground)] tracking-widest uppercase mb-6">Contact Us</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input 
                type="text" 
                placeholder="Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
                className="w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-all shadow-sm" 
              />
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-all shadow-sm" 
              />
              <button 
                type="submit" 
                className="w-full flex items-center justify-center rounded-lg border border-transparent bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 transition-all hover:shadow-md hover:shadow-[var(--primary)]/30 active:scale-[0.98]"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-16 border-t border-[var(--border)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            &copy; {new Date().getFullYear()} Study Point Educational Institute. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-[var(--muted-foreground)] hover:text-[#1877F2] transition-colors" aria-label="Facebook">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-[var(--muted-foreground)] hover:text-[#E4405F] transition-colors" aria-label="Instagram">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-[var(--muted-foreground)] hover:text-[#FF0000] transition-colors" aria-label="YouTube">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
