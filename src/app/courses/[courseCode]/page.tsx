import { getCourseExams, getAppData } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, AlertCircle, ArrowLeft } from "lucide-react";

export default async function CoursePage({ params }: { params: Promise<{ courseCode: string }> }) {
  const resolvedParams = await params;
  const courseCode = decodeURIComponent(resolvedParams.courseCode).trim().toUpperCase();
  const data = getAppData();

  // Check if this is an unscheduled course (CB5103, EP4105, PH001)
  const isUnscheduled = data.unscheduledCourses?.includes(courseCode);

  const exams = getCourseExams(courseCode);

  if ((!exams || exams.length === 0) && !isUnscheduled) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <div className="p-4 bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-slate-500">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-800">Course Not Found</h1>
          <p className="text-slate-600">
            No examination record found for course{" "}
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              {courseCode}
            </span>
          </p>
        </div>
        <div className="pt-2">
          <Link href="/courses">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to All Courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Handle unscheduled courses specifically
  if (isUnscheduled && (!exams || exams.length === 0)) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-6">
        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 block mb-1">
              Unscheduled Course Notice
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 font-mono">
              {courseCode}
            </h1>
          </div>
          <Link href="/courses">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" /> All Courses
            </Button>
          </Link>
        </div>

        <div className="p-6 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-3">
          <div className="flex items-center gap-2 font-bold text-amber-900 text-lg">
            <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
            <span>Course Not Confirmed in Central Timetable</span>
          </div>
          <p className="text-sm text-amber-900 leading-relaxed">
            Course <strong className="font-mono">{courseCode}</strong> is present in the official Course Wise List registration records, but has not been allocated an examination date, slot, or room in the Autumn 2026 End-Semester Examination timetable.
          </p>
          <p className="text-xs text-amber-800">
            Students enrolled in this course are advised to contact the respective course instructor or academic office for information regarding practical exams, presentations, or alternative evaluations.
          </p>
        </div>
      </div>
    );
  }

  // Total students enrolled in this course across assignments
  const totalEnrolled = data.studentAssignments.filter(sa => {
    const c = sa.courseCode.toUpperCase().trim();
    return c === courseCode || c.split('/').map(s => s.trim()).includes(courseCode);
  }).length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-1">
            Autumn 2026 End-Semester Examination
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Course:</span>
            <span className="font-mono text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
              {courseCode}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm py-1.5 px-3 bg-white">
            <Users className="h-4 w-4 mr-1.5 text-blue-600" />
            {totalEnrolled} Students
          </Badge>
          <Link href="/courses">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
              <ArrowLeft className="h-3.5 w-3.5" /> All Courses
            </Button>
          </Link>
        </div>
      </div>

      {/* Exam Details */}
      <div className="space-y-8">
        {exams.map(({ exam, allocations }) => {
          // Check if this exam has "Room not assigned" (EE6103/EE6117)
          const unassignedStudents = data.studentAssignments.filter(sa => 
            (sa.courseCode.toUpperCase() === courseCode || sa.courseCode.split('/').map(s => s.trim().toUpperCase()).includes(courseCode)) &&
            sa.roomId === "Room not assigned in source timetable"
          );

          return (
            <Card key={exam.id} className="shadow-sm border-t-4 border-t-blue-600">
              <CardHeader className="bg-slate-50 border-b pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-xl font-bold text-slate-900">
                        {exam.date}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>{exam.time}</span>
                    </div>
                  </div>
                  <Badge variant={exam.slot === 'Morning' ? 'default' : 'secondary'} className="text-sm py-1 px-3 self-start sm:self-center">
                    {exam.slot} Session
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Special case: Room not assigned in source timetable (EE6103/EE6117) */}
                {unassignedStudents.length > 0 && allocations.length === 0 && (
                  <div className="p-6 space-y-4">
                    <div className="p-4 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 flex items-start gap-2.5">
                      <AlertCircle className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-purple-950">Room not assigned in source timetable</p>
                        <p className="text-xs text-purple-800 mt-1">
                          The examination is confirmed for {exam.date} ({exam.slot} Session, {exam.time}). Seating room was omitted from the source timetable. Contact your course instructor.
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Registered Students ({unassignedStudents.length})
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {unassignedStudents.map(sa => (
                          <Link key={sa.rollNo} href={`/student/${encodeURIComponent(sa.rollNo)}`}>
                            <div className="bg-slate-100 hover:bg-blue-50 hover:border-blue-300 p-2 rounded border border-slate-200 text-center font-mono font-medium text-xs text-slate-700 transition-colors cursor-pointer">
                              {sa.rollNo}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Normal room allocations */}
                <div className="divide-y divide-slate-100">
                  {allocations.map((alloc, idx) => {
                    // Match students taking this course (or subpart) in this room
                    const studentsInRoom = data.studentAssignments.filter(sa => 
                      sa.roomId.toUpperCase().trim() === alloc.roomId.toUpperCase().trim() &&
                      (sa.courseCode.toUpperCase().trim() === courseCode || 
                       sa.courseCode.split('/').map(s => s.trim().toUpperCase()).includes(courseCode) ||
                       sa.courseCode.toUpperCase().trim() === exam.courseCode.toUpperCase().trim()) &&
                      (data.exams[sa.examId]?.date === exam.date || alloc.examIds.includes(sa.examId))
                    );

                    return (
                      <div key={idx} className="p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-bold text-slate-900">
                              Room:{" "}
                              <Link 
                                href={`/room/${encodeURIComponent(alloc.roomId)}/${encodeURIComponent(exam.date)}/${encodeURIComponent(exam.slot)}?course=${encodeURIComponent(courseCode)}`}
                                className="text-blue-600 hover:underline hover:text-blue-800"
                              >
                                {alloc.roomId}
                              </Link>
                            </h3>
                          </div>
                          <Badge variant="outline" className="self-start sm:self-center bg-slate-50 font-semibold">
                            {studentsInRoom.length} Students Allocated
                          </Badge>
                        </div>

                        {studentsInRoom.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                            {studentsInRoom.map(sa => (
                              <Link key={sa.rollNo} href={`/student/${encodeURIComponent(sa.rollNo)}`}>
                                <div className="bg-slate-50 hover:bg-blue-50 hover:border-blue-300 p-2 rounded border border-slate-200 text-center font-mono font-medium text-xs text-slate-800 transition-colors cursor-pointer shadow-2xs">
                                  {sa.rollNo}
                                </div>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 italic">No assigned students found for this course in this room.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
