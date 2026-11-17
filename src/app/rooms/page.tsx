import { getAppData } from "@/lib/data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Building2, Calendar, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function RoomsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ room?: string; date?: string; slot?: string; course?: string }> 
}) {
  const resolvedParams = await searchParams;
  const data = getAppData();

  const roomQ = (resolvedParams.room || "").trim().toUpperCase();
  const dateQ = (resolvedParams.date || "").trim();
  const slotQ = (resolvedParams.slot || "").trim();
  const courseQ = (resolvedParams.course || "").trim().toUpperCase();

  let filtered = data.roomAllocations;
  if (roomQ) filtered = filtered.filter((ra) => ra.roomId.toUpperCase().includes(roomQ));
  if (dateQ) filtered = filtered.filter((ra) => ra.date.toLowerCase().includes(dateQ.toLowerCase()));
  if (slotQ) filtered = filtered.filter((ra) => ra.slot.toLowerCase() === slotQ.toLowerCase());
  if (courseQ) filtered = filtered.filter((ra) => ra.courses.some((c) => c.toUpperCase().includes(courseQ)));

  const hasActiveFilters = Boolean(roomQ || dateQ || slotQ || courseQ);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="border-b pb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-1">
          Autumn 2026 End-Semester Examinations
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Building2 className="h-8 w-8 text-blue-700" />
          <span>Room-Wise Examination Allocations</span>
        </h1>
        <p className="text-slate-600 mt-1">
          Search across all {data.rooms.length} examination rooms and lecture theatres to view scheduled courses and student seating capacity.
        </p>
      </div>

      {/* Filter Card */}
      <Card className="shadow-sm border-slate-200">
        <CardContent className="pt-6">
          <form action="/rooms" method="GET" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 block">
                Room No
              </label>
              <Input
                name="room"
                defaultValue={roomQ}
                placeholder="e.g. 102, LT001, 502..."
                className="bg-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 block">
                Exam Date
              </label>
              <Input
                name="date"
                defaultValue={dateQ}
                placeholder="e.g. 21 November..."
                className="bg-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 block">
                Session
              </label>
              <Input
                name="slot"
                defaultValue={slotQ}
                placeholder="Morning or Evening"
                className="bg-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 block">
                Course Code
              </label>
              <Input
                name="course"
                defaultValue={courseQ}
                placeholder="e.g. EE1101, CE2101..."
                className="bg-white text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white flex-1 font-semibold">
                <Search className="h-4 w-4 mr-1.5" /> Filter
              </Button>
              {hasActiveFilters && (
                <Link href="/rooms">
                  <Button variant="outline" className="px-3" title="Clear Filters">
                    <X className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Quick Room Jump Pill List */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
          All {data.rooms.length} Examination Rooms:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {data.rooms.map((r) => (
            <Link key={r} href={`/rooms?room=${encodeURIComponent(r)}`}>
              <Badge
                variant="outline"
                className={`px-2.5 py-1 text-xs font-mono cursor-pointer transition-colors ${
                  roomQ === r.toUpperCase()
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                }`}
              >
                {r}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Showing <strong>{filtered.length}</strong> room allocation records</span>
          {hasActiveFilters && (
            <Link href="/rooms" className="text-blue-600 hover:underline text-xs">
              Reset all filters
            </Link>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8 space-y-3">
            <p className="text-slate-600 font-medium">No room allocations match the specified filters.</p>
            <Link href="/rooms">
              <Button variant="outline" size="sm">Clear Filters</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((ra, idx) => (
              <Card key={idx} className="shadow-sm hover:shadow-md transition-shadow border-slate-200">
                <CardHeader className="bg-slate-50 border-b pb-3 pt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl font-extrabold text-slate-900 font-mono">
                        {ra.roomId}
                      </CardTitle>
                      <p className="text-xs font-medium text-slate-600 mt-1 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {ra.date}
                      </p>
                    </div>
                    <Badge variant={ra.slot === 'Morning' ? 'default' : 'secondary'} className="text-xs px-2.5 py-0.5">
                      {ra.slot}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Courses Allocated
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {ra.courses.map((c) => (
                        <Link key={c} href={`/courses/${encodeURIComponent(c)}`}>
                          <Badge variant="outline" className="text-xs font-mono bg-white hover:bg-blue-50 cursor-pointer">
                            {c}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Students Seated
                      </span>
                      <span className="text-2xl font-extrabold text-slate-900 font-mono">
                        {ra.rolls.length}
                      </span>
                    </div>
                    <Link
                      href={`/room/${encodeURIComponent(ra.roomId)}/${encodeURIComponent(ra.date)}/${encodeURIComponent(ra.slot)}`}
                    >
                      <Button variant="secondary" size="sm" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold">
                        View Seating Plan
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
