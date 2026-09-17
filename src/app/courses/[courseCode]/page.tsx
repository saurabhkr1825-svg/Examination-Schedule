import { getCourseExams, getAppData } from "@/lib/data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CoursePage({ params }: { params: Promise<{ courseCode: string }> }) {
  const resolvedParams = await params;
  const courseCode = decodeURIComponent(resolvedParams.courseCode).toUpperCase();
  const exams = getCourseExams(courseCode);
  
  if (!exams || exams.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Course Not Found</h1>
        <p className="text-slate-600 mb-6">No exam records found for course {courseCode}</p>
        <Link href="/courses">
          <Button variant="outline">Back to Courses</Button>
        </Link>
      </div>
    );
  }

  const data = getAppData();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Course: <span className="text-blue-600">{courseCode}</span>
        </h1>
        <Link href="/courses">
          <Button variant="outline">All Courses</Button>
        </Link>
      </div>
      
      <div className="space-y-8">
        {exams.map(({ exam, allocations }) => (
          <Card key={exam.id} className="shadow-sm border-t-4 border-t-blue-600">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800">
                    {exam.date}
                  </CardTitle>
                  <p className="text-slate-600 mt-1">{exam.time}</p>
                </div>
                <Badge variant={exam.slot === 'Morning' ? 'default' : 'secondary'} className="text-base py-1 px-3">
                  {exam.slot}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {allocations.map((alloc, idx) => {
                  // We need to show only students from THIS course in this room
                  // The room allocation has rolls, but those could be for other courses too.
                  // We can query student assignments.
                  const studentsInRoom = data.studentAssignments.filter(sa => 
                    sa.roomId === alloc.roomId && 
                    sa.examId === exam.id &&
                    sa.courseCode === exam.courseCode
                  );
                  
                  return (
                    <div key={idx} className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800">
                          Room: <Link href={`/room/${encodeURIComponent(alloc.roomId)}/${encodeURIComponent(exam.date)}/${encodeURIComponent(exam.slot)}?course=${encodeURIComponent(exam.courseCode)}`} className="text-blue-600 hover:underline">{alloc.roomId}</Link>
                        </h3>
                        <Badge variant="outline">{studentsInRoom.length} Students</Badge>
                      </div>
                      
                      {studentsInRoom.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
                          {studentsInRoom.map(sa => (
                            <Link key={sa.rollNo} href={`/student/${encodeURIComponent(sa.rollNo)}`}>
                              <div className="bg-slate-100 px-3 py-1.5 rounded border border-slate-200 text-center font-medium text-slate-700 text-sm hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer">
                                {sa.rollNo}
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 italic">No assigned students found for this specific course in this room (or mismatch).</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
