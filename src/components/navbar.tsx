import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Navbar() {
  return (
    <header className="border-b bg-white/95 backdrop-blur-md shadow-2xs sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-blue-700 hover:text-blue-800 transition-colors">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="tracking-tight text-base sm:text-lg block leading-tight">IIT Patna Exam Portal</span>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Autumn 2026 End-Sem</span>
          </div>
        </Link>
        
        <nav className="flex items-center space-x-1 sm:space-x-3 text-xs sm:text-sm font-semibold">
          <Link href="/" className="px-2.5 py-1.5 rounded-md text-slate-700 hover:text-blue-700 hover:bg-slate-100 transition-colors">
            Lookup
          </Link>
          <Link href="/timetable" className="px-2.5 py-1.5 rounded-md text-slate-700 hover:text-blue-700 hover:bg-slate-100 transition-colors">
            Timetable
          </Link>
          <Link href="/courses" className="px-2.5 py-1.5 rounded-md text-slate-700 hover:text-blue-700 hover:bg-slate-100 transition-colors">
            Courses
          </Link>
          <Link href="/rooms" className="px-2.5 py-1.5 rounded-md text-slate-700 hover:text-blue-700 hover:bg-slate-100 transition-colors">
            Rooms
          </Link>
          <Link href="/compare" className="px-2.5 py-1.5 rounded-md text-slate-700 hover:text-blue-700 hover:bg-slate-100 transition-colors hidden sm:inline-block">
            Compare
          </Link>
        </nav>
      </div>
    </header>
  );
}
