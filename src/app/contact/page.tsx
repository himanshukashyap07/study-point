"use client";

import { useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="py-24 bg-[var(--background)] min-h-screen relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[var(--primary)]/5 blur-[120px] pointer-events-none rounded-full" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-5xl mb-4 text-gradient">Get in Touch</h1>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Have questions about our courses, pricing, or enterprise solutions? Our team is here to help you out.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-10 animate-fade-in-up">
            <div className="glass p-8 rounded-3xl flex items-start gap-6 border border-transparent hover:border-[var(--primary)]/30 transition-all duration-300">
               <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                 <span className="text-2xl">📍</span>
               </div>
               <div>
                 <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Our Headquarters</h3>
                 <p className="text-[var(--muted-foreground)] leading-relaxed">123 Education Lane, Tech District<br/>New York, NY 10001<br/>United States</p>
               </div>
            </div>
            <div className="glass p-8 rounded-3xl flex items-start gap-6 border border-transparent hover:border-[var(--secondary)]/30 transition-all duration-300">
               <div className="w-14 h-14 rounded-2xl bg-[var(--secondary)]/10 flex items-center justify-center shrink-0">
                 <span className="text-2xl">✉️</span>
               </div>
               <div>
                 <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Email Us</h3>
                 <p className="text-[var(--muted-foreground)] leading-relaxed">Support: support@studypoint.com<br/>Admissions: admission@studypoint.com</p>
               </div>
            </div>
            <div className="glass p-8 rounded-3xl flex items-start gap-6 border border-transparent hover:border-[var(--accent)]/30 transition-all duration-300">
               <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
                 <span className="text-2xl">📞</span>
               </div>
               <div>
                 <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Call Us</h3>
                 <p className="text-[var(--muted-foreground)] leading-relaxed">Toll-Free: +1 (800) 123-4567<br/>Local: +1 (212) 555-0199</p>
               </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="glass p-10 rounded-3xl shadow-2xl shadow-[var(--primary)]/5 border border-[var(--border)]/50 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-8">Send us a message</h2>
            {submitted ? (
               <div className="bg-[var(--secondary)]/10 border border-[var(--secondary)]/30 p-8 rounded-2xl flex flex-col items-center text-center animate-fade-in-up">
                 <div className="w-20 h-20 bg-[var(--secondary)] rounded-full text-white flex items-center justify-center text-4xl mb-6 shadow-lg shadow-[var(--secondary)]/30">✓</div>
                 <h3 className="text-2xl font-bold text-[var(--foreground)] mb-3">Message Sent!</h3>
                 <p className="text-[var(--muted-foreground)]">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                 <button onClick={() => setSubmitted(false)} className="mt-8 px-6 py-2 bg-[var(--background)] text-[var(--foreground)] font-bold rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all">Send another message</button>
               </div>
            ) : (
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="first-name" className="block text-sm font-bold text-[var(--foreground)] mb-2 uppercase tracking-wider text-xs">First Name</label>
                      <input type="text" id="first-name" required className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all shadow-sm" placeholder="John" />
                    </div>
                    <div>
                      <label htmlFor="last-name" className="block text-sm font-bold text-[var(--foreground)] mb-2 uppercase tracking-wider text-xs">Last Name</label>
                      <input type="text" id="last-name" required className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all shadow-sm" placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-[var(--foreground)] mb-2 uppercase tracking-wider text-xs">Email Address</label>
                    <input type="email" id="email" required className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all shadow-sm" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-bold text-[var(--foreground)] mb-2 uppercase tracking-wider text-xs">Message</label>
                    <textarea id="message" rows={5} required className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all shadow-sm resize-none" placeholder="How can we help you?" />
                  </div>
                  <button type="submit" className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-extrabold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-[var(--primary)]/30 hover:-translate-y-1 text-lg">
                    Send Message
                  </button>
                </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
