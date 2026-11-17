import { getRoomStudents } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, Clock, ArrowLeft, Users } from "lucide-react";

export default async function RoomPage({
  params,
  searchParams
}: {
  params: Promise<{ roomId: string; date: string; slot: string }>;
  searchParams: Promise<{ course?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const roomId = decodeURIComponent(resolvedParams.roomId).trim();
  const date = decodeURIComponent(resolvedParams.date).trim();
  const slot = decodeURIComponent(resolvedParams.slot).trim();
  const courseFilter = resolvedSearchParams.course ? decodeURIComponent(resolvedSearchParams.course).trim().toUpperCase() : undefined;

  const data = getRoomStudents(roomId, date, slot, courseFilter);

  if (!data) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Room Allocation Not Found</h1>
        <p className="text-slate-600">
          Could not find seating allocation for Room <span className="font-mono font-bold">{roomId}</span> on {date} ({slot} session).
        </p>
        <Link href="/rooms">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Rooms
          </Button>
        </Link>
      </div>
    );
  }

  // Session time
  const time = slot.toLowerCase() === "morning" ? "9:30 AM – 12:30 PM" : "3:00 PM – 6:00 PM";

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-1">
            Autumn 2026 End-Semester Room Allocation
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-700" />
            <span>Room {roomId}</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1 flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="h-4 w-4 text-slate-400" /> {date}
            </span>
            &bull;
            <span className="flex items-center gap-1 font-medium">
              <Clock className="h-4 w-4 text-slate-400" /> {slot} ({time})
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/rooms">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
              <ArrowLeft className="h-3.5 w-3.5" /> All Rooms
            </Button>
          </Link>
        </div>
      </div>

      {/* Courses in this room */}
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Allocated Courses:
            </span>
            {data.allocation.courses.map((c) => (
              <Link key={c} href={`/courses/${encodeURIComponent(c)}`}>
                <Badge
                  variant={courseFilter === c.toUpperCase() ? "default" : "outline"}
                  className="px-2.5 py-1 text-xs font-mono font-medium cursor-pointer"
                >
                  {c}
                </Badge>
              </Link>
            ))}
          </div>

          <Badge variant="outline" className="bg-slate-50 text-slate-700 text-xs px-3 py-1 font-semibold">
            <Users className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
            {data.students.length} Seated Students
          </Badge>
        </CardContent>
      </Card>

      {/* Student Seating Grid */}
      <Card className="shadow-sm border-t-4 border-t-blue-600">
        <CardHeader className="bg-slate-50 border-b pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-800">
            Seated Students {courseFilter ? `(Course ${courseFilter})` : ""}
          </CardTitle>
          {courseFilter && (
            <Link href={`/room/${encodeURIComponent(roomId)}/${encodeURIComponent(date)}/${encodeURIComponent(slot)}`}>
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-7 px-2">
                Show All Courses
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent className="p-6">
          {data.students.length === 0 ? (
            <p className="text-slate-500 italic text-center py-6">
              No students found for this room filter.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {data.students.map((sa, idx) => (
                <Link key={idx} href={`/student/${encodeURIComponent(sa.rollNo)}`}>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-colors text-center cursor-pointer shadow-2xs group">
                    <span className="font-mono font-bold text-slate-900 group-hover:text-blue-700 block text-xs sm:text-sm">
                      {sa.rollNo}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono block mt-0.5 truncate">
                      {sa.courseCode}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
