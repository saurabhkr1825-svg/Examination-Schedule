import { getStudent, getStudentExams, searchStudents } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, MapPin, Calendar, ArrowLeft, Search, User } from "lucide-react";

export default async function StudentPage({ params }: { params: Promise<{ roll: string }> }) {
  const resolvedParams = await params;
  const decodedRoll = decodeURIComponent(resolvedParams.roll).trim().toUpperCase();
  const student = getStudent(decodedRoll);

  if (!student) {
    // Check partial matches to help student
    const partialMatches = searchStudents(decodedRoll, 12);

    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="p-4 bg-amber-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-amber-600">
          <User className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-800">Student Not Found</h1>
          <p className="text-slate-600">
            No examination record found for registration number{" "}
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              {decodedRoll}
            </span>
          </p>
        </div>

        {partialMatches.length > 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-left space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Did you mean one of these students? ({partialMatches.length} matches)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {partialMatches.map((m) => (
                <Link key={m} href={`/student/${encodeURIComponent(m)}`}>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-center font-mono font-semibold text-slate-800 hover:text-blue-700 transition-colors cursor-pointer text-sm">
                    {m}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Please make sure you entered your official IIT Patna roll number (e.g. 2301ME42, 2501CE01). If you believe this is an omission in the source timetable, contact the academic section.
          </p>
        )}

        <div className="pt-2">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const exams = getStudentExams(decodedRoll);

  // Check if any assignment has an explicit warning or if there are conflicting session slots
  const hasWarnings = exams.some(({ assignment }) => Boolean(assignment.warning));
  
  // Also detect overlapping exams on same date and slot
  const sessionSlots = new Map<string, string[]>();
  for (const { exam, assignment } of exams) {
    const key = `${exam.date}-${exam.slot}`;
    if (!sessionSlots.has(key)) sessionSlots.set(key, []);
    sessionSlots.get(key)!.push(`${assignment.courseCode} (${assignment.roomId})`);
  }
  const conflicts: string[] = [];
  for (const [key, list] of sessionSlots.entries()) {
    if (list.length > 1) {
      conflicts.push(`${key}: ${list.join(" vs ")}`);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-1">
            Autumn 2026 End-Semester Examination
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Roll No:</span>
            <span className="font-mono text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 text-2xl sm:text-3xl">
              {decodedRoll}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/compare?roll1=${encodeURIComponent(decodedRoll)}`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
              Compare with Peer
            </Button>
          </Link>
          <Link href="/">
            <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 gap-1.5 text-xs font-medium">
              <Search className="h-3.5 w-3.5" /> New Search
            </Button>
          </Link>
        </div>
      </div>

      {/* Warning banner for conflicting/duplicate exams (Mandatory Exception #2 e.g. 2301ME42) */}
      {(hasWarnings || conflicts.length > 0) && (
        <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <span>Timetable Anomaly / Conflict Notice for Student {decodedRoll}</span>
          </div>
          <p className="text-sm text-amber-900">
            This student record in the source examination schedule contains overlapping sessions or duplicate room allocations. Both original allocations are preserved below as published in the source workbook:
          </p>
          <ul className="list-disc list-inside text-xs font-mono space-y-1 text-amber-950 pl-2">
            {conflicts.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
          <p className="text-xs text-amber-800 italic pt-1">
            * Please report to the Academic/Examination Section for official slot and room resolution.
          </p>
        </div>
      )}

      {/* Exams list */}
      {exams.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-slate-500">
            No examinations found for this student.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {exams.map(({ exam, assignment }, idx) => {
            const isUnassigned = assignment.roomId === "Room not assigned in source timetable";
            const isWarning = Boolean(assignment.warning);

            return (
              <Card 
                key={`${assignment.courseCode}-${assignment.examId}-${assignment.roomId}-${idx}`}
                className={`shadow-sm hover:shadow-md transition-shadow border-l-4 ${
                  isWarning ? "border-l-amber-500 bg-amber-50/20" : isUnassigned ? "border-l-purple-500" : "border-l-blue-600"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-800 font-mono">
                        {assignment.courseCode}
                      </CardTitle>
                      {exam.courseCode !== assignment.courseCode && (
                        <span className="text-xs text-slate-500 block mt-0.5">
                          Exam Group: {exam.courseCode}
                        </span>
                      )}
                    </div>
                    <Badge variant={exam.slot === 'Morning' ? 'default' : 'secondary'} className="text-xs px-2.5 py-0.5">
                      {exam.slot}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                      <span><strong className="text-slate-700">Date:</strong> {exam.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                      <span><strong className="text-slate-700">Time:</strong> {exam.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>
                        <strong className="text-slate-700">Room:</strong>{" "}
                        {isUnassigned ? (
                          <span className="text-purple-700 font-medium italic">Room not assigned in source timetable</span>
                        ) : (
                          <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {assignment.roomId}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {assignment.warning && (
                    <div className="p-2 rounded bg-amber-100/70 border border-amber-300 text-amber-900 text-xs">
                      {assignment.warning}
                    </div>
                  )}

                  {!isUnassigned && (
                    <Link
                      href={`/room/${encodeURIComponent(assignment.roomId)}/${encodeURIComponent(exam.date)}/${encodeURIComponent(exam.slot)}?course=${encodeURIComponent(assignment.courseCode)}`}
                      className="block"
                    >
                      <Button variant="secondary" className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold">
                        View Room Seating Plan
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
