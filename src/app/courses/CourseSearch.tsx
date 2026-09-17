"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

export default function CourseSearch() {
  const [course, setCourse] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (course.trim()) {
      router.push(`/courses/${encodeURIComponent(course.trim().toUpperCase())}`);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-sm font-medium text-slate-700 mb-1 block">Course Code</label>
            <Input 
              value={course}
              onChange={e => setCourse(e.target.value)}
              placeholder="e.g. CE2101" 
              required 
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
            <Search className="h-4 w-4 mr-2" /> Search
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
