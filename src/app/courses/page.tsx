import { getAppData } from "@/lib/data";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import CourseSearch from "./CourseSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, AlertCircle } from "lucide-react";

export default function CoursesPage() {
  const data = getAppData();
  
  // Group courses by prefix (e.g. CS, EE, ME, CE, MA, PH, HS, etc.)
  const grouped: Record<string, string[]> = {};
  for (const c of data.courses) {
    const prefix = c.substring(0, 2).toUpperCase();
    if (!grouped[prefix]) grouped[prefix] = [];
    grouped[prefix].push(c);
  }

  const sortedPrefixes = Object.keys(grouped).sort();

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-1">
          Autumn 2026 End-Semester Examinations
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-blue-700" />
          <span>Course Examination Lookup</span>
        </h1>
        <p className="text-slate-600 mt-1">
          Search for any course to view its examination date, session timing, and room-wise seating allocation.
        </p>
      </div>

      <CourseSearch courses={data.courses} />

      {/* Unscheduled courses notice */}
      {data.unscheduledCourses && data.unscheduledCourses.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-950">Notice for Unscheduled Courses: </span>
            Courses <span className="font-mono font-bold">{data.unscheduledCourses.join(", ")}</span> are registered in the Course Wise List but do not have an allotted date or room in the central timetable. Please contact your respective department.
          </div>
        </div>
      )}

      {/* Department-wise Course Listings */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 border-b pb-2">
          All Courses by Department ({data.courses.length} courses)
        </h2>

        <div className="space-y-6">
          {sortedPrefixes.map((prefix) => (
            <Card key={prefix} className="shadow-sm border-slate-200">
              <CardHeader className="py-3 px-4 bg-slate-50 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-800">
                  {prefix} Series Courses
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {grouped[prefix].length} courses
                </Badge>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {grouped[prefix].map((c) => (
                    <Link key={c} href={`/courses/${encodeURIComponent(c)}`}>
                      <span
                        className="inline-flex items-center justify-center px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-mono font-medium rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 transition-colors shadow-2xs cursor-pointer"
                      >
                        {c}
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
