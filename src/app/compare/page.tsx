import { compareStudents, Exam } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface CommonExamItem {
  exam: Exam;
  roll1Room: string;
  roll2Room: string;
  sameRoom: boolean;
}

interface StudentExamItem {
  exam: Exam;
  assignment: {
    rollNo: string;
    courseCode: string;
    examId: string;
    roomId: string;
  };
}

export default async function ComparePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ roll1?: string; roll2?: string }> 
}) {
  const resolvedParams = await searchParams;
  const roll1 = resolvedParams.roll1?.toUpperCase().trim() || "";
  const roll2 = resolvedParams.roll2?.toUpperCase().trim() || "";

  let result = null;
  let error = "";

  if (roll1 && roll2) {
    try {
      result = compareStudents(roll1, roll2);
    } catch {
      error = "An error occurred while comparing the two roll numbers. Please verify both exist.";
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="border-b pb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-1">
          Autumn 2026 End-Semester Examinations
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="h-8 w-8 text-blue-700" />
          <span>Compare Student Schedules</span>
        </h1>
        <p className="text-slate-600 mt-1">
          Enter two student roll numbers to discover shared exams, overlapping dates, and same room allocations.
        </p>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="pt-6">
          <form action="/compare" method="GET" className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 block">
                Student 1 Roll No
              </label>
              <Input
                name="roll1"
                defaultValue={roll1}
                placeholder="e.g. 2301ME42"
                required
                className="bg-white text-base"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 block">
                Student 2 Roll No
              </label>
              <Input
                name="roll2"
                defaultValue={roll2}
                placeholder="e.g. 2501CE01"
                required
                className="bg-white text-base"
              />
            </div>
            <Button type="submit" className="w-full md:w-auto h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              <Search className="h-4 w-4 mr-2" /> Compare
            </Button>
          </form>
          {error && <p className="text-red-600 mt-3 text-sm font-medium">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-8">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-4 text-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Common Exams
                </span>
                <span className="text-3xl font-extrabold text-blue-700 font-mono mt-1 block">
                  {result.counts.commonExams}
                </span>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-4 text-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Same Room
                </span>
                <span className="text-3xl font-extrabold text-emerald-600 font-mono mt-1 block">
                  {result.counts.sameRoom}
                </span>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-4 text-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Only {result.roll1}
                </span>
                <span className="text-3xl font-extrabold text-slate-700 font-mono mt-1 block">
                  {result.onlyRoll1.length}
                </span>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-4 text-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Only {result.roll2}
                </span>
                <span className="text-3xl font-extrabold text-slate-700 font-mono mt-1 block">
                  {result.onlyRoll2.length}
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Common Exams Table */}
          <Card className="shadow-sm border-t-4 border-t-blue-600">
            <CardHeader className="bg-slate-50 border-b pb-3">
              <CardTitle className="text-lg font-bold text-slate-900">
                Common Scheduled Examinations ({result.commonExams.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {result.commonExams.length === 0 ? (
                <p className="text-slate-500 italic p-6 text-center">
                  No common examinations found between {result.roll1} and {result.roll2}.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-bold">Course</TableHead>
                        <TableHead className="font-bold">Date & Time</TableHead>
                        <TableHead className="font-bold">Session</TableHead>
                        <TableHead className="font-bold">{result.roll1} Room</TableHead>
                        <TableHead className="font-bold">{result.roll2} Room</TableHead>
                        <TableHead className="font-bold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.commonExams.map((c: CommonExamItem, i: number) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono font-bold text-slate-900">
                            <Link href={`/courses/${encodeURIComponent(c.exam.courseCode)}`} className="text-blue-600 hover:underline">
                              {c.exam.courseCode}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div>{c.exam.date}</div>
                            <div className="text-xs text-slate-500">{c.exam.time}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={c.exam.slot === 'Morning' ? 'default' : 'secondary'} className="text-xs">
                              {c.exam.slot}
                            </Badge>
                          </TableCell>
                          <TableCell className={`font-mono ${c.sameRoom ? "font-bold text-emerald-700" : "font-medium text-slate-800"}`}>
                            {c.roll1Room}
                          </TableCell>
                          <TableCell className={`font-mono ${c.sameRoom ? "font-bold text-emerald-700" : "font-medium text-slate-800"}`}>
                            {c.roll2Room}
                          </TableCell>
                          <TableCell>
                            {c.sameRoom ? (
                              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 font-semibold text-xs">
                                SAME ROOM
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-amber-100 text-amber-900 hover:bg-amber-100 border border-amber-300 font-semibold text-xs">
                                DIFFERENT ROOMS
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Unique Exams Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50 border-b pb-3">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center justify-between">
                  <span>Exams Only for {result.roll1}</span>
                  <Badge variant="outline">{result.onlyRoll1.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {result.onlyRoll1.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">None</p>
                ) : (
                  result.onlyRoll1.map(({ exam, assignment }: StudentExamItem, i: number) => (
                    <div key={i} className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-slate-800 block">{assignment.courseCode}</span>
                        <span className="text-slate-500">{exam.date} ({exam.slot})</span>
                      </div>
                      <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {assignment.roomId}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50 border-b pb-3">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center justify-between">
                  <span>Exams Only for {result.roll2}</span>
                  <Badge variant="outline">{result.onlyRoll2.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {result.onlyRoll2.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">None</p>
                ) : (
                  result.onlyRoll2.map(({ exam, assignment }: StudentExamItem, i: number) => (
                    <div key={i} className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-slate-800 block">{assignment.courseCode}</span>
                        <span className="text-slate-500">{exam.date} ({exam.slot})</span>
                      </div>
                      <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {assignment.roomId}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
