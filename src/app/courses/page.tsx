import { getAppData } from "@/lib/data";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import CourseSearch from "./CourseSearch";

export default function CoursesPage() {
  const data = getAppData();
  
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Course Lookup</h1>
      
      <CourseSearch />
      
      <div>
        <h2 className="text-xl font-semibold mb-4 text-slate-800">Available Courses</h2>
        <div className="flex flex-wrap gap-2">
          {data.courses.map((c) => (
            <Link key={c} href={`/courses/${encodeURIComponent(c)}`}>
              <Badge variant="outline" className="px-3 py-1 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors">
                {c}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
