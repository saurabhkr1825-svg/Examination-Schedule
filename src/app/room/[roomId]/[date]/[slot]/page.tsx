import { getRoomStudents } from "@/lib/data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function RoomPage({
  params,
  searchParams
}: {
  params: Promise<{ roomId: string, date: string, slot: string }>,
  searchParams: Promise<{ course?: string }>
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const roomId = decodeURIComponent(resolvedParams.roomId);
  const date = decodeURIComponent(resolvedParams.date);
  const slot = decodeURIComponent(resolvedParams.slot);
  const courseFilter = resolvedSearchParams.course;
  
  const data = getRoomStudents(roomId, date, slot, courseFilter);
  
  if (!data) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Room Allocation Not Found</h1>
        <p className="text-slate-600 mb-6">Could not find allocation for {roomId} on {date} ({slot})</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="shadow-sm border-t-4 border-t-blue-600">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                Room: {roomId}
              </CardTitle>
              <p className="text-slate-600 mt-1">{date} &bull; {slot}</p>
            </div>
            {courseFilter && (
              <Badge variant="secondary" className="text-sm px-3 py-1 bg-blue-100 text-blue-800">
                Course: {courseFilter}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-4">
            <h3 className="font-semibold text-lg text-slate-800 mb-4 border-b pb-2">Assigned Students</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {data.students.map((sa, idx) => (
                <div key={idx} className="bg-slate-100 px-4 py-2 rounded border border-slate-200 text-center font-medium text-slate-700">
                  {sa.rollNo}
                  {!courseFilter && <span className="block text-xs font-normal text-slate-500">{sa.courseCode}</span>}
                </div>
              ))}
            </div>
            {data.students.length === 0 && (
              <p className="text-slate-500 italic">No students assigned for this filter.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
