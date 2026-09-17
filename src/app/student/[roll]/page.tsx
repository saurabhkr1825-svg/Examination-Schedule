import { getStudent, getStudentExams } from "@/lib/data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function StudentPage({ params }: { params: Promise<{ roll: string }> }) {
  const resolvedParams = await params;
  const decodedRoll = decodeURIComponent(resolvedParams.roll).toUpperCase();
  const student = getStudent(decodedRoll);
  
  if (!student) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Student Not Found</h1>
        <p className="text-slate-600 mb-6">No exam records found for roll number {decodedRoll}</p>
        <Link href="/">
          <Button variant="outline">Back to Search</Button>
        </Link>
      </div>
    );
  }

  const exams = getStudentExams(decodedRoll);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Exam Schedule: <span className="text-blue-600">{decodedRoll}</span>
        </h1>
        <Link href="/">
          <Button variant="outline">New Search</Button>
        </Link>
      </div>
      
      {exams.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-slate-500">
            No exams found for this student.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {exams.map(({ exam, assignment }) => (
            <Card key={exam.id} className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold text-slate-800">
                    {exam.courseCode}
                  </CardTitle>
                  <Badge variant={exam.slot === 'Morning' ? 'default' : 'secondary'}>
                    {exam.slot}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1 text-sm text-slate-600">
                  <p><span className="font-semibold text-slate-700">Date:</span> {exam.date}</p>
                  <p><span className="font-semibold text-slate-700">Time:</span> {exam.time}</p>
                  <p><span className="font-semibold text-slate-700">Room:</span> <span className="font-bold text-slate-900">{assignment.roomId}</span></p>
                </div>
                {assignment.roomId !== 'Room not assigned in source timetable' && (
                  <Link href={`/room/${encodeURIComponent(assignment.roomId)}/${encodeURIComponent(exam.date)}/${encodeURIComponent(exam.slot)}?course=${encodeURIComponent(exam.courseCode)}`} className="block">
                    <Button variant="secondary" className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">
                      View Room
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
