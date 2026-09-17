import { getAppData } from "@/lib/data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function RoomsPage({ searchParams }: { searchParams: Promise<{ room?: string, date?: string, slot?: string, course?: string }> }) {
  const resolvedParams = await searchParams;
  const data = getAppData();
  
  const roomQ = (resolvedParams.room || "").toUpperCase();
  const dateQ = resolvedParams.date || "";
  const slotQ = resolvedParams.slot || "";
  const courseQ = (resolvedParams.course || "").toUpperCase();

  let filtered = data.roomAllocations;
  if (roomQ) filtered = filtered.filter(ra => ra.roomId.toUpperCase().includes(roomQ));
  if (dateQ) filtered = filtered.filter(ra => ra.date.includes(dateQ));
  if (slotQ) filtered = filtered.filter(ra => ra.slot.toLowerCase() === slotQ.toLowerCase());
  if (courseQ) filtered = filtered.filter(ra => ra.courses.some(c => c.toUpperCase().includes(courseQ)));

  // Extract unique dates and slots for dropdowns (or just use text inputs for simplicity, we'll use text inputs here)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Room Wise Search</h1>
      
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <form action="/rooms" method="GET" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Room</label>
              <Input name="room" defaultValue={roomQ} placeholder="e.g. 102" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Date</label>
              <Input name="date" defaultValue={dateQ} placeholder="e.g. 21 September" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Slot</label>
              <Input name="slot" defaultValue={slotQ} placeholder="Morning/Evening" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Course</label>
              <Input name="course" defaultValue={courseQ} placeholder="e.g. CE2101" />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full">
              <Search className="h-4 w-4 mr-2" /> Filter
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {filtered.length === 0 ? (
          <p className="text-slate-500 italic text-center py-8">No room allocations match your filters.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((ra, idx) => (
              <Card key={idx} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-slate-50 border-b pb-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold text-slate-800">
                      {ra.roomId}
                    </CardTitle>
                    <Badge variant={ra.slot === 'Morning' ? 'default' : 'secondary'}>
                      {ra.slot}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-slate-600 mt-1">{ra.date}</p>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Courses</span>
                    <div className="flex flex-wrap gap-1">
                      {ra.courses.map(c => (
                        <Badge key={c} variant="outline" className="text-xs bg-white">{c}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Students Assigned</span>
                    <span className="text-2xl font-bold text-slate-800">{ra.rolls.length}</span>
                  </div>
                  <Link href={`/room/${encodeURIComponent(ra.roomId)}/${encodeURIComponent(ra.date)}/${encodeURIComponent(ra.slot)}`} className="block">
                    <Button variant="secondary" className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">
                      View Room Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
