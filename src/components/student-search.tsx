"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

interface StudentSearchProps {
  students: string[];
}

export function StudentSearch({ students }: StudentSearchProps) {
  const [roll, setRoll] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleInputChange = (val: string) => {
    setRoll(val);
    setErrorMessage("");
    const trimmed = val.trim().toUpperCase();
    if (trimmed.length >= 2) {
      const matches = students
        .filter((s) => s.toUpperCase().includes(trimmed))
        .slice(0, 8);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const executeSearch = (targetRoll: string) => {
    const trimmed = targetRoll.trim().toUpperCase();
    if (!trimmed) return;

    // Check if exact match exists
    const exact = students.find((s) => s.toUpperCase() === trimmed);
    if (exact) {
      router.push(`/student/${encodeURIComponent(exact)}`);
      return;
    }

    // Check partial matches
    const partials = students.filter((s) => s.toUpperCase().includes(trimmed));
    if (partials.length === 1) {
      router.push(`/student/${encodeURIComponent(partials[0])}`);
    } else if (partials.length > 1) {
      setSuggestions(partials.slice(0, 10));
      setErrorMessage(`Found ${partials.length} matching students. Please select your registration number:`);
    } else {
      setSuggestions([]);
      setErrorMessage(`No examination record found for registration number "${targetRoll}". Please verify your roll number (e.g. 2301ME42, 2501CE01).`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(roll);
  };

  return (
    <div className="w-full space-y-3">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 relative">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Enter Student Roll No (e.g. 2301ME42, 2501CE01)..."
            className="pl-11 h-12 text-base md:text-lg bg-white border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
            value={roll}
            onChange={(e) => handleInputChange(e.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-sm"
        >
          Search Schedule
        </Button>
      </form>

      {/* Real-time suggestions or matches */}
      {suggestions.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden divide-y divide-slate-100 z-20">
          <div className="px-4 py-2 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between">
            <span>Matching Students ({suggestions.length})</span>
            <span className="text-[11px] text-slate-400 lowercase">click to view schedule</span>
          </div>
          {suggestions.map((s) => (
            <Link
              key={s}
              href={`/student/${encodeURIComponent(s)}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-slate-800 group-hover:text-blue-700 font-mono">
                  {s}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                <span>View Timetable</span>
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
