import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IIT Patna Autumn 2026 End-Semester Examination",
  description: "Official Examination Schedule, Room Allocations, and Student Seating for Autumn 2026 End-Semester Examinations at IIT Patna.",
  keywords: ["IIT Patna", "Autumn 2026", "End-Semester Examination", "Timetable", "Room Allocation", "Exam Schedule"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50 flex flex-col antialiased`}>
        <Navbar />
        <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
        <footer className="py-6 text-center text-sm text-slate-500 border-t border-slate-200 mt-auto bg-white">
          <div className="container mx-auto px-4 space-y-1">
            <p className="font-medium text-slate-700">Indian Institute of Technology Patna &bull; Autumn 2026 End-Semester Examination Portal</p>
            <p className="text-xs text-slate-400">
              Directed by Saurabh &middot; Because checking the Excel was too easy 😭
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
