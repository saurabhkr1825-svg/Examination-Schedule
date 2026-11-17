import { getAppData } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-12">
      {/* Top Banner / Heading */}
      <div className="border-b pb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-1">
          Complete Schedule
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Calendar className="h-7 w-7 sm:h-8 sm:w-8 text-blue-700 shrink-0" />
          <span>Autumn 2026 End-Semester Timetable</span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-1">
          Day-wise schedule for all 9 examination dates across Morning and Evening sessions.
        </p>
      </div>

      {/* Session Timings Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <Clock className="h-5 w-5 text-blue-700 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-blue-950 text-sm block leading-tight">Morning Session</span>
              <span className="text-xs text-blue-800 block truncate">First examination session of the day</span>
            </div>
          </div>
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-blue-600 text-white font-mono text-xs font-semibold whitespace-nowrap shadow-2xs shrink-0">
            9:30 AM – 12:30 PM
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <Clock className="h-5 w-5 text-indigo-700 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-indigo-950 text-sm block leading-tight">Evening Session</span>
              <span className="text-xs text-indigo-800 block truncate">Second examination session of the day</span>
            </div>
          </div>
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-indigo-600 text-white font-mono text-xs font-semibold whitespace-nowrap shadow-2xs shrink-0">
            3:00 PM – 6:00 PM
          </span>
        </div>
      </div>

      {/* Timetable Cards */}
      <div className="space-y-6">
        {sortedDates.map((date, idx) => {
          const weekday = WEEKDAYS[new Date(date).getDay()];
          const showHolidayNotice = date.includes("23 November");
          const totalEvents = byDate[date].morning.length + byDate[date].evening.length;

          return (
            <div key={date} className="space-y-6">
              <Card className="shadow-sm border-t-4 border-t-blue-600 overflow-hidden">
                {/* Responsive Date Card Header */}
                <CardHeader className="bg-slate-50/90 border-b py-3 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Centered Weekday Pill Badge */}
                    <span 
                      aria-label={`Weekday: ${weekday}`} 
                      className="inline-flex items-center justify-center min-w-10 px-2.5 py-1 rounded-full bg-blue-600 text-white text-xs font-bold tracking-wide shrink-0 shadow-2xs"
                    >
                      {weekday}
                    </span>
                    <div className="min-w-0 flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                        {date}
                      </CardTitle>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded border border-slate-300/60 shrink-0">
                        Day {idx + 1}
                      </span>
                    </div>
                  </div>
                  
                  {/* Course Event Count Badge */}
                  <div className="flex items-center self-start sm:self-auto pl-0.5 sm:pl-0">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white text-slate-700 border border-slate-300 shadow-2xs whitespace-nowrap">
                      {totalEvents} Course Events
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                    {/* Morning Slot */}
                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                        <h3 className="font-bold text-blue-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                          <span>Morning Session</span>
                        </h3>
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-blue-600 text-white font-mono text-xs font-semibold whitespace-nowrap shadow-2xs">
                          9:30 AM – 12:30 PM
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {byDate[date].morning.length > 0 ? (
                          byDate[date].morning.sort().map((c) => (
                            <Link key={c} href={`/courses/${encodeURIComponent(c)}`}>
                              <span
                                className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 transition-colors shadow-2xs cursor-pointer"
                              >
                                {c}
                              </span>
                            </Link>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No examinations scheduled</span>
                        )}
                      </div>
                    </div>

                    {/* Evening Slot */}
                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                        <h3 className="font-bold text-indigo-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                          <span>Evening Session</span>
                        </h3>
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-indigo-600 text-white font-mono text-xs font-semibold whitespace-nowrap shadow-2xs">
                          3:00 PM – 6:00 PM
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {byDate[date].evening.length > 0 ? (
                          byDate[date].evening.sort().map((c) => (
                            <Link key={c} href={`/courses/${encodeURIComponent(c)}`}>
                              <span
                                className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-400 transition-colors shadow-2xs cursor-pointer"
                              >
                                {c}
                              </span>
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
                <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/90 border border-dashed border-amber-300 text-amber-900 flex items-start sm:items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-200 text-amber-900 shrink-0 mt-0.5 sm:mt-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-bold text-amber-950 text-sm block">
                      24 November 2026: Guru Nanak Jayanti
                    </span>
                    <span className="text-xs text-amber-800 block">
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
