"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

export default function Home() {
  const [roll, setRoll] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (roll.trim()) {
      router.push(`/student/${encodeURIComponent(roll.trim().toUpperCase())}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md shadow-lg border-blue-100">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-blue-900">Autumn 2026</CardTitle>
          <CardTitle className="text-xl text-slate-700">Mid-Semester Examination</CardTitle>
          <CardDescription className="text-md mt-2">
            Find your exam date, room and slot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input 
                type="text"
                placeholder="Enter Roll Number (e.g. 2501CE01)" 
                className="pl-10 h-12 text-lg"
                value={roll}
                onChange={(e) => setRoll(e.target.value)}
                required
              />
            </div>
            <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-lg">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
