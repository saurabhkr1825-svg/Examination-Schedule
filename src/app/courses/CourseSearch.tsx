"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ArrowRight } from "lucide-react";
import Link from "next/link";

interface CourseSearchProps {
  courses?: string[];
}

export default function CourseSearch({ courses = [] }: CourseSearchProps) {
  const [course, setCourse] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const router = useRouter();

  const handleInputChange = (val: string) => {
    setCourse(val);
    const trimmed = val.trim().toUpperCase();
    if (trimmed.length >= 2 && courses.length > 0) {
      const matches = courses
        .filter((c) => c.toUpperCase().includes(trimmed))
        .slice(0, 8);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (course.trim()) {
      router.push(`/courses/${encodeURIComponent(course.trim().toUpperCase())}`);
    }
  };

  return (
    <Card className="shadow-sm border-slate-200">
      <CardContent className="pt-6 space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              Search by Course Code
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <Input
                value={course}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="e.g. CE2101, EE1101, CS3101, MA5101..."
                className="pl-10 h-11 text-base bg-white border-slate-300"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full sm:w-auto h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            <Search className="h-4 w-4 mr-2" /> Find Course
          </Button>
        </form>

        {suggestions.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block px-1">
              Matching Courses:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <Link key={s} href={`/courses/${encodeURIComponent(s)}`}>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-slate-200 text-xs font-mono font-semibold text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer">
                    {s} <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
