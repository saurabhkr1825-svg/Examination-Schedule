import { getAppData } from "@/lib/data";
import { ExamCountdown } from "@/components/countdown";
import { StudentSearch } from "@/components/student-search";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { 
  Calendar, 
  BookOpen, 
  Building2, 
  Users, 
  Clock, 
  ArrowRight, 
  AlertTriangle,
  Sparkles
} from "lucide-react";

export default function Home() {
  const data = getAppData();

  // Statistics
  const totalDates = data.examDates.length; // 9
  const totalCourses = Object.keys(data.exams).length; // 247
  const totalRooms = data.rooms.length; // 26
  const totalStudents = data.students.length; // 3,523

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top Banner / Countdown */}
      <ExamCountdown dates={data.examDates} />

      {/* Main Hero & Student Search */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 md:p-10 shadow-sm border border-slate-200/80 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          Official Examination Portal
        </div>

        <div className="space-y-2 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Autumn 2026
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-blue-700">
            End-Semester Examinations
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Find your personalized examination schedule, assigned exam hall, session timings, and compare schedules with peers.
          </p>
        </div>

        {/* Student Search Box */}
        <div className="max-w-xl mx-auto pt-2">
          <StudentSearch students={data.students} />
        </div>

        {/* Examination Timings Notice */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto pt-2 text-left">
          <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-600 shrink-0" />
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 block">Morning Session</span>
              <span className="text-sm font-bold text-slate-900">9:30 AM – 12:30 PM</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-100 flex items-center gap-3">
            <Clock className="h-5 w-5 text-indigo-600 shrink-0" />
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-800 block">Evening Session</span>
              <span className="text-sm font-bold text-slate-900">3:00 PM – 6:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span>Examination Highlights</span>
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-700">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Exam Dates</p>
                <p className="text-2xl font-extrabold text-slate-900">{totalDates}</p>
                <p className="text-[11px] text-slate-500">21 Nov &ndash; 30 Nov</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-100 text-indigo-700">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Courses</p>
                <p className="text-2xl font-extrabold text-slate-900">{totalCourses}</p>
                <p className="text-[11px] text-slate-500">Scheduled events</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Exam Rooms</p>
                <p className="text-2xl font-extrabold text-slate-900">{totalRooms}</p>
                <p className="text-[11px] text-slate-500">Halls & CC Labs</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-violet-100 text-violet-700">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Students</p>
                <p className="text-2xl font-extrabold text-slate-900">{totalStudents.toLocaleString()}</p>
                <p className="text-[11px] text-slate-500">Registered rolls</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/timetable" className="block group">
          <Card className="h-full border-slate-200 group-hover:border-blue-400 group-hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-700 font-bold">
                  <Calendar className="h-5 w-5" />
                  <span>Full Examination Timetable</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600 text-sm">
                View day-by-day examination schedules organized by Morning (9:30 AM – 12:30 PM) and Evening (3:00 PM – 6:00 PM) sessions across all 9 examination dates.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/courses" className="block group">
          <Card className="h-full border-slate-200 group-hover:border-blue-400 group-hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-700 font-bold">
                  <BookOpen className="h-5 w-5" />
                  <span>Course Lookup & Rooms</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600 text-sm">
                Search examination schedules by course code or title, and view allocated examination halls and student rolls.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/rooms" className="block group">
          <Card className="h-full border-slate-200 group-hover:border-blue-400 group-hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-700 font-bold">
                  <Building2 className="h-5 w-5" />
                  <span>Room-Wise Allocations</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600 text-sm">
                Filter and inspect seating allocations across all 26 examination rooms with date, slot, and course filtering.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/compare" className="block group">
          <Card className="h-full border-slate-200 group-hover:border-blue-400 group-hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-700 font-bold">
                  <Users className="h-5 w-5" />
                  <span>Peer Schedule Comparison</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600 text-sm">
                Compare your examination timetable with a classmate to discover common exams, shared dates, and identical room allocations.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Notices & Academic Calendar */}
      <div className="space-y-3">
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-amber-950">Important Examination Calendar Notes</p>
            <p className="text-amber-900">
              <strong className="font-semibold">24 November 2026:</strong> Guru Nanak Jayanti (Institute Holiday) &mdash; No examinations scheduled.
            </p>
            {data.unscheduledCourses && data.unscheduledCourses.length > 0 && (
              <p className="text-xs text-amber-800 pt-1">
                <span className="font-semibold">Unscheduled Courses Notice:</span> Courses{" "}
                <span className="font-mono font-medium">{data.unscheduledCourses.join(", ")}</span> are present in the course registration list but do not have confirmed slots in the central examination schedule. Affected students should contact their course instructor or academic office.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
