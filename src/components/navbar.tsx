"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  GraduationCap, 
  Menu, 
  X, 
  Search, 
  Calendar, 
  BookOpen, 
  Building2, 
  Users 
} from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Lookup", icon: Search },
  { href: "/timetable", label: "Timetable", icon: Calendar },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/rooms", label: "Rooms", icon: Building2 },
  { href: "/compare", label: "Compare", icon: Users },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Automatically reset mobile drawer when route changes (React 19 render-time adjustment)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="border-b bg-white/95 backdrop-blur-md shadow-2xs sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-3 sm:px-6">
        {/* Branding Area */}
        <Link 
          href="/" 
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-2 sm:gap-2.5 min-w-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-0.5 transition-opacity hover:opacity-90"
        >
          <div className="p-1.5 sm:p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 shrink-0 group-hover:bg-blue-100 group-hover:border-blue-300 transition-colors">
            <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <span className="tracking-tight text-sm xs:text-base sm:text-lg font-bold text-blue-700 block leading-tight truncate">
              IIT Patna Exam Portal
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider block leading-tight">
              Autumn 2026 End-Sem
            </span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-semibold">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  isActive 
                    ? "bg-blue-50 text-blue-700 font-bold" 
                    : "text-slate-700 hover:text-blue-700 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-700 hover:text-blue-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer / Dropdown */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white shadow-lg animate-in slide-in-from-top-1 duration-150">
          <div className="container mx-auto px-3 py-3 space-y-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                      : "text-slate-700 hover:bg-slate-100 hover:text-blue-700"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-blue-700" : "text-slate-400"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between px-3 text-[11px] text-slate-500">
              <span>Exam Sessions: 9:30 AM & 3:00 PM</span>
              <span className="font-semibold text-blue-600">21–30 Nov 2026</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
