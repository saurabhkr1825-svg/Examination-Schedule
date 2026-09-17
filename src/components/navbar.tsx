import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-blue-700">
          <BookOpen className="h-6 w-6" />
          <span className="hidden sm:inline-block tracking-tight text-lg">IIT Patna Exam Portal</span>
          <span className="sm:hidden tracking-tight text-lg">Exams</span>
        </Link>
        <div className="ml-auto flex items-center space-x-2 md:space-x-4 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-blue-600 text-slate-700 hidden sm:block">Lookup</Link>
          <Link href="/compare" className="transition-colors hover:text-blue-600 text-slate-700">Compare</Link>
          <Link href="/courses" className="transition-colors hover:text-blue-600 text-slate-700">Courses</Link>
          <Link href="/rooms" className="transition-colors hover:text-blue-600 text-slate-700">Rooms</Link>
          <Link href="/timetable" className="transition-colors hover:text-blue-600 text-slate-700 hidden sm:block">Timetable</Link>
        </div>
      </div>
    </nav>
  );
}
