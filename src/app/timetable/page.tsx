import { getAppData } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";

export default function TimetablePage() {
  const data = getAppData();

  // Group exams by date and slot
  const byDate: Record<string, { morning: string[]; evening: string[] }> = {};

  // Initialize all 9 valid exam dates
  for (const date of data.examDates) {
    byDate[date] = { morning: [], evening: [] };
  }

  // Populate from exams
  Object.values(data.exams).forEach((exam) => {
    if (!byDate[exam.date]) {
      byDate[exam.date] = { morning: [], evening: [] };
    }
    if (exam.slot === "Morning") {
      if (!byDate[exam.date].morning.includes(exam.courseCode)) {
        byDate[exam.date].morning.push(exam.courseCode);
      }
    } else {
      if (!byDate[exam.date].evening.includes(exam.courseCode)) {
        byDate[exam.date].evening.push(exam.courseCode);
      }
    }
  });

  // Sort dates chronologically
  const sortedDates = Object.keys(byDate).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="border-b pb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-1">
          Complete Schedule
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Calendar className="h-8 w-8 text-blue-700" />
          <span>Autumn 2026 End-Semester Timetable</span>
        </h1>
        <p className="text-slate-600 mt-1">
          Day-wise schedule for all 9 examination dates across Morning and Evening sessions.
        </p>
      </div>

      {/* Session Timings Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="h-5 w-5 text-blue-700" />
            <div>
              <span className="font-bold text-blue-950 text-sm block">Morning Session</span>
              <span className="text-xs text-blue-800">First examination session of the day</span>
            </div>
          </div>
          <Badge className="bg-blue-600 text-white font-mono text-xs">9:30 AM – 12:30 PM</Badge>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="h-5 w-5 text-indigo-700" />
            <div>
              <span className="font-bold text-indigo-950 text-sm block">Evening Session</span>
              <span className="text-xs text-indigo-800">Second examination session of the day</span>
            </div>
          </div>
          <Badge className="bg-indigo-600 text-white font-mono text-xs">3:00 PM – 6:00 PM</Badge>
        </div>
      </div>

      {/* Timetable Cards */}
      <div className="space-y-6">
        {sortedDates.map((date, idx) => {
          // Check if 24 Nov (holiday) should be rendered between 23 Nov and 25 Nov
          const showHolidayNotice = date.includes("23 November");

          return (
            <div key={date} className="space-y-6">
              <Card className="shadow-sm border-t-4 border-t-blue-600 overflow-hidden">
                <CardHeader className="bg-slate-50 border-b py-3 px-6 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                      Day {idx + 1}
                    </span>
                    <CardTitle className="text-xl font-bold text-slate-900">
                      {date}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="bg-white font-medium text-xs">
                    {byDate[date].morning.length + byDate[date].evening.length} Course Events
                  </Badge>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                    {/* Morning Slot */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h3 className="font-bold text-blue-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                          <span>Morning Session</span>
                        </h3>
                        <Badge variant="default" className="bg-blue-600 text-white text-xs">
                          9:30 AM – 12:30 PM
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {byDate[date].morning.length > 0 ? (
                          byDate[date].morning.sort().map((c) => (
                            <Link key={c} href={`/courses/${encodeURIComponent(c)}`}>
                              <Badge
                                variant="outline"
                                className="px-2.5 py-1 text-xs font-mono font-medium cursor-pointer bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 transition-colors shadow-2xs"
                              >
                                {c}
                              </Badge>
                            </Link>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No examinations scheduled</span>
                        )}
                      </div>
                    </div>

                    {/* Evening Slot */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h3 className="font-bold text-indigo-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                          <span>Evening Session</span>
                        </h3>
                        <Badge variant="secondary" className="bg-indigo-600 text-white text-xs">
                          3:00 PM – 6:00 PM
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {byDate[date].evening.length > 0 ? (
                          byDate[date].evening.sort().map((c) => (
                            <Link key={c} href={`/courses/${encodeURIComponent(c)}`}>
                              <Badge
                                variant="outline"
                                className="px-2.5 py-1 text-xs font-mono font-medium cursor-pointer bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-400 transition-colors shadow-2xs"
                              >
                                {c}
                              </Badge>
                            </Link>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No examinations scheduled</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Institute Holiday Note inserted after 23 Nov */}
              {showHolidayNotice && (
                <div className="p-4 rounded-xl bg-amber-50/80 border border-dashed border-amber-300 text-amber-900 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-200 text-amber-900">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-bold text-amber-950 text-sm block">
                      24 November 2026: Guru Nanak Jayanti
                    </span>
                    <span className="text-xs text-amber-800">
                      Institute Holiday &bull; No examinations scheduled on this date.
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
