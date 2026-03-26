import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthProvider from "@/context/authProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Study Point | Premier Educational Institute",
  description: "Empowering students with dynamic learning, modern courses, and expert guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased h-full`}>
      <AuthProvider>
        <body className="min-h-full flex flex-col pt-16">
          <Navbar />
          <main className="flex-1">
            {children}
            <Toaster position="top-right" />
          </main>
          <Footer />
        </body>
      </AuthProvider>
    </html>
  );
}
