import { getAppData } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function TimetablePage() {
  const data = getAppData();
  
  // Group exams by date
  const byDate: Record<string, { morning: string[], evening: string[] }> = {};
  
  Object.values(data.exams).forEach(exam => {
    if (!byDate[exam.date]) {
      byDate[exam.date] = { morning: [], evening: [] };
    }
    if (exam.slot === 'Morning') {
      if (!byDate[exam.date].morning.includes(exam.courseCode)) {
        byDate[exam.date].morning.push(exam.courseCode);
      }
    } else {
      if (!byDate[exam.date].evening.includes(exam.courseCode)) {
        byDate[exam.date].evening.push(exam.courseCode);
      }
    }
  });

  // Sort dates (convert back to Date object for proper sorting)
  const sortedDates = Object.keys(byDate).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Full Timetable</h1>
      <p className="text-slate-600">Autumn 2026 Mid-Semester Examination</p>

      <div className="space-y-8">
        {sortedDates.map((date) => (
          <Card key={date} className="shadow-sm border-t-4 border-t-blue-600">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-xl font-bold text-slate-800">
                {date}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                {/* Morning Slot */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-700 uppercase tracking-wider text-sm">Morning</h3>
                    <Badge variant="default">10:30 AM – 12:30 PM</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {byDate[date].morning.length > 0 ? (
                      byDate[date].morning.sort().map(c => (
                        <Link key={c} href={`/courses/${encodeURIComponent(c)}`}>
                          <Badge variant="outline" className="px-2 py-1 cursor-pointer hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors">
                            {c}
                          </Badge>
                        </Link>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400 italic">No exams</span>
                    )}
                  </div>
                </div>

                {/* Evening Slot */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-700 uppercase tracking-wider text-sm">Evening</h3>
                    <Badge variant="secondary">3:30 PM – 5:30 PM</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {byDate[date].evening.length > 0 ? (
                      byDate[date].evening.sort().map(c => (
                        <Link key={c} href={`/courses/${encodeURIComponent(c)}`}>
                          <Badge variant="outline" className="px-2 py-1 cursor-pointer hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors">
                            {c}
                          </Badge>
                        </Link>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400 italic">No exams</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
