import { compareStudents } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ roll1?: string, roll2?: string }> }) {
  const resolvedParams = await searchParams;
  const roll1 = resolvedParams.roll1?.toUpperCase() || "";
  const roll2 = resolvedParams.roll2?.toUpperCase() || "";
  
  let result = null;
  let error = "";
  if (roll1 && roll2) {
    try {
      result = compareStudents(roll1, roll2);
    } catch (e: any) {
      error = "An error occurred during comparison.";
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Compare Students</h1>
      
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <form action="/compare" method="GET" className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Student 1 Roll No</label>
              <Input 
                name="roll1"
                defaultValue={roll1} 
                placeholder="e.g. 2501CE01" 
                required 
              />
            </div>
            <div className="flex-1 w-full">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Student 2 Roll No</label>
              <Input 
                name="roll2"
                defaultValue={roll2} 
                placeholder="e.g. 2503CE04" 
                required 
              />
            </div>
            <Button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
              <Search className="h-4 w-4 mr-2" /> Compare
            </Button>
          </form>
          {error && <p className="text-red-600 mt-4 text-sm font-medium">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-8">
          <Card className="shadow-sm border-t-4 border-t-blue-600">
            <CardHeader>
              <CardTitle>Common Exams</CardTitle>
            </CardHeader>
            <CardContent>
              {result.commonExams.length === 0 ? (
                <p className="text-slate-500 italic">No common exams found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Slot</TableHead>
                        <TableHead>Roll 1 Room ({result.roll1})</TableHead>
                        <TableHead>Roll 2 Room ({result.roll2})</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.commonExams.map((c: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell className="font-semibold">{c.exam.courseCode}</TableCell>
                          <TableCell>{c.exam.date}</TableCell>
                          <TableCell>{c.exam.slot}</TableCell>
                          <TableCell className={c.sameRoom ? "font-bold text-green-700" : ""}>{c.roll1Room}</TableCell>
                          <TableCell className={c.sameRoom ? "font-bold text-green-700" : ""}>{c.roll2Room}</TableCell>
                          <TableCell>
                            {c.sameRoom ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">SAME ROOM</Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">SAME EXAM &mdash; DIFFERENT ROOMS</Badge>
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

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-sm border-t-4 border-t-slate-400">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Only {result.roll1}</CardTitle>
              </CardHeader>
              <CardContent>
                {result.onlyRoll1.length === 0 ? (
                  <p className="text-slate-500 italic">No exclusive exams.</p>
                ) : (
                  <ul className="space-y-3">
                    {result.onlyRoll1.map((c: any, i: number) => (
                      <li key={i} className="flex justify-between border-b pb-2 last:border-0 text-sm">
                        <span className="font-semibold">{c.exam.courseCode}</span>
                        <span className="text-slate-600">{c.exam.date} ({c.exam.slot})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-t-4 border-t-slate-400">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Only {result.roll2}</CardTitle>
              </CardHeader>
              <CardContent>
                {result.onlyRoll2.length === 0 ? (
                  <p className="text-slate-500 italic">No exclusive exams.</p>
                ) : (
                  <ul className="space-y-3">
                    {result.onlyRoll2.map((c: any, i: number) => (
                      <li key={i} className="flex justify-between border-b pb-2 last:border-0 text-sm">
                        <span className="font-semibold">{c.exam.courseCode}</span>
                        <span className="text-slate-600">{c.exam.date} ({c.exam.slot})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
